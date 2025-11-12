/**
 * Diagnostic script to check clinician data in Firestore
 * Run with: node scripts/checkClinicians.js
 */

import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin (uses Application Default Credentials)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'nurtureai-3feb1',
  });
}

async function checkClinicians() {
  try {
    const db = admin.firestore();

    console.log('🔍 Checking Firestore data...\n');

    // 1. Check clinicians collection
    console.log('1. Checking clinicians collection...');
    const cliniciansSnapshot = await db.collection('clinicians').get();
    console.log(`   ✅ Found ${cliniciansSnapshot.size} clinicians`);
    
    if (cliniciansSnapshot.size > 0) {
      console.log('   Sample clinician IDs:');
      let index = 0;
      cliniciansSnapshot.forEach((doc) => {
        if (index < 3) {
          const data = doc.data();
          console.log(`      - ${doc.id}: ${data.name || data.displayName || 'No name'}`);
          index++;
        }
      });
    }

    // 2. Check clinicianAvailabilities collection
    console.log('\n2. Checking clinicianAvailabilities collection...');
    const availabilitiesSnapshot = await db.collection('clinicianAvailabilities').get();
    console.log(`   ✅ Found ${availabilitiesSnapshot.size} availability slots`);
    
    if (availabilitiesSnapshot.size > 0) {
      const availableCount = availabilitiesSnapshot.docs.filter(
        doc => !doc.data().isBooked
      ).length;
      console.log(`   ✅ ${availableCount} available (not booked)`);
      
      // Group by clinician
      const byClinician = {};
      availabilitiesSnapshot.forEach((doc) => {
        const data = doc.data();
        const clinicianId = data.careProviderProfileId;
        if (!byClinician[clinicianId]) {
          byClinician[clinicianId] = { total: 0, available: 0 };
        }
        byClinician[clinicianId].total++;
        if (!data.isBooked) {
          byClinician[clinicianId].available++;
        }
      });
      
      console.log(`   Availability by clinician:`);
      for (const [clinicianId, counts] of Object.entries(byClinician)) {
        console.log(`      - ${clinicianId}: ${counts.available}/${counts.total} available`);
      }
    }

    // 3. Check credentialedInsurances collection
    console.log('\n3. Checking credentialedInsurances collection...');
    const insurancesSnapshot = await db.collection('credentialedInsurances').get();
    console.log(`   ✅ Found ${insurancesSnapshot.size} insurance providers`);
    
    if (insurancesSnapshot.size > 0) {
      console.log('   Sample insurance providers:');
      let index = 0;
      insurancesSnapshot.forEach((doc) => {
        if (index < 5) {
          const data = doc.data();
          console.log(`      - ${doc.id}: ${data.name || data.provider || data.insuranceName || 'No name'}`);
          index++;
        }
      });
    }

    // 4. Check clinicianCredentialedInsurances collection
    console.log('\n4. Checking clinicianCredentialedInsurances collection...');
    const clinicianInsurancesSnapshot = await db.collection('clinicianCredentialedInsurances').get();
    console.log(`   ✅ Found ${clinicianInsurancesSnapshot.size} clinician-insurance mappings`);
    
    if (clinicianInsurancesSnapshot.size > 0) {
      // Group by clinician
      const byClinician = {};
      clinicianInsurancesSnapshot.forEach((doc) => {
        const data = doc.data();
        const clinicianId = data.careProviderProfileId || data.care_provider_profile_id;
        if (clinicianId) {
          if (!byClinician[clinicianId]) {
            byClinician[clinicianId] = [];
          }
          byClinician[clinicianId].push(data.insuranceId || data.credentialedInsuranceId);
        }
      });
      
      console.log(`   Insurance mappings by clinician:`);
      const entries = Object.entries(byClinician).slice(0, 5);
      for (const [clinicianId, insuranceIds] of entries) {
        console.log(`      - ${clinicianId}: ${insuranceIds.length} insurances`);
      }
    }

    // 5. Test a sample query (like the app does)
    console.log('\n5. Testing sample availability query...');
    if (cliniciansSnapshot.size > 0) {
      const firstClinician = cliniciansSnapshot.docs[0];
      const clinicianId = firstClinician.id;
      
      const now = new Date();
      const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const startTimestamp = admin.firestore.Timestamp.fromDate(now);
      const endTimestamp = admin.firestore.Timestamp.fromDate(future);
      
      try {
        const testSnapshot = await db.collection('clinicianAvailabilities')
          .where('careProviderProfileId', '==', clinicianId)
          .where('startTime', '>=', startTimestamp)
          .where('startTime', '<=', endTimestamp)
          .get();
        console.log(`   ✅ Query for clinician ${clinicianId}: Found ${testSnapshot.size} slots`);
      } catch (error) {
        console.error(`   ❌ Query failed: ${error.message}`);
        if (error.message.includes('index')) {
          console.error('   ⚠️  Missing Firestore index! Run: firebase deploy --only firestore:indexes');
        }
      }
    }

    console.log('\n✅ Diagnostic complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkClinicians();

