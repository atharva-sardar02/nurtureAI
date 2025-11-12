/**
 * Scheduling Services Barrel Export
 * Centralizes exports to prevent circular dependencies
 */

// Re-export all functions from individual files
export {
  matchCliniciansByInsurance,
  getClinicianAvailability,
  findMatchingClinicians,
  getClinicianById,
} from './ClinicianMatcher';

export {
  createAppointment,
  getAppointment,
  getUserAppointments,
  cancelAppointment,
} from './AppointmentService';

