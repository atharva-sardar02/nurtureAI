/**
 * Unit Tests for Insurance Calculator Service
 * Tests cost calculation logic for various insurance scenarios
 */

import { strict as assert } from 'assert';

// Import calculation functions (standalone versions for testing)
function calculateSessionCost(coverage, sessionCost = 150) {
  if (!coverage) {
    return {
      sessionCost,
      outOfPocket: sessionCost,
      insurancePays: 0,
      copay: 0,
      deductibleRemaining: 0,
      message: 'No coverage information available',
    };
  }

  const copay = coverage.copay || coverage.copayAmount || 0;
  const deductible = coverage.deductible || 0;
  const coveragePercent = coverage.coverage || coverage.coveragePercent || 0;
  const outOfPocketMax = coverage.outOfPocketMax || coverage.outOfPocketMaximum || 0;
  const deductibleUsed = coverage.deductibleUsed || 0;
  const deductibleRemaining = Math.max(0, deductible - deductibleUsed);

  let outOfPocket = 0;
  let insurancePays = 0;
  let message = '';

  // If copay is specified, use copay model
  if (copay > 0) {
    outOfPocket = copay;
    insurancePays = sessionCost - copay;
    message = `You pay $${copay} copay per session`;
  }
  // If deductible not met, patient pays full cost until deductible is met
  else if (deductibleRemaining > 0) {
    const amountTowardDeductible = Math.min(sessionCost, deductibleRemaining);
    outOfPocket = amountTowardDeductible;
    insurancePays = 0;
    message = `Deductible not met. You pay full cost until $${deductible} deductible is met`;
  }
  // After deductible, apply coverage percentage
  else if (coveragePercent > 0) {
    insurancePays = (sessionCost * coveragePercent) / 100;
    outOfPocket = sessionCost - insurancePays;
    message = `Insurance covers ${coveragePercent}% after deductible`;
  }
  // No coverage specified
  else {
    outOfPocket = sessionCost;
    insurancePays = 0;
    message = 'Coverage details not available';
  }

  // Apply out-of-pocket maximum if applicable
  if (outOfPocketMax > 0) {
    const outOfPocketUsed = coverage.outOfPocketUsed || 0;
    const remainingOOP = outOfPocketMax - outOfPocketUsed;
    
    if (remainingOOP <= 0) {
      outOfPocket = 0;
      insurancePays = sessionCost;
      message = 'Out-of-pocket maximum reached. Insurance covers 100%';
    } else if (outOfPocket > remainingOOP) {
      outOfPocket = remainingOOP;
      insurancePays = sessionCost - remainingOOP;
      message = `Out-of-pocket maximum nearly reached. You pay $${remainingOOP} this session`;
    }
  }

  return {
    sessionCost,
    outOfPocket: Math.round(outOfPocket * 100) / 100,
    insurancePays: Math.round(insurancePays * 100) / 100,
    copay,
    deductibleRemaining,
    outOfPocketMax,
    message,
  };
}

function testCopayCalculation() {
  console.log('Testing copay calculation...');
  
  // Test 1: Simple copay
  const coverage1 = { copay: 40 };
  const result1 = calculateSessionCost(coverage1, 150);
  assert.ok(result1.outOfPocket === 40, 'Should charge copay amount');
  assert.ok(result1.insurancePays === 110, 'Insurance should pay remainder');
  console.log('✅ Test 1 passed: Simple copay calculation');
  
  // Test 2: Copay with high session cost
  const coverage2 = { copay: 25 };
  const result2 = calculateSessionCost(coverage2, 200);
  assert.ok(result2.outOfPocket === 25, 'Copay should be fixed amount');
  assert.ok(result2.insurancePays === 175, 'Insurance pays difference');
  console.log('✅ Test 2 passed: Copay with different session cost');
  
  // Test 3: Zero copay
  const coverage3 = { copay: 0 };
  const result3 = calculateSessionCost(coverage3, 150);
  assert.ok(result3.outOfPocket === 150, 'Zero copay means full cost');
  console.log('✅ Test 3 passed: Zero copay handling');
}

function testDeductibleCalculation() {
  console.log('\nTesting deductible calculation...');
  
  // Test 1: Deductible not met
  const coverage1 = { deductible: 1500, deductibleUsed: 0 };
  const result1 = calculateSessionCost(coverage1, 150);
  assert.ok(result1.outOfPocket === 150, 'Should pay full cost until deductible met');
  assert.ok(result1.insurancePays === 0, 'Insurance pays nothing until deductible met');
  console.log('✅ Test 1 passed: Deductible not met');
  
  // Test 2: Partial deductible remaining
  const coverage2 = { deductible: 1500, deductibleUsed: 1400 };
  const result2 = calculateSessionCost(coverage2, 150);
  assert.ok(result2.outOfPocket === 100, 'Should pay remaining deductible amount');
  console.log('✅ Test 2 passed: Partial deductible remaining');
  
  // Test 3: Deductible met
  const coverage3 = { deductible: 1500, deductibleUsed: 1500, coverage: 80 };
  const result3 = calculateSessionCost(coverage3, 150);
  assert.ok(result3.outOfPocket < 150, 'Should apply coverage after deductible');
  assert.ok(result3.insurancePays > 0, 'Insurance should pay after deductible');
  console.log('✅ Test 3 passed: Deductible met, coverage applies');
}

function testCoveragePercentage() {
  console.log('\nTesting coverage percentage calculation...');
  
  // Test 1: 80% coverage
  const coverage1 = { deductible: 1000, deductibleUsed: 1000, coverage: 80 };
  const result1 = calculateSessionCost(coverage1, 150);
  assert.ok(result1.outOfPocket === 30, 'Should pay 20% (80% covered)');
  assert.ok(result1.insurancePays === 120, 'Insurance should pay 80%');
  console.log('✅ Test 1 passed: 80% coverage calculation');
  
  // Test 2: 100% coverage
  const coverage2 = { deductible: 1000, deductibleUsed: 1000, coverage: 100 };
  const result2 = calculateSessionCost(coverage2, 150);
  assert.ok(result2.outOfPocket === 0, '100% coverage means no out-of-pocket');
  assert.ok(result2.insurancePays === 150, 'Insurance pays full amount');
  console.log('✅ Test 2 passed: 100% coverage');
  
  // Test 3: 50% coverage
  const coverage3 = { deductible: 1000, deductibleUsed: 1000, coverage: 50 };
  const result3 = calculateSessionCost(coverage3, 150);
  assert.ok(result3.outOfPocket === 75, 'Should pay 50%');
  assert.ok(result3.insurancePays === 75, 'Insurance pays 50%');
  console.log('✅ Test 3 passed: 50% coverage');
}

function testOutOfPocketMaximum() {
  console.log('\nTesting out-of-pocket maximum...');
  
  // Test 1: OOP max not reached
  const coverage1 = {
    deductible: 1000,
    deductibleUsed: 1000,
    coverage: 80,
    outOfPocketMax: 5000,
    outOfPocketUsed: 2000,
  };
  const result1 = calculateSessionCost(coverage1, 150);
  assert.ok(result1.outOfPocket > 0, 'Should pay until OOP max reached');
  console.log('✅ Test 1 passed: OOP max not reached');
  
  // Test 2: OOP max reached
  const coverage2 = {
    deductible: 1000,
    deductibleUsed: 1000,
    coverage: 80,
    outOfPocketMax: 5000,
    outOfPocketUsed: 5000,
  };
  const result2 = calculateSessionCost(coverage2, 150);
  assert.ok(result2.outOfPocket === 0, 'OOP max reached, no out-of-pocket');
  assert.ok(result2.insurancePays === 150, 'Insurance covers 100% after OOP max');
  console.log('✅ Test 2 passed: OOP max reached');
  
  // Test 3: OOP max nearly reached
  const coverage3 = {
    deductible: 1000,
    deductibleUsed: 1000,
    coverage: 80,
    outOfPocketMax: 5000,
    outOfPocketUsed: 4950,
  };
  const result3 = calculateSessionCost(coverage3, 150);
  assert.ok(result3.outOfPocket <= 50, 'Should only pay remaining OOP max');
  console.log('✅ Test 3 passed: OOP max nearly reached');
}

function testEdgeCases() {
  console.log('\nTesting edge cases...');
  
  // Test 1: No coverage
  const result1 = calculateSessionCost(null, 150);
  assert.ok(result1.outOfPocket === 150, 'No coverage means full cost');
  console.log('✅ Handles no coverage');
  
  // Test 2: Copay takes precedence over deductible
  const coverage2 = { copay: 40, deductible: 1500 };
  const result2 = calculateSessionCost(coverage2, 150);
  assert.ok(result2.outOfPocket === 40, 'Copay should take precedence');
  console.log('✅ Copay takes precedence');
  
  // Test 3: Zero deductible
  const coverage3 = { deductible: 0, coverage: 80 };
  const result3 = calculateSessionCost(coverage3, 150);
  assert.ok(result3.outOfPocket < 150, 'Should apply coverage immediately');
  console.log('✅ Handles zero deductible');
  
  // Test 4: High session cost
  const coverage4 = { copay: 50 };
  const result4 = calculateSessionCost(coverage4, 500);
  assert.ok(result4.outOfPocket === 50, 'Copay should be fixed regardless of session cost');
  console.log('✅ Handles high session cost');
}

// Run all tests
function runTests() {
  console.log('🧪 Running Insurance Calculator Unit Tests\n');
  console.log('='.repeat(50));
  
  try {
    testCopayCalculation();
    testDeductibleCalculation();
    testCoveragePercentage();
    testOutOfPocketMaximum();
    testEdgeCases();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All Insurance Calculator tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if executed directly
if (import.meta.url.endsWith(process.argv[1]) || import.meta.url.includes('InsuranceCalculator.test.js')) {
  runTests();
}

export {
  testCopayCalculation,
  testDeductibleCalculation,
  testCoveragePercentage,
  testOutOfPocketMaximum,
  testEdgeCases,
};

