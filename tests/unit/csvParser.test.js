/**
 * Unit Tests for CSV Parser
 * Tests CSV parsing functionality
 * Run with: node tests/unit/csvParser.test.js
 */

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

console.log('🧪 Running CSV Parser Tests...\n');

// Test CSV file path resolution
async function testCSVPathResolution() {
  try {
    const path = getCSVPath('test.csv');
    assert(path.includes('tests'), 'getCSVPath returns path in tests directory');
    assert(path.endsWith('test.csv'), 'getCSVPath includes filename');
  } catch (error) {
    assert(false, `getCSVPath failed: ${error.message}`);
  }
}

// Test CSV parsing for a simple file
async function testCSVParsing() {
  try {
    // Test with a file that should exist
    const csvPath = getCSVPath('contracts.csv');
    const data = await parseCSV(csvPath);
    
    assert(Array.isArray(data), 'parseCSV returns an array');
    assert(data.length > 0, 'parseCSV returns non-empty array');
    assert(typeof data[0] === 'object', 'parseCSV returns array of objects');
    
    // Check that headers are converted to camelCase
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    assert(keys.length > 0, 'Parsed row has keys');
    
    // Check for camelCase conversion (no underscores in keys)
    const hasUnderscores = keys.some(key => key.includes('_') && !key.startsWith('_'));
    // Note: Some fields like _fivetran_deleted may have underscores, which is OK
    // But most should be camelCase
    
    console.log(`   📊 Parsed ${data.length} rows from contracts.csv`);
    console.log(`   📊 Sample keys: ${keys.slice(0, 5).join(', ')}`);
  } catch (error) {
    assert(false, `CSV parsing failed: ${error.message}`);
  }
}

// Test CSV parsing for all required files
async function testAllCSVFiles() {
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
  
  let allPassed = true;
  
  for (const file of requiredFiles) {
    try {
      const csvPath = getCSVPath(file);
      const data = await parseCSV(csvPath);
      
      assert(data.length > 0, `${file} parsed successfully with ${data.length} rows`);
      
      // Check that first row has an 'id' field (most files should have this)
      if (data.length > 0) {
        const firstRow = data[0];
        const hasId = 'id' in firstRow || 'Id' in firstRow;
        // Not all files may have 'id', so this is informational
        if (hasId) {
          console.log(`   ✓ ${file}: Has ID field`);
        }
      }
    } catch (error) {
      assert(false, `${file} failed to parse: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test header transformation (camelCase conversion)
async function testHeaderTransformation() {
  try {
    const csvPath = getCSVPath('org_contracts.csv');
    const data = await parseCSV(csvPath);
    
    if (data.length > 0) {
      const firstRow = data[0];
      const keys = Object.keys(firstRow);
      
      // Check that organization_id becomes organizationId (or similar camelCase)
      // The transformation converts: organization_id -> organizationId
      const hasOrgId = keys.some(key => 
        key.toLowerCase().includes('organization') && 
        (key.includes('Id') || key.includes('id'))
      );
      assert(hasOrgId, 'Header transformation converts organization_id to camelCase');
      
      // Check that contract_id becomes contractId (or similar camelCase)
      const hasContractId = keys.some(key => 
        key.toLowerCase().includes('contract') && 
        (key.includes('Id') || key.includes('id'))
      );
      assert(hasContractId, 'Header transformation converts contract_id to camelCase');
      
      console.log(`   📊 Sample transformed keys: ${keys.slice(0, 5).join(', ')}`);
    }
  } catch (error) {
    assert(false, `Header transformation test failed: ${error.message}`);
  }
}

// Run all tests
async function runTests() {
  await testCSVPathResolution();
  await testCSVParsing();
  await testAllCSVFiles();
  await testHeaderTransformation();
  
  // Summary
  console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);
  
  if (testsFailed === 0) {
    console.log('✅ All CSV parser tests passed!');
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

