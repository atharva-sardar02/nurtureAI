/**
 * Unit Tests for Kinship Selector
 * Tests kinship mapping and consent eligibility logic
 * 
 * Run with: node tests/unit/kinshipSelector.test.js
 */

// Simple test framework for Node.js
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ ${message}`);
    testsFailed++;
  }
}
import {
  getKinshipLabel,
  getKinshipMapping,
  getKinshipCode,
  getAllKinshipMappings,
} from '../../src/utils/kinshipMapping.js';

console.log('🧪 Running Kinship Selector Tests...\n');

// getKinshipLabel Tests
console.log('🏷️  Testing getKinshipLabel...');
assert(getKinshipLabel(1) === 'mother', 'Code 1 should return "mother"');
assert(getKinshipLabel(2) === 'father', 'Code 2 should return "father"');
assert(getKinshipLabel(3) === 'legalGuardian', 'Code 3 should return "legalGuardian"');
assert(getKinshipLabel(4) === 'otherCaregiver', 'Code 4 should return "otherCaregiver"');
assert(getKinshipLabel('1') === 'mother', 'String code "1" should return "mother"');
assert(getKinshipLabel(999) === 'unknown', 'Invalid code should return "unknown"');

// getKinshipMapping Tests
console.log('\n🗺️  Testing getKinshipMapping...');
const mapping1 = getKinshipMapping(1);
assert(mapping1.label === 'mother' && mapping1.consentEligible === true, 'Mother should be consent-eligible');

const mapping4 = getKinshipMapping(4);
assert(mapping4.label === 'otherCaregiver' && mapping4.consentEligible === false, 'Other caregiver should not be consent-eligible');

const mappingUnknown = getKinshipMapping(999);
assert(mappingUnknown.label === 'unknown' && mappingUnknown.consentEligible === false, 'Unknown should not be consent-eligible');

// getKinshipCode Tests
console.log('\n🔢 Testing getKinshipCode...');
assert(getKinshipCode('mother') === 1, 'Label "mother" should return code 1');
assert(getKinshipCode('Mother') === 1, 'Case-insensitive "Mother" should return code 1');
assert(getKinshipCode('FATHER') === 2, 'Case-insensitive "FATHER" should return code 2');
assert(getKinshipCode('invalid') === null, 'Invalid label should return null');

// getAllKinshipMappings Tests
console.log('\n📋 Testing getAllKinshipMappings...');
const mappings = getAllKinshipMappings();
assert(mappings[1].label === 'mother' && mappings[1].consentEligible === true, 'Mapping 1 should have correct structure');
assert(mappings[2].label === 'father' && mappings[2].consentEligible === true, 'Mapping 2 should have correct structure');
assert(mappings[4].label === 'otherCaregiver' && mappings[4].consentEligible === false, 'Mapping 4 should have correct structure');

// Consent Eligibility Tests
console.log('\n✅ Testing Consent Eligibility...');
const mother = getKinshipMapping(1);
const father = getKinshipMapping(2);
const legalGuardian = getKinshipMapping(3);
const otherCaregiver = getKinshipMapping(4);

assert(mother.consentEligible === true, 'Mother should be consent-eligible');
assert(father.consentEligible === true, 'Father should be consent-eligible');
assert(legalGuardian.consentEligible === true, 'Legal guardian should be consent-eligible');
assert(otherCaregiver.consentEligible === false, 'Other caregiver should not be consent-eligible');

// Summary
console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);

if (testsFailed === 0) {
  console.log('✅ All kinship selector tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}

