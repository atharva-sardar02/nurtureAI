/**
 * Unit Tests for Questionnaire Mapping Utility
 * Run with: node tests/unit/questionnaireMapping.test.js
 */

import { 
  getQuestionnaireType, 
  getQuestionnaireCode, 
  getAllQuestionnaireMappings,
  transformQuestionnaireData 
} from '../../src/utils/questionnaireMapping.js';

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

console.log('🧪 Running Questionnaire Mapping Tests...\n');

// Test getQuestionnaireType
assert(
  JSON.stringify(getQuestionnaireType(1)) === JSON.stringify({
    code: 'PHQ_A',
    label: 'PHQ-A',
    scored: true,
    riskScreen: true,
  }),
  'getQuestionnaireType(1) should return PHQ-A mapping'
);

assert(
  JSON.stringify(getQuestionnaireType(2)) === JSON.stringify({
    code: 'GAD_7',
    label: 'GAD-7',
    scored: true,
    riskScreen: true,
  }),
  'getQuestionnaireType(2) should return GAD-7 mapping'
);

assert(
  JSON.stringify(getQuestionnaireType(3)) === JSON.stringify({
    code: 'PSC_17',
    label: 'PSC-17',
    scored: true,
    riskScreen: true,
  }),
  'getQuestionnaireType(3) should return PSC-17 mapping'
);

assert(
  JSON.stringify(getQuestionnaireType(4)) === JSON.stringify({
    code: 'SDQ',
    label: 'SDQ',
    scored: true,
    riskScreen: true,
  }),
  'getQuestionnaireType(4) should return SDQ mapping'
);

assert(
  getQuestionnaireType('1').code === 'PHQ_A',
  'getQuestionnaireType("1") should handle string codes'
);

assert(
  getQuestionnaireType(999).code === 'OTHER',
  'getQuestionnaireType(999) should return OTHER for invalid codes'
);

// Test getQuestionnaireCode
assert(getQuestionnaireCode('PHQ-A') === 1, 'getQuestionnaireCode("PHQ-A") should return 1');
assert(getQuestionnaireCode('GAD-7') === 2, 'getQuestionnaireCode("GAD-7") should return 2');
assert(getQuestionnaireCode('PSC-17') === 3, 'getQuestionnaireCode("PSC-17") should return 3');
assert(getQuestionnaireCode('SDQ') === 4, 'getQuestionnaireCode("SDQ") should return 4');
assert(getQuestionnaireCode('invalid') === null, 'getQuestionnaireCode("invalid") should return null');

// Test getAllQuestionnaireMappings
const mappings = getAllQuestionnaireMappings();
assert(mappings[1].code === 'PHQ_A', 'getAllQuestionnaireMappings()[1].code should be PHQ_A');
assert(mappings[2].code === 'GAD_7', 'getAllQuestionnaireMappings()[2].code should be GAD_7');
assert(mappings.OTHER.code === 'OTHER', 'getAllQuestionnaireMappings().OTHER.code should be OTHER');

// Test transformQuestionnaireData
const input1 = {
  id: 'test-id',
  userId: 'user-id',
  type: '3',
  score: 10,
};

const result1 = transformQuestionnaireData(input1);
assert(result1.typeCode === 3, 'transformQuestionnaireData should set typeCode');
assert(result1.type === 'PSC_17', 'transformQuestionnaireData should set standardized type');
assert(result1.typeLabel === 'PSC-17', 'transformQuestionnaireData should set typeLabel');
assert(result1.typeMetadata.scored === true, 'transformQuestionnaireData should set typeMetadata.scored');

const input2 = {
  id: 'test-id',
  type: 4,
};

const result2 = transformQuestionnaireData(input2);
assert(result2.typeCode === 4, 'transformQuestionnaireData should handle numeric codes');
assert(result2.type === 'SDQ', 'transformQuestionnaireData should map code 4 to SDQ');

const input3 = {
  id: 'test-id',
  type: 999,
};

const result3 = transformQuestionnaireData(input3);
assert(result3.type === 'OTHER', 'transformQuestionnaireData should map invalid codes to OTHER');
assert(result3.typeMetadata.scored === false, 'transformQuestionnaireData should set scored=false for OTHER');

console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);

if (testsFailed === 0) {
  console.log('✅ All questionnaire mapping tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}
