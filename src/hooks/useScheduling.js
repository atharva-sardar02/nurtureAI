/**
 * useScheduling Hook
 * Manages scheduling state and clinician matching
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import { findMatchingClinicians, getClinicianById } from '@/services/scheduling/ClinicianMatcher';
import { createAppointment, getAppointment } from '@/services/scheduling/AppointmentService';
import { getOnboardingApplication } from '@/services/firebase/firestore';

export function useScheduling() {
  const { user } = useAuth();
  const [clinicians, setClinicians] = useState([]);
  const [selectedClinician, setSelectedClinician] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);

  /**
   * Load patient data from onboarding application
   */
  const loadPatientData = useCallback(async () => {
    if (!user) return;

    try {
      const result = await getOnboardingApplication(user.uid);
      if (result.success && result.data) {
        const app = result.data;
        setPatientData({
          insuranceProvider: app.insuranceData?.provider || null,
          patientId: app.patientId || null,
          applicationId: app.id,
        });
        return app;
      }
    } catch (err) {
      console.error('Error loading patient data:', err);
    }
    return null;
  }, [user]);

  /**
   * Find matching clinicians
   */
  const searchClinicians = useCallback(async (startDate = new Date(), endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) => {
    if (!patientData) {
      await loadPatientData();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const matchingClinicians = await findMatchingClinicians(patientData, startDate, endDate);
      setClinicians(matchingClinicians);
    } catch (err) {
      console.error('Error searching clinicians:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientData, loadPatientData]);

  /**
   * Select a clinician
   */
  const selectClinician = useCallback(async (clinicianId) => {
    setLoading(true);
    try {
      const clinician = await getClinicianById(clinicianId);
      if (clinician) {
        setSelectedClinician(clinician);
        setSelectedSlot(null); // Reset slot selection
      }
    } catch (err) {
      console.error('Error selecting clinician:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Select a time slot
   */
  const selectSlot = useCallback((slot) => {
    setSelectedSlot(slot);
  }, []);

  /**
   * Book appointment
   */
  const bookAppointment = useCallback(async () => {
    if (!selectedClinician || !selectedSlot || !patientData) {
      throw new Error('Missing required information for booking');
    }

    setLoading(true);
    setError(null);

    try {
      const appointmentData = {
        applicationId: patientData.applicationId,
        patientId: patientData.patientId,
        clinicianId: selectedClinician.id,
        dateTime: Timestamp.fromDate(selectedSlot.startTime),
        availabilitySlotId: selectedSlot.availabilitySlotId || selectedSlot.id,
        status: 'pending',
      };

      const result = await createAppointment(appointmentData);
      
      if (result.success) {
        return { success: true, appointmentId: result.appointmentId };
      } else {
        throw new Error(result.error || 'Failed to create appointment');
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [selectedClinician, selectedSlot, patientData]);

  /**
   * Load patient data on mount
   */
  useEffect(() => {
    if (user) {
      loadPatientData();
    }
  }, [user, loadPatientData]);

  return {
    // State
    clinicians,
    selectedClinician,
    selectedSlot,
    loading,
    error,
    patientData,

    // Actions
    searchClinicians,
    selectClinician,
    selectSlot,
    bookAppointment,
    loadPatientData,
  };
}

