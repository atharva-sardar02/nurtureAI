/**
 * Unit Tests for Insurance Matcher Service
 * Tests insurance matching logic, network status determination, and clinician filtering
 */

import { strict as assert } from 'assert';

// Mock data
const mockClinicianId = 'clinician123';
const mockInsuranceId = 'insurance123';
const mockPatientInsuranceId = 'insurance123';

// Mock functions (standalone versions for testing)
function determineNetworkStatus(patientInsuranceId, clinicianAcceptedInsurances) {
  if (!clinicianAcceptedInsurances || !Array.isArray(clinicianAcceptedInsurances)) {
    return {
      inNetwork: false,
      status: 'out-of-network',
    };
  }
  
  const accepts = clinicianAcceptedInsurances.includes(patientInsuranceId);
  
  return {
    inNetwork: accepts,
    status: accepts ? 'in-network' : 'out-of-network',
  };
}

function filterCliniciansByInsurance(clinicianIds, clinicianInsuranceMap, insuranceId) {
  return clinicianIds.filter(clinicianId => {
    const acceptedInsurances = clinicianInsuranceMap[clinicianId] || [];
    return acceptedInsurances.includes(insuranceId);
  });
}

function testDetermineNetworkStatus() {
  console.log('Testing determineNetworkStatus...');
  
  // Test 1: In-network (clinician accepts insurance)
  const acceptedInsurances1 = [mockInsuranceId, 'insurance456'];
  const status1 = determineNetworkStatus(mockInsuranceId, acceptedInsurances1);
  assert.ok(status1.inNetwork === true, 'Should be in-network when clinician accepts insurance');
  assert.ok(status1.status === 'in-network', 'Status should be in-network');
  console.log('✅ Test 1 passed: In-network status');
  
  // Test 2: Out-of-network (clinician doesn't accept insurance)
  const acceptedInsurances2 = ['insurance456', 'insurance789'];
  const status2 = determineNetworkStatus(mockInsuranceId, acceptedInsurances2);
  assert.ok(status2.inNetwork === false, 'Should be out-of-network when clinician doesn\'t accept');
  assert.ok(status2.status === 'out-of-network', 'Status should be out-of-network');
  console.log('✅ Test 2 passed: Out-of-network status');
  
  // Test 3: Empty accepted insurances
  const status3 = determineNetworkStatus(mockInsuranceId, []);
  assert.ok(status3.inNetwork === false, 'Should be out-of-network with no accepted insurances');
  console.log('✅ Test 3 passed: Empty accepted insurances');
  
  // Test 4: Multiple insurances, one matches
  const acceptedInsurances4 = ['insurance456', mockInsuranceId, 'insurance789'];
  const status4 = determineNetworkStatus(mockInsuranceId, acceptedInsurances4);
  assert.ok(status4.inNetwork === true, 'Should match when insurance is in list');
  console.log('✅ Test 4 passed: Multiple insurances, one matches');
}

function testFilterCliniciansByInsurance() {
  console.log('\nTesting filterCliniciansByInsurance...');
  
  // Mock clinician-insurance map
  const clinicianInsuranceMap = {
    clinician1: [mockInsuranceId, 'insurance456'],
    clinician2: ['insurance456', 'insurance789'],
    clinician3: [mockInsuranceId],
    clinician4: [],
  };
  
  const allClinicianIds = ['clinician1', 'clinician2', 'clinician3', 'clinician4'];
  
  // Test 1: Filter by insurance
  const filtered1 = filterCliniciansByInsurance(
    allClinicianIds,
    clinicianInsuranceMap,
    mockInsuranceId
  );
  assert.ok(filtered1.length === 2, 'Should filter to 2 clinicians');
  assert.ok(filtered1.includes('clinician1'), 'Should include clinician1');
  assert.ok(filtered1.includes('clinician3'), 'Should include clinician3');
  assert.ok(!filtered1.includes('clinician2'), 'Should not include clinician2');
  assert.ok(!filtered1.includes('clinician4'), 'Should not include clinician4');
  console.log('✅ Test 1 passed: Filter clinicians by insurance');
  
  // Test 2: No matching clinicians
  const filtered2 = filterCliniciansByInsurance(
    allClinicianIds,
    clinicianInsuranceMap,
    'insurance999'
  );
  assert.ok(filtered2.length === 0, 'Should return empty array when no matches');
  console.log('✅ Test 2 passed: No matching clinicians');
  
  // Test 3: Empty clinician list
  const filtered3 = filterCliniciansByInsurance(
    [],
    clinicianInsuranceMap,
    mockInsuranceId
  );
  assert.ok(filtered3.length === 0, 'Should handle empty clinician list');
  console.log('✅ Test 3 passed: Empty clinician list');
  
  // Test 4: All clinicians match
  const allMatchMap = {
    clinician1: [mockInsuranceId],
    clinician2: [mockInsuranceId],
  };
  const filtered4 = filterCliniciansByInsurance(
    ['clinician1', 'clinician2'],
    allMatchMap,
    mockInsuranceId
  );
  assert.ok(filtered4.length === 2, 'Should return all when all match');
  console.log('✅ Test 4 passed: All clinicians match');
}

function testNetworkStatusLogic() {
  console.log('\nTesting network status logic...');
  
  // Test in-network determination
  const inNetworkCases = [
    { patientInsurance: 'A', clinicianInsurances: ['A', 'B'], expected: true },
    { patientInsurance: 'B', clinicianInsurances: ['A', 'B'], expected: true },
    { patientInsurance: 'C', clinicianInsurances: ['A', 'B'], expected: false },
    { patientInsurance: 'A', clinicianInsurances: [], expected: false },
  ];
  
  inNetworkCases.forEach((testCase, index) => {
    const status = determineNetworkStatus(
      testCase.patientInsurance,
      testCase.clinicianInsurances
    );
    assert.ok(
      status.inNetwork === testCase.expected,
      `Test case ${index + 1}: Expected ${testCase.expected}, got ${status.inNetwork}`
    );
  });
  console.log('✅ Network status logic tests passed');
}

function testEdgeCases() {
  console.log('\nTesting edge cases...');
  
  // Test null/undefined insurance ID
  const status1 = determineNetworkStatus(null, [mockInsuranceId]);
  assert.ok(status1.inNetwork === false, 'Should handle null insurance ID');
  console.log('✅ Handles null insurance ID');
  
  // Test null/undefined accepted insurances
  const status2 = determineNetworkStatus(mockInsuranceId, null);
  assert.ok(status2.inNetwork === false, 'Should handle null accepted insurances');
  console.log('✅ Handles null accepted insurances');
  
  // Test empty clinician list
  const filtered = filterCliniciansByInsurance([], {}, mockInsuranceId);
  assert.ok(filtered.length === 0, 'Should handle empty clinician list');
  console.log('✅ Handles empty clinician list');
  
  // Test missing clinician in map
  const filtered2 = filterCliniciansByInsurance(
    ['clinician999'],
    {},
    mockInsuranceId
  );
  assert.ok(filtered2.length === 0, 'Should handle missing clinician in map');
  console.log('✅ Handles missing clinician in map');
}

// Run all tests
function runTests() {
  console.log('🧪 Running Insurance Matcher Unit Tests\n');
  console.log('='.repeat(50));
  
  try {
    testDetermineNetworkStatus();
    testFilterCliniciansByInsurance();
    testNetworkStatusLogic();
    testEdgeCases();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All Insurance Matcher tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if executed directly
if (import.meta.url.endsWith(process.argv[1]) || import.meta.url.includes('InsuranceMatcher.test.js')) {
  runTests();
}

export {
  testDetermineNetworkStatus,
  testFilterCliniciansByInsurance,
  testNetworkStatusLogic,
  testEdgeCases,
};

