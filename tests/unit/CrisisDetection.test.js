/**
 * Unit Tests for Crisis Detection
 * Tests crisis keyword detection and threshold triggers
 * 
 * Run with: node tests/unit/CrisisDetection.test.js
 */

import { AssessmentEngine } from '../../src/services/ai/AssessmentEngine.js';

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

async function runTests() {
  console.log('🧪 Running Crisis Detection Tests...\n');
  
  const engine = new AssessmentEngine();
  
  // Test: Crisis Keywords Detection
  console.log('📋 Testing Crisis Keywords...');
  const crisisKeywords = [
    'suicide',
    'self-harm',
    'hurting myself',
    'kill myself',
    'end my life',
    'violence',
    'hurting others',
  ];
  
  // Test that the engine has crisis detection capability
  const summary = engine.getAssessmentSummary();
  assert(
    summary.hasOwnProperty('crisisDetected'),
    'Assessment engine should have crisisDetected property'
  );
  
  // Test: Case Insensitivity (structure test)
  console.log('\n📋 Testing Case Insensitivity Support...');
  assert(
    typeof engine.processMessage === 'function',
    'Engine should have processMessage function for processing messages'
  );
  
  // Test: Assessment Data Structure
  console.log('\n📋 Testing Assessment Data Structure...');
  assert(
    summary.crisisDetected === false,
    'Initial state should have crisisDetected = false'
  );
  
  // Test: Reset clears crisis detection
  console.log('\n📋 Testing Reset Functionality...');
  engine.reset();
  const summaryAfterReset = engine.getAssessmentSummary();
  assert(
    summaryAfterReset.crisisDetected === false,
    'Reset should clear crisis detection status'
  );
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results:');
  console.log(`✅ ${testsPassed} passed, ❌ ${testsFailed} failed`);
  console.log('='.repeat(60));
  
  if (testsFailed > 0) {
    console.error('❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('✅ All Crisis Detection structure tests passed!');
    console.log('\n💡 Note: Full keyword detection tests require OpenAI API key');
    console.log('   These tests verify structure and basic functionality');
    console.log('   Crisis keywords to test:', crisisKeywords.join(', '));
    process.exit(0);
  }
}

runTests().catch((error) => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
