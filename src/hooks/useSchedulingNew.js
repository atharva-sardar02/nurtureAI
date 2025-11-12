/**
 * Scheduling Hook Facade
 * Provides a clean interface without circular dependencies
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import { getOnboardingApplication } from '@/services/firebase/firestore';

export function useScheduling() {
  const { user } = useAuth();
  const [clinicians, setClinicians] = useState([]);
  const [selectedClinician, setSelectedClinician] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [appointmentsWithClinicians, setAppointmentsWithClinicians] = useState([]);

  // Load services lazily
  const [services, setServices] = useState(null);
  
  useEffect(() => {
    // Load scheduling services once
    import('@/services/scheduling').then((module) => {
      setServices(module);
    });
  }, []);

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
  const searchClinicians = useCallback(async (startDate = new Date(), endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) => {
    if (!patientData || !services) {
      await loadPatientData();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const matchingClinicians = await services.findMatchingClinicians(patientData, startDate, endDate);
      setClinicians(matchingClinicians);
    } catch (err) {
      console.error('Error searching clinicians:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientData, loadPatientData, services]);

  /**
   * Select a clinician
   */
  const selectClinician = useCallback(async (clinicianId) => {
    if (!services) return;
    
    setLoading(true);
    try {
      const clinician = await services.getClinicianById(clinicianId);
      if (clinician) {
        // Name is already formatted by getClinicianById using formatClinicianName
        
        // Load availability slots for this clinician
        const startDate = new Date();
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const availableSlots = await services.getClinicianAvailability(clinicianId, startDate, endDate);
        
        clinician.availableSlots = availableSlots;
        
        setSelectedClinician(clinician);
        setSelectedSlot(null); // Reset slot selection
      }
    } catch (err) {
      console.error('Error selecting clinician:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [services]);

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
    if (!selectedClinician || !selectedSlot || !patientData || !services) {
      throw new Error('Missing required information for booking');
    }

    // Check if user has an active appointment
    if (activeAppointment) {
      throw new Error('You already have an active appointment. Please cancel it before booking a new one.');
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

      const result = await services.createAppointment(appointmentData);
      
      if (result.success) {
        // Reload appointments after booking
        await loadAppointments();
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
  }, [selectedClinician, selectedSlot, patientData, activeAppointment, services]);

  /**
   * Load existing appointments
   */
  const loadAppointments = useCallback(async () => {
    if (!user || !services) return;

    try {
      console.log('🔄 Loading appointments for user:', user.uid);
      const result = await services.getUserAppointments(user.uid);
      console.log('📋 Appointments result:', result);
      
      if (result.success && result.appointments) {
        const appointments = result.appointments;
        console.log(`✅ Found ${appointments.length} appointments`);
        setExistingAppointments(appointments);
        
        // Find active appointment (not cancelled or completed)
        const active = appointments.find(apt => 
          apt.status !== 'cancelled' && 
          apt.status !== 'completed' &&
          (!apt.dateTime || (apt.dateTime && apt.dateTime.toDate && apt.dateTime.toDate() >= new Date()))
        );
        console.log('🎯 Active appointment:', active);
        setActiveAppointment(active || null);

        // Load clinician info for appointments
        if (appointments.length > 0) {
          try {
            const appointmentsWithData = await Promise.all(
              appointments.map(async (apt) => {
                try {
                  if (!apt.clinicianId) {
                    return { ...apt, clinicianName: 'Clinician' };
                  }
                  const clinician = await services.getClinicianById(apt.clinicianId);
                  // Use the formatted name from getClinicianById (which uses formatClinicianName)
                  const clinicianName = clinician?.displayName || clinician?.name || 'Clinician';
                  return {
                    ...apt,
                    clinicianName,
                  };
                } catch (err) {
                  console.error('Error loading clinician for appointment:', err);
                  return {
                    ...apt,
                    clinicianName: 'Clinician',
                  };
                }
              })
            );
            setAppointmentsWithClinicians(appointmentsWithData);
          } catch (err) {
            console.error('Error loading clinician names:', err);
            // Still show appointments even if clinician loading fails
            setAppointmentsWithClinicians(appointments.map(apt => ({ ...apt, clinicianName: 'Clinician' })));
          }
        } else {
          setAppointmentsWithClinicians([]);
        }
      } else {
        console.log('⚠️ No appointments found or error:', result.error);
        setExistingAppointments([]);
        setAppointmentsWithClinicians([]);
      }
    } catch (err) {
      console.error('❌ Error loading appointments:', err);
      setExistingAppointments([]);
      setAppointmentsWithClinicians([]);
    }
  }, [user, services]);

  /**
   * Cancel an appointment
   */
  const cancelExistingAppointment = useCallback(async (appointmentId) => {
    if (!services) return { success: false, error: 'Services not loaded' };
    
    setLoading(true);
    setError(null);

    try {
      const result = await services.cancelAppointment(appointmentId);
      if (result.success) {
        // Reload appointments
        await loadAppointments();
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to cancel appointment');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [services, loadAppointments]);

  /**
   * Load patient data and appointments on mount
   */
  useEffect(() => {
    if (user && services) {
      console.log('🎯 User and services loaded, loading patient data and appointments...');
      loadPatientData().then((patientData) => {
        console.log('✅ Patient data loaded:', patientData);
        loadAppointments();
      });
    } else {
      console.log('⚠️ Waiting for user or services...', { user: !!user, services: !!services });
    }
  }, [user, services]); // Only depend on user and services, not the functions

  return {
    // State
    clinicians,
    selectedClinician,
    selectedSlot,
    loading: loading || !services,
    error,
    patientData,
    existingAppointments,
    activeAppointment,
    appointmentsWithClinicians,

    // Actions
    searchClinicians,
    selectClinician,
    selectSlot,
    bookAppointment,
    loadPatientData,
    loadAppointments,
    cancelExistingAppointment,
  };
}

