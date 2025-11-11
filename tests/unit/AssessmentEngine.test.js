/**
 * Unit Tests for Assessment Engine
 * Tests conversation flow, assessment logic, and data tracking
 * 
 * Run with: node tests/unit/AssessmentEngine.test.js
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

// Mock OpenAI API
let mockOpenAIResponse = null;

// We'll need to mock the OpenAI service
// For now, we'll test the structure and basic functionality

async function runTests() {
  console.log('🧪 Running Assessment Engine Tests...\n');
  
  // Test: Initialization
  console.log('📋 Testing Initialization...');
  const engine = new AssessmentEngine();
  
  const history = engine.getConversationHistory();
  assert(history.length === 0, 'should initialize with empty conversation history (system message excluded)');
  
  const summary = engine.getAssessmentSummary();
  assert(Array.isArray(summary.concerns), 'should initialize with concerns array');
  assert(Array.isArray(summary.symptoms), 'should initialize with symptoms array');
  assert(summary.crisisDetected === false, 'should initialize with crisisDetected = false');
  assert(summary.suitability === null || typeof summary.suitability === 'string', 'should initialize with suitability field');
  
  // Test: Reset functionality
  console.log('\n📋 Testing Reset Functionality...');
  engine.reset();
  const summaryAfterReset = engine.getAssessmentSummary();
  assert(summaryAfterReset.concerns.length === 0, 'reset should clear concerns');
  assert(summaryAfterReset.crisisDetected === false, 'reset should clear crisis detection');
  
  // Test: Conversation History
  console.log('\n📋 Testing Conversation History...');
  const historyAfterReset = engine.getConversationHistory();
  assert(historyAfterReset.length === 0, 'reset should clear conversation history');
  
  // Test: Assessment Summary Structure
  console.log('\n📋 Testing Assessment Summary Structure...');
  const fullSummary = engine.getAssessmentSummary();
  assert(fullSummary.hasOwnProperty('messageCount'), 'summary should have messageCount property');
  assert(fullSummary.hasOwnProperty('conversationLength'), 'summary should have conversationLength property');
  assert(fullSummary.hasOwnProperty('crisisDetected'), 'summary should have crisisDetected property');
  assert(fullSummary.hasOwnProperty('suitability'), 'summary should have suitability property');
  assert(fullSummary.hasOwnProperty('concerns'), 'summary should have concerns property');
  assert(fullSummary.hasOwnProperty('symptoms'), 'summary should have symptoms property');
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results:');
  console.log(`✅ ${testsPassed} passed, ❌ ${testsFailed} failed`);
  console.log('='.repeat(60));
  
  if (testsFailed > 0) {
    console.error('❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('✅ All Assessment Engine tests passed!');
    console.log('\n💡 Note: Full message processing tests require OpenAI API key');
    console.log('   These tests verify structure and basic functionality');
    process.exit(0);
  }
}

runTests().catch((error) => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
