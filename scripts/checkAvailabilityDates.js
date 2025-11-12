/**
 * Check the date ranges of availability slots
 */

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'nurtureai-3feb1',
  });
}

async function checkDates() {
  const db = admin.firestore();
  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  console.log(`Current date: ${now.toISOString()}`);
  console.log(`30 days from now: ${future.toISOString()}\n`);
  
  const availabilitiesSnapshot = await db.collection('clinicianAvailabilities')
    .limit(10)
    .get();
  
  console.log('Sample availability slots:\n');
  let futureCount = 0;
  let pastCount = 0;
  
  availabilitiesSnapshot.forEach((doc) => {
    const data = doc.data();
    const startTime = data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime);
    const endTime = data.endTime?.toDate ? data.endTime.toDate() : new Date(data.endTime);
    const clinicianId = data.careProviderProfileId;
    
    const isFuture = startTime > now;
    const isInRange = startTime >= now && startTime <= future;
    
    if (isFuture) futureCount++;
    else pastCount++;
    
    console.log(`Slot ${doc.id}:`);
    console.log(`  Clinician: ${clinicianId || 'MISSING'}`);
    console.log(`  Start: ${startTime.toISOString()} (${isFuture ? 'FUTURE' : 'PAST'})`);
    console.log(`  End: ${endTime.toISOString()}`);
    console.log(`  In 30-day range: ${isInRange ? 'YES' : 'NO'}`);
    console.log(`  Booked: ${data.isBooked || false}`);
    console.log('');
  });
  
  // Check how many slots are in the future
  const allSlots = await db.collection('clinicianAvailabilities').get();
  let totalFuture = 0;
  let totalInRange = 0;
  
  allSlots.forEach((doc) => {
    const data = doc.data();
    if (!data.startTime) return;
    
    const startTime = data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime);
    if (startTime > now) {
      totalFuture++;
      if (startTime <= future && !data.isBooked) {
        totalInRange++;
      }
    }
  });
  
  console.log(`\nSummary:`);
  console.log(`  Total slots: ${allSlots.size}`);
  console.log(`  Future slots: ${totalFuture}`);
  console.log(`  Available in next 30 days: ${totalInRange}`);
  
  process.exit(0);
}

checkDates();

