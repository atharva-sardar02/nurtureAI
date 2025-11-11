/**
 * Unit Tests for Kinship Mapping Utility
 * Run with: node tests/unit/kinshipMapping.test.js
 */

import {
  getKinshipLabel,
  getKinshipCode,
  getAllKinshipMappings,
  getKinshipMapping,
  transformKinshipData,
} from '../../src/utils/kinshipMapping.js';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`✅ ${message}`);
  } else {
    testsFailed++;
    console.error(`❌ ${message}`);
  }
}

console.log('🧪 Running Kinship Mapping Tests...\n');

// Test getKinshipLabel
assert(getKinshipLabel(1) === 'mother', 'getKinshipLabel(1) should return "mother"');
assert(getKinshipLabel(2) === 'father', 'getKinshipLabel(2) should return "father"');
assert(getKinshipLabel(3) === 'legalGuardian', 'getKinshipLabel(3) should return "legalGuardian"');
assert(getKinshipLabel(4) === 'otherCaregiver', 'getKinshipLabel(4) should return "otherCaregiver"');
assert(getKinshipLabel(12) === 'other', 'getKinshipLabel(12) should return "other" (legacy)');
assert(getKinshipLabel(2051) === 'guardian', 'getKinshipLabel(2051) should return "guardian" (legacy)');
assert(getKinshipLabel('1') === 'mother', 'getKinshipLabel("1") should return "mother"');
assert(getKinshipLabel(999) === 'unknown', 'getKinshipLabel(999) should return "unknown"');

// Test getKinshipCode
assert(getKinshipCode('mother') === 1, 'getKinshipCode("mother") should return 1');
assert(getKinshipCode('father') === 2, 'getKinshipCode("father") should return 2');
assert(getKinshipCode('legalguardian') === 3, 'getKinshipCode("legalguardian") should return 3');
assert(getKinshipCode('othercaregiver') === 4, 'getKinshipCode("othercaregiver") should return 4');
assert(getKinshipCode('other') === 12, 'getKinshipCode("other") should return 12 (legacy)');
assert(getKinshipCode('guardian') === 2051, 'getKinshipCode("guardian") should return 2051 (legacy)');
assert(getKinshipCode('Mother') === 1, 'getKinshipCode("Mother") should return 1 (case insensitive)');
assert(getKinshipCode('invalid') === null, 'getKinshipCode("invalid") should return null');

// Test getAllKinshipMappings
const mappings = getAllKinshipMappings();
assert(typeof mappings === 'object', 'getAllKinshipMappings() should return an object');
assert(mappings[1].label === 'mother', 'getAllKinshipMappings()[1].label should be "mother"');
assert(mappings[1].consentEligible === true, 'getAllKinshipMappings()[1].consentEligible should be true');
assert(mappings[2].label === 'father', 'getAllKinshipMappings()[2].label should be "father"');
assert(mappings[4].consentEligible === false, 'getAllKinshipMappings()[4].consentEligible should be false');

// Test getKinshipMapping
const mapping1 = getKinshipMapping(1);
assert(mapping1.label === 'mother', 'getKinshipMapping(1) should return mother label');
assert(mapping1.consentEligible === true, 'getKinshipMapping(1) should return consentEligible=true');

// Test transformKinshipData
const testInput = {
  id: 'test-id',
  user_0_id: 'user-0-id',
  user_1_id: 'user-1-id',
  user_0_label: '1',
  user_1_label: '2051',
  kind: 1,
  created_at: '2025-01-01',
};

const result = transformKinshipData(testInput);
assert(result.id === 'test-id', 'transformKinshipData should preserve id');
assert(result.user_0_kinship.code === 1, 'user_0_kinship.code should be 1');
assert(result.user_0_kinship.label === 'mother', 'user_0_kinship.label should be "mother"');
assert(result.user_0_kinship.consentEligible === true, 'user_0_kinship.consentEligible should be true');
assert(result.user_1_kinship.code === 2051, 'user_1_kinship.code should be 2051');
assert(result.user_1_kinship.label === 'guardian', 'user_1_kinship.label should be "guardian"');
assert(result.user_1_kinship.consentEligible === true, 'user_1_kinship.consentEligible should be true (legacy guardian)');
assert(result.user_0_label === undefined, 'user_0_label should be removed after transformation');
assert(result.user_1_label === undefined, 'user_1_label should be removed after transformation');

// Summary
console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);

if (testsFailed === 0) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}
