/**
 * Integration Tests for Data Import
 * Tests the CSV import flow end-to-end
 * 
 * Note: These tests require Firebase Admin SDK to be configured
 * Run with: node tests/integration/dataImport.test.js
 */

import { parseCSV, getCSVPath } from '../../scripts/importCSV.js';
import { transformKinshipData } from '../../src/utils/kinshipMapping.js';

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

console.log('🧪 Running Data Import Integration Tests...\n');

// Test CSV parsing
async function testCSVParsing() {
  try {
    const csvPath = getCSVPath('kinships.csv');
    const data = await parseCSV(csvPath);
    
    assert(Array.isArray(data), 'parseCSV should return an array');
    assert(data.length > 0, 'parseCSV should return non-empty array');
    assert(typeof data[0] === 'object', 'parseCSV should return array of objects');
    
    // Check that headers are converted to camelCase
    const firstRow = data[0];
    assert('user0Id' in firstRow || 'user0Label' in firstRow || 'user_0_id' in firstRow, 'Headers should be converted to camelCase or preserved');
    
    console.log(`   📊 Parsed ${data.length} rows from kinships.csv`);
  } catch (error) {
    assert(false, `CSV parsing failed: ${error.message}`);
  }
}

// Test kinship transformation
async function testKinshipTransformation() {
  try {
    const csvPath = getCSVPath('kinships.csv');
    const data = await parseCSV(csvPath);
    
    if (data.length > 0) {
      const firstRow = data[0];
      const transformed = transformKinshipData(firstRow);
      
      assert('user0Kinship' in transformed || 'user_0_kinship' in transformed, 'Transformed data should have kinship objects');
      
      // Check if kinship codes are valid
      const validCodes = [1, 2, 12, 2051];
      const kinship0 = transformed.user0Kinship || transformed.user_0_kinship;
      const kinship1 = transformed.user1Kinship || transformed.user_1_kinship;
      
      if (kinship0 && kinship0.code) {
        assert(validCodes.includes(kinship0.code), `user0Kinship.code should be valid (got ${kinship0.code})`);
        assert(typeof kinship0.label === 'string', 'user0Kinship.label should be a string');
      } else {
        console.warn('   ⚠️  No user0Kinship found in transformed data');
      }
      
      if (kinship1 && kinship1.code) {
        assert(validCodes.includes(kinship1.code), `user1Kinship.code should be valid (got ${kinship1.code})`);
        assert(typeof kinship1.label === 'string', 'user1Kinship.label should be a string');
      } else {
        console.warn('   ⚠️  No user1Kinship found in transformed data');
      }
    }
  } catch (error) {
    assert(false, `Kinship transformation failed: ${error.message}`);
  }
}

// Test CSV file existence
async function testCSVFilesExist() {
  const requiredFiles = [
    'contracts.csv',
    'orgs.csv',
    'org_contracts.csv',
    'clinicians_anonymized.csv',
    'credentialed_insurances.csv',
    'clinician_credentialed_insurances.csv',
    'clinician_availabilities.csv',
    'documents.csv',
    'insurance_coverages.csv',
    'patients_and_guardians_anonymized.csv',
    'kinships.csv',
    'memberships.csv',
    'questionnaires.csv',
    'referrals.csv',
    'referral_members.csv',
    'patient_availabilities.csv',
  ];
  
  for (const file of requiredFiles) {
    try {
      const csvPath = getCSVPath(file);
      const data = await parseCSV(csvPath);
      assert(data.length > 0, `${file} should have data`);
    } catch (error) {
      assert(false, `${file} failed to parse: ${error.message}`);
    }
  }
}

// Run all tests
async function runTests() {
  await testCSVParsing();
  await testKinshipTransformation();
  await testCSVFilesExist();
  
  // Summary
  console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);
  
  if (testsFailed === 0) {
    console.log('✅ All integration tests passed!');
    console.log('\n💡 Next step: Run "npm run seed:dry-run" to test the import without writing to Firestore');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});

