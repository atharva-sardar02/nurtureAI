/**
 * Unit Tests for Onboarding Validation
 * Tests form validation rules and logic
 * 
 * Run with: node tests/unit/onboardingValidation.test.js
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

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email) return { valid: false, error: 'Email is required' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}

/**
 * Validate phone number format
 */
function validatePhone(phone) {
  if (!phone) return { valid: false, error: 'Phone number is required' };
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return { valid: false, error: 'Phone number must be at least 10 digits' };
  }
  return { valid: true };
}

/**
 * Validate required field
 */
function validateRequired(value, fieldName) {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

/**
 * Calculate progress percentage
 */
function calculateProgress(currentStepIndex, totalSteps) {
  return ((currentStepIndex + 1) / totalSteps) * 100;
}

console.log('🧪 Running Onboarding Validation Tests...\n');

// Email Validation Tests
console.log('📧 Testing Email Validation...');
const email1 = validateEmail('test@example.com');
assert(email1.valid === true, 'Valid email should pass');

const email2 = validateEmail('user.name@domain.co.uk');
assert(email2.valid === true, 'Valid email with subdomain should pass');

const email3 = validateEmail('invalid');
assert(email3.valid === false && email3.error.includes('valid'), 'Invalid email should fail');

const email4 = validateEmail('');
assert(email4.valid === false && email4.error.includes('required'), 'Empty email should fail');

// Phone Validation Tests
console.log('\n📞 Testing Phone Validation...');
const phone1 = validatePhone('(555) 123-4567');
assert(phone1.valid === true, 'Valid phone with formatting should pass');

const phone2 = validatePhone('5551234567');
assert(phone2.valid === true, 'Valid phone without formatting should pass');

const phone3 = validatePhone('123');
assert(phone3.valid === false && phone3.error.includes('10 digits'), 'Short phone should fail');

// Required Field Validation Tests
console.log('\n📝 Testing Required Field Validation...');
const req1 = validateRequired('value', 'Field');
assert(req1.valid === true, 'Non-empty value should pass');

const req2 = validateRequired('', 'Field');
assert(req2.valid === false && req2.error.includes('required'), 'Empty value should fail');

// Progress Calculation Tests
console.log('\n📊 Testing Progress Calculation...');
assert(calculateProgress(0, 5) === 20, 'Step 1 of 5 should be 20%');
assert(calculateProgress(2, 5) === 60, 'Step 3 of 5 should be 60%');
assert(calculateProgress(4, 5) === 100, 'Step 5 of 5 should be 100%');
assert(calculateProgress(0, 1) === 100, 'Single step should be 100%');

// Summary
console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);

if (testsFailed === 0) {
  console.log('✅ All onboarding validation tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}

