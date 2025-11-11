/**
 * Unit Tests for Availability Filtering
 * Tests time slot filtering and date range queries
 */

import { strict as assert } from 'assert';

// Mock time slot data
function createMockSlot(id, daysFromNow = 0, hours = 9) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(hours + 1, 0, 0, 0);
  
  return {
    id: `slot${id}`,
    startTime: date,
    endTime: endDate,
    isBooked: false,
  };
}

function testSlotFiltering() {
  console.log('Testing slot filtering...');
  
  // Create slots: some in past, some in future, some booked
  const slots = [
    createMockSlot(1, -1, 9), // Yesterday
    createMockSlot(2, 0, 10),  // Today
    createMockSlot(3, 1, 11),  // Tomorrow
    createMockSlot(4, 2, 14),  // Day after tomorrow
    { ...createMockSlot(5, 3, 15), isBooked: true }, // Booked
  ];
  
  // Filter out past slots
  const now = new Date();
  const futureSlots = slots.filter(slot => slot.startTime > now);
  assert.ok(futureSlots.length === 3, 'Should filter out past slots');
  console.log('✅ Test 1 passed: Past slots filtered');
  
  // Filter out booked slots
  const availableSlots = slots.filter(slot => !slot.isBooked);
  assert.ok(availableSlots.length === 4, 'Should filter out booked slots');
  console.log('✅ Test 2 passed: Booked slots filtered');
  
  // Filter by date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 2);
  
  const rangeSlots = slots.filter(slot => 
    slot.startTime >= startDate && slot.startTime <= endDate && !slot.isBooked
  );
  assert.ok(rangeSlots.length >= 1, 'Should filter by date range');
  console.log('✅ Test 3 passed: Date range filtering works');
}

function testSlotSorting() {
  console.log('\nTesting slot sorting...');
  
  const slots = [
    createMockSlot(1, 2, 14), // Later day, afternoon
    createMockSlot(2, 1, 9),  // Earlier day, morning
    createMockSlot(3, 1, 11), // Same day, later time
    createMockSlot(4, 2, 10), // Later day, morning
  ];
  
  // Sort by time
  const sorted = [...slots].sort((a, b) => a.startTime - b.startTime);
  
  assert.ok(sorted[0].startTime <= sorted[1].startTime, 'Slots should be sorted chronologically');
  assert.ok(sorted[1].startTime <= sorted[2].startTime, 'Sorting should be consistent');
  console.log('✅ Test 1 passed: Slots sorted chronologically');
  
  // Verify first slot is earliest
  const earliest = sorted[0];
  const allEarlier = slots.every(slot => slot.startTime >= earliest.startTime);
  assert.ok(allEarlier, 'First slot should be earliest');
  console.log('✅ Test 2 passed: Earliest slot first');
}

function testDateRangeQueries() {
  console.log('\nTesting date range queries...');
  
  const slots = [
    createMockSlot(1, 0, 9),   // Today
    createMockSlot(2, 1, 10),  // Tomorrow
    createMockSlot(3, 7, 11),  // Next week
    createMockSlot(4, 30, 14), // Next month
  ];
  
  // Query next 7 days
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  
  const weekSlots = slots.filter(slot => 
    slot.startTime >= now && slot.startTime <= weekFromNow
  );
  assert.ok(weekSlots.length === 2, 'Should find slots in next 7 days');
  console.log('✅ Test 1 passed: 7-day range query works');
  
  // Query next 30 days
  const monthFromNow = new Date();
  monthFromNow.setDate(monthFromNow.getDate() + 30);
  
  const monthSlots = slots.filter(slot => 
    slot.startTime >= now && slot.startTime <= monthFromNow
  );
  assert.ok(monthSlots.length === 3, 'Should find slots in next 30 days');
  console.log('✅ Test 2 passed: 30-day range query works');
  
  // Query specific date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 1);
  targetDate.setHours(0, 0, 0, 0);
  const targetEnd = new Date(targetDate);
  targetEnd.setHours(23, 59, 59, 999);
  
  const daySlots = slots.filter(slot => 
    slot.startTime >= targetDate && slot.startTime <= targetEnd
  );
  assert.ok(daySlots.length === 1, 'Should find slots for specific day');
  console.log('✅ Test 3 passed: Specific date query works');
}

function testSlotGrouping() {
  console.log('\nTesting slot grouping by date...');
  
  const slots = [
    createMockSlot(1, 1, 9),  // Day 1, 9 AM
    createMockSlot(2, 1, 10), // Day 1, 10 AM
    createMockSlot(3, 1, 14),  // Day 1, 2 PM
    createMockSlot(4, 2, 9),  // Day 2, 9 AM
    createMockSlot(5, 2, 11), // Day 2, 11 AM
  ];
  
  // Group by date
  const grouped = {};
  slots.forEach(slot => {
    const dateKey = slot.startTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(slot);
  });
  
  const dateKeys = Object.keys(grouped);
  assert.ok(dateKeys.length === 2, 'Should group into 2 dates');
  console.log('✅ Test 1 passed: Slots grouped by date');
  
  // Verify each group has correct slots
  const firstDateSlots = grouped[dateKeys[0]];
  assert.ok(firstDateSlots.length === 3, 'First date should have 3 slots');
  console.log('✅ Test 2 passed: Grouping preserves all slots');
}

function testEdgeCases() {
  console.log('\nTesting edge cases...');
  
  // Empty slots array
  const empty = [];
  const filtered = empty.filter(slot => !slot.isBooked);
  assert.ok(filtered.length === 0, 'Should handle empty array');
  console.log('✅ Handles empty slots array');
  
  // All slots booked
  const allBooked = [
    { ...createMockSlot(1, 1, 9), isBooked: true },
    { ...createMockSlot(2, 1, 10), isBooked: true },
  ];
  const available = allBooked.filter(slot => !slot.isBooked);
  assert.ok(available.length === 0, 'Should handle all booked slots');
  console.log('✅ Handles all booked slots');
  
  // Invalid dates
  const invalidSlot = {
    id: 'invalid',
    startTime: new Date('invalid'),
    endTime: new Date('invalid'),
    isBooked: false,
  };
  const validSlots = [invalidSlot].filter(slot => 
    !isNaN(slot.startTime.getTime())
  );
  assert.ok(validSlots.length === 0, 'Should filter invalid dates');
  console.log('✅ Handles invalid dates');
}

// Run all tests
function runTests() {
  console.log('🧪 Running Availability Filtering Unit Tests\n');
  console.log('='.repeat(50));
  
  try {
    testSlotFiltering();
    testSlotSorting();
    testDateRangeQueries();
    testSlotGrouping();
    testEdgeCases();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All availability filtering tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if executed directly
if (import.meta.url.endsWith(process.argv[1]) || import.meta.url.includes('availabilityFiltering.test.js')) {
  runTests();
}

export { testSlotFiltering, testSlotSorting, testDateRangeQueries, testSlotGrouping, testEdgeCases };

