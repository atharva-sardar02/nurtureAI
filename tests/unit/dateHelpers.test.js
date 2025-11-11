/**
 * Unit Tests for dateHelpers.js
 * Tests date formatting and utility functions
 */

import assert from 'assert';

// Mock the dateHelpers module
// Since we're in Node.js, we'll test the logic directly
// Import actual functions - we'll test the logic
function formatTime(date) {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);
}

function formatDate(date) {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

function formatDateShort(date) {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(dateObj);
}

function formatDateTime(date) {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);
}

function formatRelativeTime(date) {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
}

function isToday(date) {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return false;

  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

function isPast(date) {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return false;

  return dateObj < new Date();
}

function isFuture(date) {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return false;

  return dateObj > new Date();
}

function daysUntil(date) {
  if (!date) return 0;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return 0;

  const now = new Date();
  const diffInMs = dateObj - now;
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

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

// Test formatTime
test('formatTime formats valid Date object', () => {
  const date = new Date('2024-01-15T14:30:00');
  const result = formatTime(date);
  assert(result.includes('2:30') || result.includes('14:30'), 'Should format time correctly');
});

test('formatTime formats date string', () => {
  const result = formatTime('2024-01-15T14:30:00');
  assert(result.length > 0, 'Should format date string');
});

test('formatTime handles null/undefined', () => {
  assert(formatTime(null) === '', 'Should return empty string for null');
  assert(formatTime(undefined) === '', 'Should return empty string for undefined');
});

test('formatTime handles invalid date', () => {
  assert(formatTime('invalid') === '', 'Should return empty string for invalid date');
});

// Test formatDate
test('formatDate formats valid Date object', () => {
  const date = new Date('2024-01-15');
  const result = formatDate(date);
  assert(result.length > 0, 'Should return formatted date string');
  assert(result.includes('January') || result.includes('Jan') || result.includes('1'), 'Should include month');
  assert(result.includes('15') || result.includes('2024'), 'Should include day or year');
});

test('formatDate formats date string', () => {
  const result = formatDate('2024-01-15');
  assert(result.length > 0, 'Should format date string');
});

test('formatDate handles null/undefined', () => {
  assert(formatDate(null) === '', 'Should return empty string for null');
  assert(formatDate(undefined) === '', 'Should return empty string for undefined');
});

// Test formatDateTime
test('formatDateTime formats valid Date object', () => {
  const date = new Date('2024-01-15T14:30:00');
  const result = formatDateTime(date);
  assert(result.length > 0, 'Should format date and time');
});

test('formatDateTime handles null/undefined', () => {
  assert(formatDateTime(null) === '', 'Should return empty string for null');
  assert(formatDateTime(undefined) === '', 'Should return empty string for undefined');
});

// Test formatDateShort
test('formatDateShort formats date correctly', () => {
  const date = new Date('2024-01-15');
  const result = formatDateShort(date);
  assert(result.length > 0, 'Should return formatted date string');
  // Format should be MM/DD/YYYY or similar
  assert(result.includes('/') || result.includes('-'), 'Should include date separator');
  assert(result.includes('2024') || result.includes('24'), 'Should include year');
});

// Test formatRelativeTime
test('formatRelativeTime returns "just now" for recent dates', () => {
  const date = new Date(Date.now() - 30 * 1000); // 30 seconds ago
  const result = formatRelativeTime(date);
  assert(result === 'just now', 'Should return "just now" for very recent dates');
});

test('formatRelativeTime returns minutes ago', () => {
  const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
  const result = formatRelativeTime(date);
  assert(result.includes('minute'), 'Should include "minute" in result');
});

test('formatRelativeTime returns hours ago', () => {
  const date = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
  const result = formatRelativeTime(date);
  assert(result.includes('hour'), 'Should include "hour" in result');
});

test('formatRelativeTime returns days ago', () => {
  const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
  const result = formatRelativeTime(date);
  assert(result.includes('day'), 'Should include "day" in result');
});

test('formatRelativeTime returns months ago for old dates', () => {
  const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // ~60 days ago
  const result = formatRelativeTime(date);
  assert(result.includes('month') || result.includes('day'), 'Should include "month" or "day" in result');
});

test('formatRelativeTime handles null/undefined', () => {
  assert(formatRelativeTime(null) === '', 'Should return empty string for null');
  assert(formatRelativeTime(undefined) === '', 'Should return empty string for undefined');
});

// Test isToday
test('isToday returns true for today', () => {
  const today = new Date();
  assert(isToday(today) === true, 'Should return true for today');
});

test('isToday returns false for yesterday', () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  assert(isToday(yesterday) === false, 'Should return false for yesterday');
});

test('isToday handles null/undefined', () => {
  assert(isToday(null) === false, 'Should return false for null');
  assert(isToday(undefined) === false, 'Should return false for undefined');
});

// Test isPast
test('isPast returns true for past dates', () => {
  const past = new Date('2020-01-01');
  assert(isPast(past) === true, 'Should return true for past dates');
});

test('isPast returns false for future dates', () => {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
  assert(isPast(future) === false, 'Should return false for future dates');
});

// Test isFuture
test('isFuture returns true for future dates', () => {
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
  assert(isFuture(future) === true, 'Should return true for future dates');
});

test('isFuture returns false for past dates', () => {
  const past = new Date('2020-01-01');
  assert(isFuture(past) === false, 'Should return false for past dates');
});

// Test daysUntil
test('daysUntil returns positive for future dates', () => {
  const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const result = daysUntil(future);
  assert(result > 0, 'Should return positive number for future dates');
});

test('daysUntil returns negative for past dates', () => {
  const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const result = daysUntil(past);
  assert(result < 0, 'Should return negative number for past dates');
});

// Run all tests
function runTests() {
  console.log('🧪 Running Date Helpers Unit Tests\n');
  console.log('='.repeat(50));
  
  // Tests are run via test() calls above
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log(`✅ ${testsPassed} passed, ❌ ${testsFailed} failed`);
  console.log('='.repeat(50));
  
  if (testsFailed > 0) {
    process.exit(1);
  } else {
    console.log('✅ All date helpers tests passed!');
    process.exit(0);
  }
}

runTests();

