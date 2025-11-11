/**
 * Unit Tests for Insurance Validator Service
 * Tests insurance validation, member ID validation, and coverage status checking
 */

import { strict as assert } from 'assert';

// Import validation functions (standalone versions for testing)
function validateMemberId(memberId) {
  if (!memberId || typeof memberId !== 'string') {
    return { valid: false, error: 'Member ID is required' };
  }

  const trimmed = memberId.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Member ID must be at least 3 characters' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Member ID must be less than 50 characters' };
  }

  const memberIdPattern = /^[A-Za-z0-9\s\-]+$/;
  if (!memberIdPattern.test(trimmed)) {
    return { valid: false, error: 'Member ID contains invalid characters' };
  }

  return { valid: true };
}

function validateGroupNumber(groupNumber) {
  if (!groupNumber) {
    return { valid: true }; // Group number is optional
  }

  if (typeof groupNumber !== 'string') {
    return { valid: false, error: 'Group number must be a string' };
  }

  const trimmed = groupNumber.trim();
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Group number must be less than 50 characters' };
  }

  const groupNumberPattern = /^[A-Za-z0-9\s\-]+$/;
  if (!groupNumberPattern.test(trimmed)) {
    return { valid: false, error: 'Group number contains invalid characters' };
  }

  return { valid: true };
}

function checkCoverageStatus(coverage) {
  if (!coverage) {
    return {
      active: false,
      status: 'not_found',
      message: 'Coverage not found',
    };
  }
  
  const isActive = coverage.isActive !== false;
  const verificationStatus = coverage.verificationStatus || 'pending';
  
  if (!isActive) {
    return {
      active: false,
      status: 'inactive',
      message: 'This coverage is not active',
    };
  }
  
  if (verificationStatus === 'verified') {
    return {
      active: true,
      status: 'verified',
      message: 'Coverage verified and active',
    };
  }
  
  if (verificationStatus === 'pending') {
    return {
      active: true,
      status: 'pending',
      message: 'Coverage verification pending',
    };
  }
  
  if (verificationStatus === 'rejected') {
    return {
      active: false,
      status: 'rejected',
      message: 'Coverage verification was rejected',
    };
  }
  
  return {
    active: isActive,
    status: verificationStatus,
    message: 'Coverage status unknown',
  };
}

function validateInsuranceData(insuranceData) {
  const errors = {};
  
  if (!insuranceData.provider || !insuranceData.provider.trim()) {
    errors.provider = 'Insurance provider is required';
  }
  
  const memberIdValidation = validateMemberId(insuranceData.memberId);
  if (!memberIdValidation.valid) {
    errors.memberId = memberIdValidation.error;
  }
  
  if (insuranceData.groupNumber) {
    const groupNumberValidation = validateGroupNumber(insuranceData.groupNumber);
    if (!groupNumberValidation.valid) {
      errors.groupNumber = groupNumberValidation.error;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function testValidateMemberId() {
  console.log('Testing validateMemberId...');
  
  // Test 1: Valid member ID
  const result1 = validateMemberId('ABC123456');
  assert.ok(result1.valid, 'Valid member ID should pass');
  console.log('✅ Test 1 passed: Valid member ID');
  
  // Test 2: Too short
  const result2 = validateMemberId('AB');
  assert.ok(!result2.valid, 'Member ID too short should fail');
  assert.ok(result2.error.includes('at least 3'), 'Should have appropriate error message');
  console.log('✅ Test 2 passed: Member ID too short');
  
  // Test 3: Too long
  const longId = 'A'.repeat(51);
  const result3 = validateMemberId(longId);
  assert.ok(!result3.valid, 'Member ID too long should fail');
  console.log('✅ Test 3 passed: Member ID too long');
  
  // Test 4: Invalid characters
  const result4 = validateMemberId('ABC@123');
  assert.ok(!result4.valid, 'Member ID with invalid characters should fail');
  console.log('✅ Test 4 passed: Invalid characters rejected');
  
  // Test 5: Empty string
  const result5 = validateMemberId('');
  assert.ok(!result5.valid, 'Empty member ID should fail');
  console.log('✅ Test 5 passed: Empty member ID rejected');
  
  // Test 6: Null/undefined
  const result6 = validateMemberId(null);
  assert.ok(!result6.valid, 'Null member ID should fail');
  console.log('✅ Test 6 passed: Null member ID rejected');
  
  // Test 7: Valid with hyphens and spaces
  const result7 = validateMemberId('ABC-123 456');
  assert.ok(result7.valid, 'Member ID with hyphens and spaces should pass');
  console.log('✅ Test 7 passed: Valid member ID with special characters');
}

function testValidateGroupNumber() {
  console.log('\nTesting validateGroupNumber...');
  
  // Test 1: Valid group number
  const result1 = validateGroupNumber('GRP123');
  assert.ok(result1.valid, 'Valid group number should pass');
  console.log('✅ Test 1 passed: Valid group number');
  
  // Test 2: Optional (null/undefined)
  const result2 = validateGroupNumber(null);
  assert.ok(result2.valid, 'Group number is optional');
  console.log('✅ Test 2 passed: Group number optional');
  
  // Test 3: Too long
  const longGroup = 'A'.repeat(51);
  const result3 = validateGroupNumber(longGroup);
  assert.ok(!result3.valid, 'Group number too long should fail');
  console.log('✅ Test 3 passed: Group number too long');
  
  // Test 4: Invalid characters
  const result4 = validateGroupNumber('GRP@123');
  assert.ok(!result4.valid, 'Group number with invalid characters should fail');
  console.log('✅ Test 4 passed: Invalid characters rejected');
  
  // Test 5: Valid with hyphens
  const result5 = validateGroupNumber('GRP-123-456');
  assert.ok(result5.valid, 'Group number with hyphens should pass');
  console.log('✅ Test 5 passed: Valid group number with hyphens');
}

function testCheckCoverageStatus() {
  console.log('\nTesting checkCoverageStatus...');
  
  // Test 1: Verified coverage
  const coverage1 = { isActive: true, verificationStatus: 'verified' };
  const status1 = checkCoverageStatus(coverage1);
  assert.ok(status1.active, 'Verified coverage should be active');
  assert.ok(status1.status === 'verified', 'Status should be verified');
  console.log('✅ Test 1 passed: Verified coverage');
  
  // Test 2: Pending coverage
  const coverage2 = { isActive: true, verificationStatus: 'pending' };
  const status2 = checkCoverageStatus(coverage2);
  assert.ok(status2.active, 'Pending coverage should be active');
  assert.ok(status2.status === 'pending', 'Status should be pending');
  console.log('✅ Test 2 passed: Pending coverage');
  
  // Test 3: Inactive coverage
  const coverage3 = { isActive: false, verificationStatus: 'verified' };
  const status3 = checkCoverageStatus(coverage3);
  assert.ok(!status3.active, 'Inactive coverage should not be active');
  assert.ok(status3.status === 'inactive', 'Status should be inactive');
  console.log('✅ Test 3 passed: Inactive coverage');
  
  // Test 4: Rejected coverage
  const coverage4 = { isActive: true, verificationStatus: 'rejected' };
  const status4 = checkCoverageStatus(coverage4);
  assert.ok(!status4.active, 'Rejected coverage should not be active');
  assert.ok(status4.status === 'rejected', 'Status should be rejected');
  console.log('✅ Test 4 passed: Rejected coverage');
  
  // Test 5: No coverage
  const status5 = checkCoverageStatus(null);
  assert.ok(!status5.active, 'No coverage should not be active');
  assert.ok(status5.status === 'not_found', 'Status should be not_found');
  console.log('✅ Test 5 passed: No coverage');
  
  // Test 6: Default active (isActive not specified)
  const coverage6 = { verificationStatus: 'verified' };
  const status6 = checkCoverageStatus(coverage6);
  assert.ok(status6.active, 'Default should be active');
  console.log('✅ Test 6 passed: Default active status');
}

function testValidateInsuranceData() {
  console.log('\nTesting validateInsuranceData...');
  
  // Test 1: Valid insurance data
  const data1 = {
    provider: 'Aetna',
    memberId: 'ABC123456',
    groupNumber: 'GRP123',
  };
  const result1 = validateInsuranceData(data1);
  assert.ok(result1.valid, 'Valid insurance data should pass');
  assert.ok(Object.keys(result1.errors).length === 0, 'No errors should exist');
  console.log('✅ Test 1 passed: Valid insurance data');
  
  // Test 2: Missing provider
  const data2 = {
    memberId: 'ABC123456',
  };
  const result2 = validateInsuranceData(data2);
  assert.ok(!result2.valid, 'Missing provider should fail');
  assert.ok(result2.errors.provider, 'Should have provider error');
  console.log('✅ Test 2 passed: Missing provider');
  
  // Test 3: Invalid member ID
  const data3 = {
    provider: 'Aetna',
    memberId: 'AB', // Too short
  };
  const result3 = validateInsuranceData(data3);
  assert.ok(!result3.valid, 'Invalid member ID should fail');
  assert.ok(result3.errors.memberId, 'Should have member ID error');
  console.log('✅ Test 3 passed: Invalid member ID');
  
  // Test 4: Invalid group number
  const data4 = {
    provider: 'Aetna',
    memberId: 'ABC123456',
    groupNumber: 'GRP@123', // Invalid characters
  };
  const result4 = validateInsuranceData(data4);
  assert.ok(!result4.valid, 'Invalid group number should fail');
  assert.ok(result4.errors.groupNumber, 'Should have group number error');
  console.log('✅ Test 4 passed: Invalid group number');
  
  // Test 5: Missing member ID
  const data5 = {
    provider: 'Aetna',
  };
  const result5 = validateInsuranceData(data5);
  assert.ok(!result5.valid, 'Missing member ID should fail');
  assert.ok(result5.errors.memberId, 'Should have member ID error');
  console.log('✅ Test 5 passed: Missing member ID');
}

function testEdgeCases() {
  console.log('\nTesting edge cases...');
  
  // Test whitespace handling
  const result1 = validateMemberId('  ABC123  ');
  assert.ok(result1.valid, 'Should trim whitespace');
  console.log('✅ Handles whitespace trimming');
  
  // Test empty string provider
  const data1 = { provider: '   ', memberId: 'ABC123' };
  const result2 = validateInsuranceData(data1);
  assert.ok(!result2.valid, 'Empty provider should fail');
  console.log('✅ Handles empty string provider');
  
  // Test undefined group number
  const data2 = { provider: 'Aetna', memberId: 'ABC123', groupNumber: undefined };
  const result3 = validateInsuranceData(data2);
  assert.ok(result3.valid, 'Undefined group number should be valid (optional)');
  console.log('✅ Handles undefined group number');
}

// Run all tests
function runTests() {
  console.log('🧪 Running Insurance Validator Unit Tests\n');
  console.log('='.repeat(50));
  
  try {
    testValidateMemberId();
    testValidateGroupNumber();
    testCheckCoverageStatus();
    testValidateInsuranceData();
    testEdgeCases();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All Insurance Validator tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if executed directly
if (import.meta.url.endsWith(process.argv[1]) || import.meta.url.includes('InsuranceValidator.test.js')) {
  runTests();
}

export {
  testValidateMemberId,
  testValidateGroupNumber,
  testCheckCoverageStatus,
  testValidateInsuranceData,
  testEdgeCases,
};

