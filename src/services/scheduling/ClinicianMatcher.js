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
 * Format clinician name from various possible fields
 * @param {Object} clinician - Clinician data object
 * @returns {string} Formatted display name
 */
export function formatClinicianName(clinician) {
  if (!clinician) return 'Clinician';
  
  // Try direct name fields first
  let displayName = clinician.name || clinician.displayName;
  if (displayName) return displayName;
  
  // Try to construct from firstname/lastname
  const firstName = clinician.firstname || clinician.firstName;
  const lastName = clinician.lastname || clinician.lastName;
  const preferredName = clinician.preferredname || clinician.preferredName;
  
  if (preferredName && (firstName || lastName)) {
    displayName = `${preferredName} ${lastName || ''}`.trim();
  } else if (firstName && lastName) {
    displayName = `${firstName} ${lastName}`;
  } else if (firstName) {
    displayName = firstName;
  } else if (lastName) {
    displayName = lastName;
  }
  
  // Try parsing profiledata if it's a JSON string
  if (!displayName && clinician.profiledata) {
    try {
      const profileData = typeof clinician.profiledata === 'string' 
        ? JSON.parse(clinician.profiledata) 
        : clinician.profiledata;
      displayName = profileData.full_name || profileData.name || displayName;
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  return displayName || 'Clinician';
}

/**
 * Calculate fit score for a clinician based on multiple factors
 * @param {Object} clinician - Clinician data
 * @param {Object} patientData - Patient data including insurance
 * @param {Array} availableSlots - Available time slots for this clinician
 * @returns {number} Fit score (0-100)
 */
function calculateFitScore(clinician, patientData, availableSlots) {
  let score = 0;
  
  // Insurance match (40 points out of 100)
  if (patientData.insuranceProvider && clinician.acceptedInsurances) {
    const insuranceMatch = clinician.acceptedInsurances.some(
      insurance => insurance.toLowerCase() === patientData.insuranceProvider.toLowerCase()
    );
    if (insuranceMatch) {
      score += 40;
    }
  }
  
  // Availability match (30 points out of 100)
  if (availableSlots && availableSlots.length > 0) {
    // More available slots = higher score (max 30 points)
    // Formula: min(30, slots * 5) - gives 5 points per slot up to 30 max
    const slotScore = Math.min(30, availableSlots.length * 5);
    score += slotScore;
  }
  
  // Specialty match (20 points out of 100) - if patient has specific needs
  if (patientData.preferredSpecialty && clinician.specialties) {
    const specialtyMatch = clinician.specialties.some(
      specialty => specialty.toLowerCase().includes(patientData.preferredSpecialty.toLowerCase())
    );
    if (specialtyMatch) {
      score += 20;
    }
  }
  
  // Rating bonus (10 points out of 100)
  if (clinician.rating) {
    // Rating is typically 0-5, so multiply by 2 to get 0-10 points
    score += Math.min(10, clinician.rating * 2);
  }
  
  // Score is already out of 100 (max possible: 40 + 30 + 20 + 10 = 100)
  // Return as percentage (0-100)
  return Math.min(100, Math.round(score));
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
    console.log(`🔍 Getting availability for clinician: ${clinicianId}`);
    
    // Query by clinician ID only (we'll filter dates in memory since data might use different field names)
    const availabilityQuery = query(
      collection(db, 'clinicianAvailabilities'),
      where('careProviderProfileId', '==', clinicianId)
    );
    
    const snapshot = await getDocs(availabilityQuery);
    console.log(`   📋 Found ${snapshot.size} availability documents for clinician ${clinicianId}`);
    
    const slots = [];
    let skippedCount = 0;
    let skippedReasons = {
      noStartTime: 0,
      noEndTime: 0,
      invalidDate: 0,
      outOfRange: 0,
      deleted: 0,
      booked: 0
    };
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Handle both formats: startTime/endTime (Timestamp) or rangestart/rangeend (string)
      let startTime, endTime;
      
      if (data.startTime) {
        // Firestore Timestamp format
        startTime = data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime);
      } else if (data.rangestart || data.rangeStart) {
        // String format from CSV
        const startStr = data.rangestart || data.rangeStart;
        startTime = new Date(startStr);
      } else {
        skippedCount++;
        skippedReasons.noStartTime++;
        return; // Skip if no start time
      }
      
      if (data.endTime) {
        endTime = data.endTime?.toDate ? data.endTime.toDate() : new Date(data.endTime);
      } else if (data.rangeend || data.rangeEnd) {
        const endStr = data.rangeend || data.rangeEnd;
        endTime = new Date(endStr);
      } else {
        skippedCount++;
        skippedReasons.noEndTime++;
        return; // Skip if no end time
      }
      
      // Skip if invalid dates
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        skippedCount++;
        skippedReasons.invalidDate++;
        return;
      }
      
      // Skip date filtering for demo (show all dates including past)
      // if (startTime < startDate) {
      //   skippedCount++;
      //   skippedReasons.outOfRange++;
      //   return;
      // }
      
      // Skip deleted slots
      if (data.deletedat || data.deletedAt) {
        skippedCount++;
        skippedReasons.deleted++;
        return;
      }
      
      slots.push({
        id: doc.id,
        clinicianId,
        startTime,
        endTime,
        isBooked: data.isBooked || false,
        availabilitySlotId: doc.id,
      });
    });
    
    const bookedCount = slots.filter(slot => slot.isBooked).length;
    skippedReasons.booked = bookedCount;
    
    // Log detailed reasons for first clinician with documents
    if (snapshot.size > 0 && skippedCount > 0) {
      console.log(`   ⚠️ Skipped ${skippedCount} slots for clinician ${clinicianId}:`, skippedReasons);
      // Log a sample of the first skipped document to see what fields it has
      const firstDoc = snapshot.docs[0];
      const firstData = firstDoc.data();
      console.log(`   📄 Sample document fields:`, Object.keys(firstData));
      // Try to parse the dates to see what they actually are
      let parsedStart, parsedEnd;
      try {
        if (firstData.rangestart || firstData.rangeStart) {
          const startStr = firstData.rangestart || firstData.rangeStart;
          parsedStart = new Date(startStr);
        }
        if (firstData.rangeend || firstData.rangeEnd) {
          const endStr = firstData.rangeend || firstData.rangeEnd;
          parsedEnd = new Date(endStr);
        }
      } catch (e) {
        console.error('   ❌ Error parsing dates:', e);
      }
      
      // Log ALL documents to see date patterns
      console.log(`   📅 All ${snapshot.size} documents date analysis:`);
      snapshot.docs.slice(0, 5).forEach((doc, idx) => {
        const data = doc.data();
        const rawStart = data.rangestart || data.rangeStart || data.startTime;
        const rawEnd = data.rangeend || data.rangeEnd || data.endTime;
        let parsedStart, parsedEnd;
        try {
          if (rawStart) {
            parsedStart = rawStart?.toDate ? rawStart.toDate() : new Date(rawStart);
          }
          if (rawEnd) {
            parsedEnd = rawEnd?.toDate ? rawEnd.toDate() : new Date(rawEnd);
          }
        } catch (e) {
          // Ignore
        }
        console.log(`   📄 Doc ${idx + 1}:`, {
          rawStart: typeof rawStart === 'string' ? rawStart : (rawStart?.toDate ? rawStart.toDate().toISOString() : String(rawStart)),
          rawEnd: typeof rawEnd === 'string' ? rawEnd : (rawEnd?.toDate ? rawEnd.toDate().toISOString() : String(rawEnd)),
          parsedStart: parsedStart ? parsedStart.toISOString() : 'INVALID',
          parsedEnd: parsedEnd ? parsedEnd.toISOString() : 'INVALID',
          isInRange: parsedStart ? (parsedStart >= startDate && parsedStart <= endDate) : false,
          daysFromNow: parsedStart ? Math.round((parsedStart - new Date()) / (1000 * 60 * 60 * 24)) : null,
        });
      });
      
      console.log(`   📄 Sample document data:`, {
        hasStartTime: !!firstData.startTime,
        hasEndTime: !!firstData.endTime,
        hasRangeStart: !!(firstData.rangestart || firstData.rangeStart),
        hasRangeEnd: !!(firstData.rangeend || firstData.rangeEnd),
        hasDeletedAt: !!(firstData.deletedat || firstData.deletedAt),
        isBooked: firstData.isBooked,
        careProviderProfileId: firstData.careProviderProfileId,
        rawStart: firstData.rangestart || firstData.rangeStart,
        rawEnd: firstData.rangeend || firstData.rangeEnd,
        parsedStart: parsedStart ? parsedStart.toISOString() : null,
        parsedEnd: parsedEnd ? parsedEnd.toISOString() : null,
        parsedStartValid: parsedStart ? !isNaN(parsedStart.getTime()) : false,
        parsedEndValid: parsedEnd ? !isNaN(parsedEnd.getTime()) : false,
        searchStartDate: startDate.toISOString(),
        searchEndDate: endDate.toISOString(),
        isStartInRange: parsedStart ? (parsedStart >= startDate && parsedStart <= endDate) : false,
        isStartBefore: parsedStart ? parsedStart < startDate : false,
        isStartAfter: parsedStart ? parsedStart > endDate : false,
      });
    }
    
    console.log(`   📊 Processed ${snapshot.size} documents:`, {
      valid: slots.length,
      booked: bookedCount,
      skipped: skippedCount,
      reasons: skippedReasons
    });
    
    // Filter out booked slots and sort by time
    const availableSlots = slots
      .filter(slot => !slot.isBooked)
      .sort((a, b) => a.startTime - b.startTime);
    
    console.log(`   ✅ Returning ${availableSlots.length} available slots`);
    return availableSlots;
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
export async function findMatchingClinicians(patientData, startDate = new Date(), endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) {
  try {
    console.log('🔍 Finding matching clinicians...', { 
      insuranceProvider: patientData?.insuranceProvider,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    // First, get clinicians by insurance
    let clinicians = [];
    
    if (patientData.insuranceProvider) {
      clinicians = await matchCliniciansByInsurance(patientData.insuranceProvider);
      console.log(`✅ Found ${clinicians.length} clinicians matching insurance: ${patientData.insuranceProvider}`);
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
      console.log(`✅ Found ${clinicians.length} total clinicians (no insurance filter)`);
    }
    
    if (clinicians.length === 0) {
      console.warn('⚠️ No clinicians found!');
      return [];
    }
    
    // Get availability for each clinician and calculate fit scores
    const cliniciansWithAvailability = await Promise.all(
      clinicians.map(async (clinician) => {
        const availableSlots = await getClinicianAvailability(
          clinician.id,
          startDate,
          endDate
        );
        
        console.log(`📅 Clinician ${clinician.id}: ${availableSlots.length} available slots`);
        
        const fitScore = calculateFitScore(clinician, patientData, availableSlots);
        
        // Format clinician name using shared utility
        const displayName = formatClinicianName(clinician);
        
        // Parse bio from profiledata if needed
        let bio = clinician.bio;
        if (!bio && clinician.profiledata) {
          try {
            const profileData = typeof clinician.profiledata === 'string' 
              ? JSON.parse(clinician.profiledata) 
              : clinician.profiledata;
            bio = profileData.bio || bio;
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        // Fix bio text to use correct clinician name (replace any "My name is X" with actual name)
        if (bio && displayName && displayName !== 'Clinician') {
          // Replace patterns like "My name is [Name]" or "Hello! My name is [Name]" with actual name
          bio = bio.replace(/my name is [^.!,\n]+/gi, `my name is ${displayName.split(' ')[0]}`);
          bio = bio.replace(/hello! my name is [^.!,\n]+/gi, `Hello! My name is ${displayName.split(' ')[0]}`);
        }
        
        return {
          ...clinician,
          name: displayName || 'Clinician',
          displayName: displayName || 'Clinician',
          bio: bio,
          availableSlots,
          fitScore,
          availableSlotCount: availableSlots.length,
        };
      })
    );
    
    // Log summary before filtering
    const totalClinicians = cliniciansWithAvailability.length;
    const cliniciansWithSlots = cliniciansWithAvailability.filter(c => c.availableSlots.length > 0);
    const cliniciansWithoutSlots = cliniciansWithAvailability.filter(c => c.availableSlots.length === 0);
    
    console.log(`📊 Summary: ${totalClinicians} total clinicians`);
    console.log(`   ✅ ${cliniciansWithSlots.length} with available slots`);
    console.log(`   ❌ ${cliniciansWithoutSlots.length} without available slots`);
    
    if (cliniciansWithoutSlots.length > 0) {
      console.log('⚠️ Clinicians without slots (first 3):', 
        cliniciansWithoutSlots.slice(0, 3).map(c => ({ id: c.id, name: c.name || c.displayName }))
      );
    }
    
    // Filter out clinicians with no availability and sort by fit score
    const result = cliniciansWithAvailability
      .filter(clinician => clinician.availableSlots.length > 0)
      .sort((a, b) => b.fitScore - a.fitScore);
    
    console.log(`✅ Returning ${result.length} clinicians with availability`);
    return result;
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
      const clinicianData = {
        id: clinicianDoc.id,
        ...clinicianDoc.data(),
      };
      // Add formatted name for consistency
      const displayName = formatClinicianName(clinicianData);
      clinicianData.displayName = displayName;
      clinicianData.name = displayName; // Also set name for backward compatibility
      
      // Fix bio text to use correct clinician name
      let bio = clinicianData.bio;
      if (!bio && clinicianData.profiledata) {
        try {
          const profileData = typeof clinicianData.profiledata === 'string' 
            ? JSON.parse(clinicianData.profiledata) 
            : clinicianData.profiledata;
          bio = profileData.bio || bio;
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      if (bio && displayName && displayName !== 'Clinician') {
        // Replace patterns like "My name is [Name]" or "Hello! My name is [Name]" with actual name
        bio = bio.replace(/my name is [^.!,\n]+/gi, `my name is ${displayName.split(' ')[0]}`);
        bio = bio.replace(/hello! my name is [^.!,\n]+/gi, `Hello! My name is ${displayName.split(' ')[0]}`);
        clinicianData.bio = bio;
      }
      
      return clinicianData;
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
  formatClinicianName,
};

