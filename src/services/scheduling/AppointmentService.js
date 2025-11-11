/**
 * Appointment Service
 * Handles appointment creation and management
 */

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<{success: boolean, appointmentId?: string, error?: string}>}
 */
export async function createAppointment(appointmentData) {
  try {
    // Verify the availability slot is not already booked
    if (appointmentData.availabilitySlotId) {
      const slotDoc = await getDoc(
        doc(db, 'clinicianAvailabilities', appointmentData.availabilitySlotId)
      );
      
      if (!slotDoc.exists()) {
        return { success: false, error: 'Availability slot not found' };
      }
      
      const slotData = slotDoc.data();
      if (slotData.isBooked) {
        return { success: false, error: 'This time slot is already booked' };
      }
    }
    
    // Create appointment document
    const appointmentRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Mark availability slot as booked
    if (appointmentData.availabilitySlotId) {
      await updateDoc(
        doc(db, 'clinicianAvailabilities', appointmentData.availabilitySlotId),
        {
          isBooked: true,
          bookedBy: appointmentRef.id,
          updatedAt: serverTimestamp(),
        }
      );
    }
    
    console.log('✅ Appointment created:', appointmentRef.id);
    return { success: true, appointmentId: appointmentRef.id };
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get appointment by ID
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function getAppointment(appointmentId) {
  try {
    const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
    
    if (!appointmentDoc.exists()) {
      return { success: false, error: 'Appointment not found' };
    }
    
    return {
      success: true,
      data: {
        id: appointmentDoc.id,
        ...appointmentDoc.data(),
      },
    };
  } catch (error) {
    console.error('❌ Error getting appointment:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get appointments for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, appointments?: Array, error?: string}>}
 */
export async function getUserAppointments(userId) {
  try {
    // Get user's onboarding application to find patientId
    const applicationsQuery = query(
      collection(db, 'onboardingApplications'),
      where('userId', '==', userId),
      where('status', '==', 'complete')
    );
    
    const applicationsSnapshot = await getDocs(applicationsQuery);
    if (applicationsSnapshot.empty) {
      return { success: true, appointments: [] };
    }
    
    const application = applicationsSnapshot.docs[0].data();
    const patientId = application.patientId;
    
    if (!patientId) {
      return { success: true, appointments: [] };
    }
    
    // Get appointments for this patient
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId)
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = [];
    
    appointmentsSnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return { success: true, appointments };
  } catch (error) {
    console.error('❌ Error getting user appointments:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel an appointment
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function cancelAppointment(appointmentId) {
  try {
    const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
    
    if (!appointmentDoc.exists()) {
      return { success: false, error: 'Appointment not found' };
    }
    
    const appointmentData = appointmentDoc.data();
    
    // Update appointment status
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
    
    // Free up the availability slot
    if (appointmentData.availabilitySlotId) {
      await updateDoc(
        doc(db, 'clinicianAvailabilities', appointmentData.availabilitySlotId),
        {
          isBooked: false,
          bookedBy: null,
          updatedAt: serverTimestamp(),
        }
      );
    }
    
    console.log('✅ Appointment cancelled:', appointmentId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error cancelling appointment:', error);
    return { success: false, error: error.message };
  }
}

export default {
  createAppointment,
  getAppointment,
  getUserAppointments,
  cancelAppointment,
};


