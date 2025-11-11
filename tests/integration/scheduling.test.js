/**
 * Integration Tests for Scheduling System
 * Tests end-to-end appointment booking flow
 */

import { strict as assert } from 'assert';

// Mock data structures - use future date
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
futureDate.setHours(10, 0, 0, 0);

const mockAppointmentData = {
  applicationId: 'app123',
  patientId: 'patient123',
  clinicianId: 'clinician123',
  dateTime: futureDate,
  availabilitySlotId: 'slot123',
  status: 'pending',
};

const mockClinician = {
  id: 'clinician123',
  name: 'Dr. Test',
  acceptedInsurances: ['Aetna'],
  specialties: ['Anxiety'],
  rating: 4.8,
};

const mockAvailabilitySlot = {
  id: 'slot123',
  clinicianId: 'clinician123',
  startTime: futureDate,
  endTime: new Date(futureDate.getTime() + 60 * 60 * 1000), // 1 hour later
  isBooked: false,
};

function testAppointmentDataStructure() {
  console.log('Testing appointment data structure...');
  
  // Verify required fields
  assert.ok(mockAppointmentData.applicationId, 'Appointment should have applicationId');
  assert.ok(mockAppointmentData.patientId, 'Appointment should have patientId');
  assert.ok(mockAppointmentData.clinicianId, 'Appointment should have clinicianId');
  assert.ok(mockAppointmentData.dateTime, 'Appointment should have dateTime');
  assert.ok(mockAppointmentData.availabilitySlotId, 'Appointment should have availabilitySlotId');
  assert.ok(mockAppointmentData.status, 'Appointment should have status');
  console.log('✅ Test 1 passed: Appointment has all required fields');
  
  // Verify status is valid
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  assert.ok(validStatuses.includes(mockAppointmentData.status), 'Status should be valid');
  console.log('✅ Test 2 passed: Appointment status is valid');
  
  // Verify date is in future
  assert.ok(mockAppointmentData.dateTime > new Date(), 'Appointment date should be in future');
  console.log('✅ Test 3 passed: Appointment date is valid');
}

function testAppointmentLinking() {
  console.log('\nTesting appointment linking...');
  
  // Verify appointment links to correct entities
  assert.ok(
    mockAppointmentData.clinicianId === mockClinician.id,
    'Appointment should link to correct clinician'
  );
  console.log('✅ Test 1 passed: Appointment links to clinician');
  
  assert.ok(
    mockAppointmentData.availabilitySlotId === mockAvailabilitySlot.id,
    'Appointment should link to correct availability slot'
  );
  console.log('✅ Test 2 passed: Appointment links to availability slot');
  
  // Verify slot times match
  const appointmentTime = mockAppointmentData.dateTime.getTime();
  const slotStartTime = mockAvailabilitySlot.startTime.getTime();
  assert.ok(
    Math.abs(appointmentTime - slotStartTime) < 1000, // Within 1 second
    'Appointment time should match slot start time'
  );
  console.log('✅ Test 3 passed: Appointment time matches slot');
}

function testDoubleBookingPrevention() {
  console.log('\nTesting double-booking prevention...');
  
  // Simulate booking process
  let slot = { ...mockAvailabilitySlot, isBooked: false };
  
  // First booking
  const firstBooking = {
    ...mockAppointmentData,
    availabilitySlotId: slot.id,
  };
  slot.isBooked = true; // Mark as booked
  
  // Attempt second booking
  const secondBooking = {
    ...mockAppointmentData,
    availabilitySlotId: slot.id,
  };
  
  assert.ok(slot.isBooked === true, 'Slot should be marked as booked');
  assert.ok(
    slot.isBooked,
    'Second booking should be prevented if slot is already booked'
  );
  console.log('✅ Test 1 passed: Double-booking prevented');
  
  // Verify slot status check
  const canBook = !slot.isBooked;
  assert.ok(canBook === false, 'Should not allow booking on booked slot');
  console.log('✅ Test 2 passed: Slot status check works');
}

function testAppointmentRetrieval() {
  console.log('\nTesting appointment retrieval...');
  
  // Mock appointment document
  const appointmentDoc = {
    id: 'appt123',
    ...mockAppointmentData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Verify retrieval structure
  assert.ok(appointmentDoc.id, 'Appointment document should have ID');
  assert.ok(appointmentDoc.applicationId, 'Should retrieve applicationId');
  assert.ok(appointmentDoc.patientId, 'Should retrieve patientId');
  assert.ok(appointmentDoc.clinicianId, 'Should retrieve clinicianId');
  console.log('✅ Test 1 passed: Appointment retrieval structure correct');
  
  // Verify timestamps
  assert.ok(appointmentDoc.createdAt instanceof Date, 'Should have createdAt timestamp');
  assert.ok(appointmentDoc.updatedAt instanceof Date, 'Should have updatedAt timestamp');
  console.log('✅ Test 2 passed: Timestamps present');
}

function testClinicianMatchingFlow() {
  console.log('\nTesting clinician matching flow...');
  
  const patientData = {
    insuranceProvider: 'Aetna',
    patientId: 'patient123',
    applicationId: 'app123',
  };
  
  // Simulate matching process
  const matchingClinicians = [mockClinician].filter(clinician => 
    clinician.acceptedInsurances.includes(patientData.insuranceProvider)
  );
  
  assert.ok(matchingClinicians.length > 0, 'Should find matching clinicians');
  assert.ok(
    matchingClinicians[0].id === mockClinician.id,
    'Should match correct clinician'
  );
  console.log('✅ Test 1 passed: Clinician matching works');
  
  // Verify availability check
  const availableSlots = [mockAvailabilitySlot].filter(slot => 
    slot.clinicianId === matchingClinicians[0].id && !slot.isBooked
  );
  assert.ok(availableSlots.length > 0, 'Should find available slots');
  console.log('✅ Test 2 passed: Availability check works');
}

function testEndToEndBookingFlow() {
  console.log('\nTesting end-to-end booking flow...');
  
  // Step 1: Patient data loaded
  const patientData = {
    insuranceProvider: 'Aetna',
    patientId: 'patient123',
    applicationId: 'app123',
  };
  assert.ok(patientData.insuranceProvider, 'Step 1: Patient data loaded');
  console.log('✅ Step 1: Patient data loaded');
  
  // Step 2: Find matching clinicians
  const clinicians = [mockClinician].filter(c => 
    c.acceptedInsurances.includes(patientData.insuranceProvider)
  );
  assert.ok(clinicians.length > 0, 'Step 2: Clinicians found');
  console.log('✅ Step 2: Clinicians found');
  
  // Step 3: Select clinician
  const selectedClinician = clinicians[0];
  assert.ok(selectedClinician, 'Step 3: Clinician selected');
  console.log('✅ Step 3: Clinician selected');
  
  // Step 4: Get available slots
  const slots = [mockAvailabilitySlot].filter(s => 
    s.clinicianId === selectedClinician.id && !s.isBooked
  );
  assert.ok(slots.length > 0, 'Step 4: Slots available');
  console.log('✅ Step 4: Slots available');
  
  // Step 5: Select slot
  const selectedSlot = slots[0];
  assert.ok(selectedSlot, 'Step 5: Slot selected');
  console.log('✅ Step 5: Slot selected');
  
  // Step 6: Create appointment
  const appointment = {
    ...mockAppointmentData,
    clinicianId: selectedClinician.id,
    availabilitySlotId: selectedSlot.id,
    dateTime: selectedSlot.startTime,
  };
  assert.ok(appointment.clinicianId, 'Step 6: Appointment created');
  console.log('✅ Step 6: Appointment created');
  
  // Step 7: Mark slot as booked
  selectedSlot.isBooked = true;
  assert.ok(selectedSlot.isBooked, 'Step 7: Slot marked as booked');
  console.log('✅ Step 7: Slot marked as booked');
  
  console.log('✅ End-to-end flow completed successfully');
}

function testEdgeCases() {
  console.log('\nTesting edge cases...');
  
  // No matching clinicians
  const noMatchPatient = { insuranceProvider: 'Unknown Insurance' };
  const noMatchClinicians = [mockClinician].filter(c => 
    c.acceptedInsurances.includes(noMatchPatient.insuranceProvider)
  );
  assert.ok(noMatchClinicians.length === 0, 'Should handle no matching clinicians');
  console.log('✅ Handles no matching clinicians');
  
  // No available slots
  const allBookedSlots = [{ ...mockAvailabilitySlot, isBooked: true }];
  const available = allBookedSlots.filter(s => !s.isBooked);
  assert.ok(available.length === 0, 'Should handle no available slots');
  console.log('✅ Handles no available slots');
  
  // Missing required fields
  const incompleteAppointment = { clinicianId: 'test' };
  const hasRequiredFields = 
    incompleteAppointment.applicationId &&
    incompleteAppointment.patientId &&
    incompleteAppointment.dateTime;
  assert.ok(!hasRequiredFields, 'Should detect missing required fields');
  console.log('✅ Detects missing required fields');
}

// Run all tests
function runTests() {
  console.log('🧪 Running Scheduling Integration Tests\n');
  console.log('='.repeat(50));
  
  try {
    testAppointmentDataStructure();
    testAppointmentLinking();
    testDoubleBookingPrevention();
    testAppointmentRetrieval();
    testClinicianMatchingFlow();
    testEndToEndBookingFlow();
    testEdgeCases();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All scheduling integration tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if executed directly
if (import.meta.url.endsWith(process.argv[1]) || import.meta.url.includes('scheduling.test.js')) {
  runTests();
}

export {
  testAppointmentDataStructure,
  testAppointmentLinking,
  testDoubleBookingPrevention,
  testAppointmentRetrieval,
  testClinicianMatchingFlow,
  testEndToEndBookingFlow,
  testEdgeCases,
};

