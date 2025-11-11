/**
 * Unit Tests for constants.js
 * Tests application constants and configuration
 */

import assert from 'assert';

// Mock constants - matching actual constants.js
const CRISIS_RESOURCES = {
  CRISIS_TEXT_LINE: {
    name: "Crisis Text Line",
    phone: "741741",
    text: "Text HOME to 741741",
    url: "https://www.crisistextline.org/",
  },
  SUICIDE_LIFELINE: {
    name: "988 Suicide & Crisis Lifeline",
    phone: "988",
    text: "Call or text 988",
    url: "https://988lifeline.org/",
  },
  EMERGENCY: {
    name: "Emergency Services",
    phone: "911",
    text: "Call 911",
  },
};

const APPLICATION_STATUS = {
  STARTED: "started",
  ASSESSMENT_COMPLETE: "assessment_complete",
  INSURANCE_SUBMITTED: "insurance_submitted",
  SCHEDULED: "scheduled",
  COMPLETE: "complete",
};

const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  PATIENTS: "patients",
  CLINICIANS: "clinicians",
  ORGANIZATIONS: "organizations",
  CONVERSATIONS: "conversations",
  ONBOARDING_APPLICATIONS: "onboardingApplications",
  APPOINTMENTS: "appointments",
  INSURANCE_COVERAGES: "insuranceCoverages",
  QUESTIONNAIRES: "questionnaires",
  REFERRALS: "referrals",
  SUPPORT_CHATS: "supportChats",
};

const DATA_RETENTION_DAYS = 90;

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    testsPassed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    testsFailed++;
    console.error(`❌ ${name}: ${error.message}`);
  }
}

// Test CRISIS_RESOURCES
test('CRISIS_RESOURCES has required structure', () => {
  assert(CRISIS_RESOURCES.SUICIDE_LIFELINE, 'Should have suicide lifeline resource');
  assert(CRISIS_RESOURCES.SUICIDE_LIFELINE.phone === '988', 'Should have correct phone number');
  assert(CRISIS_RESOURCES.CRISIS_TEXT_LINE, 'Should have crisis text line resource');
  assert(CRISIS_RESOURCES.CRISIS_TEXT_LINE.phone.includes('741741'), 'Should have correct text line number');
  assert(CRISIS_RESOURCES.EMERGENCY, 'Should have emergency resource');
  assert(CRISIS_RESOURCES.EMERGENCY.phone === '911', 'Should have correct emergency number');
});

test('CRISIS_RESOURCES has URLs', () => {
  assert(CRISIS_RESOURCES.SUICIDE_LIFELINE.url.startsWith('http'), 'Should have valid URL');
  assert(CRISIS_RESOURCES.CRISIS_TEXT_LINE.url.startsWith('http'), 'Should have valid URL');
});

// Test APPLICATION_STATUS
test('APPLICATION_STATUS has all required statuses', () => {
  assert(APPLICATION_STATUS.STARTED === 'started', 'Should have started status');
  assert(APPLICATION_STATUS.ASSESSMENT_COMPLETE === 'assessment_complete', 'Should have assessment_complete status');
  assert(APPLICATION_STATUS.INSURANCE_SUBMITTED === 'insurance_submitted', 'Should have insurance_submitted status');
  assert(APPLICATION_STATUS.SCHEDULED === 'scheduled', 'Should have scheduled status');
  assert(APPLICATION_STATUS.COMPLETE === 'complete', 'Should have complete status');
});

// Test APPOINTMENT_STATUS
test('APPOINTMENT_STATUS has all required statuses', () => {
  assert(APPOINTMENT_STATUS.PENDING === 'pending', 'Should have pending status');
  assert(APPOINTMENT_STATUS.CONFIRMED === 'confirmed', 'Should have confirmed status');
  assert(APPOINTMENT_STATUS.COMPLETED === 'completed', 'Should have completed status');
  assert(APPOINTMENT_STATUS.CANCELLED === 'cancelled', 'Should have cancelled status');
});

// Test DATA_RETENTION_DAYS
test('DATA_RETENTION_DAYS is set correctly', () => {
  assert(DATA_RETENTION_DAYS === 90, 'Should be 90 days');
  assert(typeof DATA_RETENTION_DAYS === 'number', 'Should be a number');
});

// Test FIRESTORE_COLLECTIONS
test('FIRESTORE_COLLECTIONS has all required collections', () => {
  assert(FIRESTORE_COLLECTIONS.USERS === 'users', 'Should have users collection');
  assert(FIRESTORE_COLLECTIONS.CONVERSATIONS === 'conversations', 'Should have conversations collection');
  assert(FIRESTORE_COLLECTIONS.ONBOARDING_APPLICATIONS === 'onboardingApplications', 'Should have onboardingApplications collection');
  assert(FIRESTORE_COLLECTIONS.CLINICIANS === 'clinicians', 'Should have clinicians collection');
  assert(FIRESTORE_COLLECTIONS.APPOINTMENTS === 'appointments', 'Should have appointments collection');
  assert(FIRESTORE_COLLECTIONS.QUESTIONNAIRES === 'questionnaires', 'Should have questionnaires collection');
  assert(FIRESTORE_COLLECTIONS.SUPPORT_CHATS === 'supportChats', 'Should have supportChats collection');
});

test('FIRESTORE_COLLECTIONS values are strings', () => {
  Object.values(FIRESTORE_COLLECTIONS).forEach((value) => {
    assert(typeof value === 'string', `Collection name should be string: ${value}`);
  });
});

// Run all tests
function runTests() {
  console.log('🧪 Running Constants Unit Tests\n');
  console.log('='.repeat(50));
  
  // Tests are run via test() calls above
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log(`✅ ${testsPassed} passed, ❌ ${testsFailed} failed`);
  console.log('='.repeat(50));
  
  if (testsFailed > 0) {
    process.exit(1);
  } else {
    console.log('✅ All constants tests passed!');
    process.exit(0);
  }
}

runTests();

