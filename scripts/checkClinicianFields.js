/**
 * Check what fields clinicians actually have
 */

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'nurtureai-3feb1',
  });
}

async function checkFields() {
  const db = admin.firestore();
  const cliniciansSnapshot = await db.collection('clinicians').limit(3).get();
  
  console.log('Sample clinician documents:\n');
  cliniciansSnapshot.forEach((doc, index) => {
    console.log(`Clinician ${index + 1} (ID: ${doc.id}):`);
    console.log(JSON.stringify(doc.data(), null, 2));
    console.log('\n---\n');
  });
  
  process.exit(0);
}

checkFields();

