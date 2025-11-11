/**
 * Unit Tests for Kinship Mapping Utility
 * Run with: node tests/unit/kinshipMapping.test.js
 */

import {
  getKinshipLabel,
  getKinshipCode,
  getAllKinshipMappings,
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
assert(getKinshipLabel(12) === 'other', 'getKinshipLabel(12) should return "other"');
assert(getKinshipLabel(2051) === 'guardian', 'getKinshipLabel(2051) should return "guardian"');
assert(getKinshipLabel('1') === 'mother', 'getKinshipLabel("1") should return "mother"');
assert(getKinshipLabel(999) === 'unknown', 'getKinshipLabel(999) should return "unknown"');

// Test getKinshipCode
assert(getKinshipCode('mother') === 1, 'getKinshipCode("mother") should return 1');
assert(getKinshipCode('father') === 2, 'getKinshipCode("father") should return 2');
assert(getKinshipCode('other') === 12, 'getKinshipCode("other") should return 12');
assert(getKinshipCode('guardian') === 2051, 'getKinshipCode("guardian") should return 2051');
assert(getKinshipCode('Mother') === 1, 'getKinshipCode("Mother") should return 1 (case insensitive)');
assert(getKinshipCode('invalid') === null, 'getKinshipCode("invalid") should return null');

// Test getAllKinshipMappings
const mappings = getAllKinshipMappings();
assert(
  JSON.stringify(mappings) === JSON.stringify({ 1: 'mother', 2: 'father', 12: 'other', 2051: 'guardian' }),
  'getAllKinshipMappings() should return all mappings'
);

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
assert(result.user_1_kinship.code === 2051, 'user_1_kinship.code should be 2051');
assert(result.user_1_kinship.label === 'guardian', 'user_1_kinship.label should be "guardian"');
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
