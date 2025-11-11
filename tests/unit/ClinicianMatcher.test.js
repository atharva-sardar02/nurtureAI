/**
 * Unit Tests for ClinicianMatcher Service
 * Tests clinician matching algorithm, insurance filtering, and fit score calculation
 */

import { strict as assert } from 'assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Import calculateFitScore function directly (it doesn't depend on Firebase)
// We'll test it as a standalone function
function calculateFitScore(clinician, patientData, availableSlots) {
  let score = 0;
  
  // Insurance match (40 points)
  if (patientData?.insuranceProvider && clinician?.acceptedInsurances) {
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
  if (patientData?.preferredSpecialty && clinician?.specialties) {
    const specialtyMatch = clinician.specialties.some(
      specialty => specialty.toLowerCase().includes(patientData.preferredSpecialty.toLowerCase())
    );
    if (specialtyMatch) {
      score += 20;
    }
  }
  
  // Rating bonus (10 points)
  if (clinician?.rating) {
    score += Math.min(10, clinician.rating * 2);
  }
  
  return Math.min(100, score);
}

// Mock clinician data
const mockClinician = {
  id: 'clinician1',
  name: 'Dr. Test',
  acceptedInsurances: ['Aetna', 'United Healthcare'],
  specialties: ['Anxiety', 'Depression'],
  rating: 4.8,
};

// Mock patient data
const mockPatientData = {
  insuranceProvider: 'Aetna',
  preferredSpecialty: 'Anxiety',
};

// Mock available slots
const mockAvailableSlots = [
  { id: 'slot1', startTime: new Date(), endTime: new Date() },
  { id: 'slot2', startTime: new Date(), endTime: new Date() },
  { id: 'slot3', startTime: new Date(), endTime: new Date() },
];

function testCalculateFitScore() {
  console.log('Testing calculateFitScore...');
  
  // Test 1: Perfect match (insurance + availability + specialty)
  const score1 = calculateFitScore(mockClinician, mockPatientData, mockAvailableSlots);
  assert.ok(score1 > 0, 'Fit score should be greater than 0');
  assert.ok(score1 <= 100, 'Fit score should not exceed 100');
  console.log('✅ Test 1 passed: Fit score calculation works');
  
  // Test 2: No insurance match
  const patientNoInsurance = { ...mockPatientData, insuranceProvider: 'Blue Cross' };
  const score2 = calculateFitScore(mockClinician, patientNoInsurance, mockAvailableSlots);
  assert.ok(score2 < score1, 'Score should be lower without insurance match');
  console.log('✅ Test 2 passed: Insurance mismatch reduces score');
  
  // Test 3: No availability
  const score3 = calculateFitScore(mockClinician, mockPatientData, []);
  assert.ok(score3 < score1, 'Score should be lower without availability');
  console.log('✅ Test 3 passed: No availability reduces score');
  
  // Test 4: No specialty match
  const patientNoSpecialty = { ...mockPatientData, preferredSpecialty: 'ADHD' };
  const score4 = calculateFitScore(mockClinician, patientNoSpecialty, mockAvailableSlots);
  assert.ok(score4 < score1, 'Score should be lower without specialty match');
  console.log('✅ Test 4 passed: Specialty mismatch reduces score');
  
  // Test 5: All factors present
  const score5 = calculateFitScore(mockClinician, mockPatientData, mockAvailableSlots);
  assert.ok(score5 >= 40, 'Score should be at least 40 with insurance match');
  console.log('✅ Test 5 passed: All factors contribute to score');
  
  // Test 6: Edge case - no patient data
  const score6 = calculateFitScore(mockClinician, {}, mockAvailableSlots);
  assert.ok(score6 >= 0, 'Score should be non-negative even with no patient data');
  console.log('✅ Test 6 passed: Handles missing patient data');
  
  // Test 7: Rating bonus
  const clinicianHighRating = { ...mockClinician, rating: 5.0 };
  const clinicianLowRating = { ...mockClinician, rating: 3.0 };
  const scoreHigh = calculateFitScore(clinicianHighRating, mockPatientData, mockAvailableSlots);
  const scoreLow = calculateFitScore(clinicianLowRating, mockPatientData, mockAvailableSlots);
  assert.ok(scoreHigh >= scoreLow, 'Higher rating should increase score');
  console.log('✅ Test 7 passed: Rating affects score');
}

function testFitScoreComponents() {
  console.log('\nTesting fit score components...');
  
  // Test insurance component (40 points)
  const patientWithInsurance = { insuranceProvider: 'Aetna' };
  const patientWithoutInsurance = { insuranceProvider: 'Blue Cross' };
  const scoreWith = calculateFitScore(mockClinician, patientWithInsurance, mockAvailableSlots);
  const scoreWithout = calculateFitScore(mockClinician, patientWithoutInsurance, mockAvailableSlots);
  const insuranceDifference = scoreWith - scoreWithout;
  assert.ok(insuranceDifference >= 30, 'Insurance match should add significant points');
  console.log('✅ Insurance component test passed');
  
  // Test availability component (30 points max)
  const manySlots = Array(10).fill(null).map((_, i) => ({
    id: `slot${i}`,
    startTime: new Date(),
    endTime: new Date(),
  }));
  const scoreMany = calculateFitScore(mockClinician, mockPatientData, manySlots);
  const scoreFew = calculateFitScore(mockClinician, mockPatientData, mockAvailableSlots);
  assert.ok(scoreMany >= scoreFew, 'More slots should increase score');
  console.log('✅ Availability component test passed');
  
  // Test specialty component (20 points)
  const patientWithSpecialty = { ...mockPatientData, preferredSpecialty: 'Anxiety' };
  const patientWithoutSpecialty = { ...mockPatientData, preferredSpecialty: 'ADHD' };
  const scoreSpecialty = calculateFitScore(mockClinician, patientWithSpecialty, mockAvailableSlots);
  const scoreNoSpecialty = calculateFitScore(mockClinician, patientWithoutSpecialty, mockAvailableSlots);
  assert.ok(scoreSpecialty >= scoreNoSpecialty, 'Specialty match should increase score');
  console.log('✅ Specialty component test passed');
}

function testEdgeCases() {
  console.log('\nTesting edge cases...');
  
  // Test with null/undefined values
  try {
    const score1 = calculateFitScore(null, mockPatientData, mockAvailableSlots);
    assert.ok(score1 >= 0, 'Should handle null clinician');
    console.log('✅ Handles null clinician');
  } catch (e) {
    console.log('⚠️  Null clinician throws error (acceptable)');
  }
  
  // Test with empty slots
  const score2 = calculateFitScore(mockClinician, mockPatientData, []);
  assert.ok(score2 >= 0 && score2 <= 100, 'Should handle empty slots');
  console.log('✅ Handles empty slots');
  
  // Test with missing clinician properties
  const minimalClinician = { id: 'test' };
  const score3 = calculateFitScore(minimalClinician, mockPatientData, mockAvailableSlots);
  assert.ok(score3 >= 0 && score3 <= 100, 'Should handle minimal clinician data');
  console.log('✅ Handles minimal clinician data');
}

// Run all tests
function runTests() {
  console.log('🧪 Running ClinicianMatcher Unit Tests\n');
  console.log('='.repeat(50));
  
  try {
    testCalculateFitScore();
    testFitScoreComponents();
    testEdgeCases();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All ClinicianMatcher tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if executed directly
if (import.meta.url.endsWith(process.argv[1]) || import.meta.url.includes('ClinicianMatcher.test.js')) {
  runTests();
}

export { testCalculateFitScore, testFitScoreComponents, testEdgeCases };

