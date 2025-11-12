/**
 * Fix script to correct careProviderProfileId in clinicianAvailabilities
 * This fixes the issue where availability slots have undefined clinician IDs
 * Run with: node scripts/fixAvailabilityIds.js
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'nurtureai-3feb1',
  });
}

async function fixAvailabilityIds() {
  try {
    const db = admin.firestore();
    
    console.log('🔧 Fixing availability slot clinician IDs...\n');
    
    // 1. Build clinician ID map (healthie_id -> UUID)
    console.log('1. Building clinician ID map...');
    const cliniciansSnapshot = await db.collection('clinicians').get();
    const idMap = new Map();
    
    cliniciansSnapshot.forEach((doc) => {
      const data = doc.data();
      // Check multiple possible field names (note: CSV import uses lowercase)
      const healthieId = data.healthieid || data.healthieId || data.healthie_id || data.userId || data.user_id;
      if (healthieId) {
        idMap.set(String(healthieId), doc.id);
      }
    });
    
    console.log(`   ✅ Mapped ${idMap.size} clinicians\n`);
    
    if (idMap.size === 0) {
      console.error('❌ No clinicians found with healthie_id. Cannot fix availability slots.');
      return;
    }
    
    // 2. Get all availability slots
    console.log('2. Fetching availability slots...');
    const availabilitiesSnapshot = await db.collection('clinicianAvailabilities').get();
    console.log(`   ✅ Found ${availabilitiesSnapshot.size} availability slots\n`);
    
    // 3. Check what fields they have
    if (availabilitiesSnapshot.size > 0) {
      const sample = availabilitiesSnapshot.docs[0].data();
      console.log('   Sample availability slot fields:', Object.keys(sample));
      console.log('   Sample data:', JSON.stringify(sample, null, 2).substring(0, 200));
      console.log('');
    }
    
    // 4. Try to find the original user_id/userId field in the slots
    // The slots might have been imported with the wrong field name
    // We need to check if there's a field that matches a healthie_id
    
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500;
    
    console.log('3. Fixing availability slots...');
    
    for (const doc of availabilitiesSnapshot.docs) {
      const data = doc.data();
      const currentId = data.careProviderProfileId;
      
      // If already has a valid UUID, skip
      if (currentId && currentId.includes('-')) {
        skipped++;
        continue;
      }
      
      // Try to find the original user_id in various possible fields (CSV uses lowercase)
      const possibleUserId = data.userid || data.userId || data.user_id || data.careProviderProfileId || data.care_provider_profile_id;
      
      if (!possibleUserId) {
        console.warn(`   ⚠️  Slot ${doc.id} has no user ID field`);
        skipped++;
        continue;
      }
      
      // Try to map it
      const clinicianUuid = idMap.get(String(possibleUserId));
      
      if (!clinicianUuid) {
        // If it's already a UUID, check if it exists
        if (possibleUserId.includes('-')) {
          const clinicianDoc = await db.collection('clinicians').doc(possibleUserId).get();
          if (clinicianDoc.exists) {
            // It's already a valid UUID, just update the field name
            batch.update(doc.ref, { careProviderProfileId: possibleUserId });
            fixed++;
            batchCount++;
          } else {
            console.warn(`   ⚠️  Slot ${doc.id}: UUID ${possibleUserId} not found in clinicians`);
            skipped++;
          }
        } else {
          console.warn(`   ⚠️  Slot ${doc.id}: Cannot map user_id ${possibleUserId} to clinician UUID`);
          skipped++;
        }
      } else {
        // Found mapping, update it
        batch.update(doc.ref, { careProviderProfileId: clinicianUuid });
        fixed++;
        batchCount++;
      }
      
      // Commit batch when it reaches size limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`   ✅ Committed batch: ${fixed} fixed so far...`);
        batchCount = 0;
      }
    }
    
    // Commit remaining updates
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log(`\n✅ Fix complete!`);
    console.log(`   - Fixed: ${fixed}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Errors: ${errors}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAvailabilityIds();

