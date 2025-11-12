/**
 * Check the structure of availability slots
 */

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'nurtureai-3feb1',
  });
}

async function checkStructure() {
  const db = admin.firestore();
  
  const availabilitiesSnapshot = await db.collection('clinicianAvailabilities')
    .limit(5)
    .get();
  
  console.log('Sample availability slot structure:\n');
  
  availabilitiesSnapshot.forEach((doc, index) => {
    if (index >= 3) return;
    
    const data = doc.data();
    console.log(`Slot ${doc.id}:`);
    console.log(JSON.stringify(data, null, 2));
    console.log('\n---\n');
  });
  
  process.exit(0);
}

checkStructure();

