/**
 * Unit Tests for Data Transformation
 * Tests data transformation functions used in CSV import
 * Run with: node tests/unit/dataTransform.test.js
 */

import { transformKinshipData } from '../../src/utils/kinshipMapping.js';
import { parseCSV, getCSVPath } from '../../scripts/importCSV.js';

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

console.log('🧪 Running Data Transformation Tests...\n');

// Test kinship data transformation
async function testKinshipTransformation() {
  // Test with sample data
  const testData = {
    id: 'test-id',
    user0Id: 'user-0-id',
    user1Id: 'user-1-id',
    user0Label: '1',
    user1Label: '2051',
    kind: 1,
  };
  
  const transformed = transformKinshipData(testData);
  
  assert(transformed.id === 'test-id', 'Transformation preserves id field');
  assert(transformed.user0Kinship !== undefined, 'Transformation creates user0Kinship object');
  assert(transformed.user0Kinship.code === 1, 'user0Kinship.code is correct');
  assert(transformed.user0Kinship.label === 'mother', 'user0Kinship.label is correct');
  assert(transformed.user1Kinship.code === 2051, 'user1Kinship.code is correct');
  assert(transformed.user1Kinship.label === 'guardian', 'user1Kinship.label is correct');
  
  // Check that original label fields are removed
  assert(transformed.user0Label === undefined, 'user0Label is removed after transformation');
  assert(transformed.user1Label === undefined, 'user1Label is removed after transformation');
}

// Test transformation with real CSV data
async function testRealCSVTransformation() {
  try {
    const csvPath = getCSVPath('kinships.csv');
    const data = await parseCSV(csvPath);
    
    if (data.length > 0) {
      const firstRow = data[0];
      const transformed = transformKinshipData(firstRow);
      
      assert(transformed.user0Kinship !== undefined || transformed.user1Kinship !== undefined, 
        'Real CSV data transforms correctly');
      
      // Validate kinship codes
      const validCodes = [1, 2, 12, 2051];
      if (transformed.user0Kinship) {
        assert(validCodes.includes(transformed.user0Kinship.code), 
          `user0Kinship.code is valid: ${transformed.user0Kinship.code}`);
        assert(typeof transformed.user0Kinship.label === 'string', 
          'user0Kinship.label is a string');
      }
      
      if (transformed.user1Kinship) {
        assert(validCodes.includes(transformed.user1Kinship.code), 
          `user1Kinship.code is valid: ${transformed.user1Kinship.code}`);
        assert(typeof transformed.user1Kinship.label === 'string', 
          'user1Kinship.label is a string');
      }
      
      console.log(`   📊 Transformed ${data.length} kinship records`);
    }
  } catch (error) {
    assert(false, `Real CSV transformation failed: ${error.message}`);
  }
}

// Test JSON field parsing (for contracts, orgs, etc.)
async function testJSONFieldParsing() {
  try {
    const csvPath = getCSVPath('contracts.csv');
    const data = await parseCSV(csvPath);
    
    if (data.length > 0) {
      const firstRow = data[0];
      
      // Check if services field exists and might be JSON
      if ('services' in firstRow) {
        const services = firstRow.services;
        // Services might be a string (JSON) or already parsed
        assert(typeof services === 'string' || Array.isArray(services), 
          'Services field is string or array');
      }
      
      // Check if terms field exists
      if ('terms' in firstRow) {
        const terms = firstRow.terms;
        assert(typeof terms === 'string' || typeof terms === 'object', 
          'Terms field is string or object');
      }
    }
  } catch (error) {
    assert(false, `JSON field parsing test failed: ${error.message}`);
  }
}

// Test data validation
async function testDataValidation() {
  // Test that required fields are present
  try {
    const csvPath = getCSVPath('org_contracts.csv');
    const data = await parseCSV(csvPath);
    
    if (data.length > 0) {
      const firstRow = data[0];
      const keys = Object.keys(firstRow);
      
      // Check for required fields (id, organizationId/organizationid, contractId/contractid)
      const hasId = 'id' in firstRow || 'Id' in firstRow;
      const hasOrgId = keys.some(key => key.toLowerCase().includes('organization'));
      const hasContractId = keys.some(key => key.toLowerCase().includes('contract'));
      
      assert(hasId, 'Row has id field');
      assert(hasOrgId, 'Row has organization field (organizationid)');
      assert(hasContractId, 'Row has contract field (contractid)');
    }
  } catch (error) {
    assert(false, `Data validation test failed: ${error.message}`);
  }
}

// Test questionnaire type validation
async function testQuestionnaireTypeValidation() {
  try {
    const csvPath = getCSVPath('questionnaires.csv');
    const data = await parseCSV(csvPath);
    
    if (data.length > 0) {
      // Note: The CSV may have numeric codes that need mapping (similar to kinship codes)
      // For now, we just verify the type field exists
      const firstRow = data[0];
      const hasType = 'type' in firstRow || 'Type' in firstRow;
      
      assert(hasType, 'Questionnaire row has type field');
      
      // Check if types are numeric (need mapping) or string (already mapped)
      const typeValues = data
        .map(row => row.type || row.Type)
        .filter(Boolean)
        .slice(0, 10);
      
      const hasNumericTypes = typeValues.some(t => typeof t === 'string' && /^\d+$/.test(t));
      const hasStringTypes = typeValues.some(t => typeof t === 'string' && !/^\d+$/.test(t));
      
      if (hasNumericTypes) {
        console.log('   ℹ️  Questionnaire types are numeric codes (may need mapping)');
      }
      if (hasStringTypes) {
        console.log('   ℹ️  Questionnaire types are string values');
      }
      
      console.log(`   📊 Sample type values: ${typeValues.slice(0, 5).join(', ')}`);
    }
  } catch (error) {
    assert(false, `Questionnaire type validation failed: ${error.message}`);
  }
}

// Run all tests
async function runTests() {
  await testKinshipTransformation();
  await testRealCSVTransformation();
  await testJSONFieldParsing();
  await testDataValidation();
  await testQuestionnaireTypeValidation();
  
  // Summary
  console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);
  
  if (testsFailed === 0) {
    console.log('✅ All data transformation tests passed!');
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

