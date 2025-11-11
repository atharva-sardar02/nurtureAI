/**
 * Clinician Matcher Service
 * Matches patients with available clinicians based on insurance, availability, and preferences
 */

import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';

/**
 * Calculate fit score for a clinician based on multiple factors
 * @param {Object} clinician - Clinician data
 * @param {Object} patientData - Patient data including insurance
 * @param {Array} availableSlots - Available time slots for this clinician
 * @returns {number} Fit score (0-100)
 */
function calculateFitScore(clinician, patientData, availableSlots) {
  let score = 0;
  
  // Insurance match (40 points)
  if (patientData.insuranceProvider && clinician.acceptedInsurances) {
    const insuranceMatch = clinician.acceptedInsurances.some(
      insurance => insurance.toLowerCase() === patientData.insuranceProvider.toLowerCase()
    );
    if (insuranceMatch) {
      score += 40;
    }
  }
  
  // Availability match (30 points)
  if (availableSlots && availableSlots.length > 0) {
    // More available slots = higher score
    const slotScore = Math.min(30, availableSlots.length * 5);
    score += slotScore;
  }
  
  // Specialty match (20 points) - if patient has specific needs
  if (patientData.preferredSpecialty && clinician.specialties) {
    const specialtyMatch = clinician.specialties.some(
      specialty => specialty.toLowerCase().includes(patientData.preferredSpecialty.toLowerCase())
    );
    if (specialtyMatch) {
      score += 20;
    }
  }
  
  // Rating bonus (10 points)
  if (clinician.rating) {
    score += Math.min(10, clinician.rating * 2);
  }
  
  return Math.min(100, score);
}

/**
 * Match clinicians based on patient insurance
 * @param {string} insuranceProvider - Patient's insurance provider name (e.g., "Aetna", "United Healthcare")
 * @returns {Promise<Array>} Array of matching clinicians
 */
export async function matchCliniciansByInsurance(insuranceProvider) {
  try {
    // First, find the insurance ID from credentialedInsurances collection
    // The insurance provider name needs to match against the insurance data
    const insuranceQuery = query(
      collection(db, 'credentialedInsurances')
    );
    
    const insuranceSnapshot = await getDocs(insuranceQuery);
    let insuranceId = null;
    
    // Find insurance ID by matching provider name
    insuranceSnapshot.forEach((doc) => {
      const data = doc.data();
      // Check various fields that might contain the insurance name
      const insuranceName = data.name || data.provider || data.insuranceName || '';
      if (insuranceName.toLowerCase().includes(insuranceProvider.toLowerCase()) ||
          insuranceProvider.toLowerCase().includes(insuranceName.toLowerCase())) {
        insuranceId = doc.id;
      }
    });
    
    if (!insuranceId) {
      console.warn(`Insurance provider "${insuranceProvider}" not found in credentialedInsurances`);
      return [];
    }
    
    // Query clinician_credentialed_insurances junction table
    const clinicianInsuranceQuery = query(
      collection(db, 'clinicianCredentialedInsurances'),
      where('insuranceId', '==', insuranceId)
    );
    
    const clinicianInsuranceSnapshot = await getDocs(clinicianInsuranceQuery);
    const clinicianIds = [];
    
    clinicianInsuranceSnapshot.forEach((doc) => {
      const data = doc.data();
      // Field name from CSV: care_provider_profile_id -> careProviderProfileId
      const clinicianId = data.careProviderProfileId || data.care_provider_profile_id;
      if (clinicianId) {
        clinicianIds.push(clinicianId);
      }
    });
    
    if (clinicianIds.length === 0) {
      return [];
    }
    
    // Get clinician details
    const clinicians = [];
    for (const clinicianId of clinicianIds) {
      const clinicianDoc = await getDoc(doc(db, 'clinicians', clinicianId));
      if (clinicianDoc.exists()) {
        const clinicianData = clinicianDoc.data();
        clinicians.push({
          id: clinicianDoc.id,
          ...clinicianData,
          // Store accepted insurances for display
          acceptedInsurances: [insuranceProvider],
        });
      }
    }
    
    return clinicians;
  } catch (error) {
    console.error('Error matching clinicians by insurance:', error);
    return [];
  }
}

/**
 * Get available time slots for a clinician
 * @param {string} clinicianId - Clinician ID
 * @param {Date} startDate - Start date for availability search
 * @param {Date} endDate - End date for availability search
 * @returns {Promise<Array>} Array of available time slots
 */
export async function getClinicianAvailability(clinicianId, startDate, endDate) {
  try {
    // Convert dates to Firestore Timestamps
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const availabilityQuery = query(
      collection(db, 'clinicianAvailabilities'),
      where('careProviderProfileId', '==', clinicianId),
      where('startTime', '>=', startTimestamp),
      where('startTime', '<=', endTimestamp)
    );
    
    const snapshot = await getDocs(availabilityQuery);
    const slots = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const startTime = data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime);
      const endTime = data.endTime?.toDate ? data.endTime.toDate() : new Date(data.endTime);
      
      slots.push({
        id: doc.id,
        clinicianId,
        startTime,
        endTime,
        isBooked: data.isBooked || false,
        availabilitySlotId: doc.id,
      });
    });
    
    // Filter out booked slots and sort by time
    return slots
      .filter(slot => !slot.isBooked)
      .sort((a, b) => a.startTime - b.startTime);
  } catch (error) {
    console.error('Error getting clinician availability:', error);
    return [];
  }
}

/**
 * Get all matching clinicians with availability and fit scores
 * @param {Object} patientData - Patient data including insurance, preferences
 * @param {Date} startDate - Start date for availability search
 * @param {Date} endDate - End date for availability search
 * @returns {Promise<Array>} Array of matched clinicians with scores and availability
 */
export async function findMatchingClinicians(patientData, startDate = new Date(), endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
  try {
    // First, get clinicians by insurance
    let clinicians = [];
    
    if (patientData.insuranceProvider) {
      clinicians = await matchCliniciansByInsurance(patientData.insuranceProvider);
    } else {
      // If no insurance, get all clinicians
      const allCliniciansQuery = query(collection(db, 'clinicians'));
      const snapshot = await getDocs(allCliniciansQuery);
      snapshot.forEach((doc) => {
        clinicians.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    }
    
    // Get availability for each clinician and calculate fit scores
    const cliniciansWithAvailability = await Promise.all(
      clinicians.map(async (clinician) => {
        const availableSlots = await getClinicianAvailability(
          clinician.id,
          startDate,
          endDate
        );
        
        const fitScore = calculateFitScore(clinician, patientData, availableSlots);
        
        return {
          ...clinician,
          availableSlots,
          fitScore,
          availableSlotCount: availableSlots.length,
        };
      })
    );
    
    // Filter out clinicians with no availability and sort by fit score
    return cliniciansWithAvailability
      .filter(clinician => clinician.availableSlots.length > 0)
      .sort((a, b) => b.fitScore - a.fitScore);
  } catch (error) {
    console.error('Error finding matching clinicians:', error);
    return [];
  }
}

/**
 * Get clinician details by ID
 * @param {string} clinicianId - Clinician ID
 * @returns {Promise<Object|null>} Clinician data or null
 */
export async function getClinicianById(clinicianId) {
  try {
    const clinicianDoc = await getDoc(doc(db, 'clinicians', clinicianId));
    if (clinicianDoc.exists()) {
      return {
        id: clinicianDoc.id,
        ...clinicianDoc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting clinician:', error);
    return null;
  }
}

export default {
  matchCliniciansByInsurance,
  getClinicianAvailability,
  findMatchingClinicians,
  getClinicianById,
  calculateFitScore,
};

