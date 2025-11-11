/**
 * Database Seeding Script
 * Imports all 16 CSV files into Firestore in the correct dependency order
 * 
 * Import Order (from PRD Section 9.2):
 * 1. Contracts
 * 2. Organizations
 * 3. Organization contracts (junction table)
 * 4. Clinicians base data
 * 5. Credentialed insurances
 * 6. Clinician credentialed insurances (junction table)
 * 7. Clinician availability
 * 8. Documents
 * 9. Insurance coverages
 * 10. Patients and guardians
 * 11. Kinships (with code mapping)
 * 12. Memberships
 * 13. Questionnaires
 * 14. Referrals
 * 15. Referral members (junction table)
 * 16. Patient availabilities
 */

import { importCSVToFirestore, getCSVPath } from './importCSV.js';
import { transformKinshipData } from '../src/utils/kinshipMapping.js';
import { transformQuestionnaireData } from '../src/utils/questionnaireMapping.js';
import { fileURLToPath } from 'url';
import path from 'path';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import configuration for each CSV file
const IMPORT_CONFIG = [
  // Phase 1: Base entities (no dependencies)
  {
    file: 'contracts.csv',
    collection: 'contracts',
    transform: (row) => {
      // Parse JSON strings if present
      if (row.services && typeof row.services === 'string') {
        try {
          row.services = JSON.parse(row.services);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      if (row.terms && typeof row.terms === 'string') {
        try {
          row.terms = JSON.parse(row.terms);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      return row;
    },
  },
  {
    file: 'orgs.csv',
    collection: 'organizations',
    transform: (row) => {
      // Parse JSON config if present
      if (row.config && typeof row.config === 'string') {
        try {
          row.config = JSON.parse(row.config);
        } catch (e) {
          row.config = {};
        }
      }
      return row;
    },
  },
  {
    file: 'org_contracts.csv',
    collection: 'orgContracts',
    transform: (row) => row,
  },
  {
    file: 'clinicians_anonymized.csv',
    collection: 'clinicians',
    transform: (row) => {
      // Parse JSON fields
      const jsonFields = ['profileData', 'migrationProfileData', 'systemLabels'];
      jsonFields.forEach(field => {
        if (row[field] && typeof row[field] === 'string') {
          try {
            row[field] = JSON.parse(row[field]);
          } catch (e) {
            row[field] = null;
          }
        }
      });
      
      // Parse array fields
      const arrayFields = ['licensedStates', 'careLanguages', 'licenses', 'statesActive'];
      arrayFields.forEach(field => {
        if (row[field] && typeof row[field] === 'string') {
          try {
            row[field] = JSON.parse(row[field]);
          } catch (e) {
            row[field] = [];
          }
        }
      });
      
      return row;
    },
  },
  {
    file: 'credentialed_insurances.csv',
    collection: 'credentialedInsurances',
    transform: (row) => row,
  },
  {
    file: 'clinician_credentialed_insurances.csv',
    collection: 'clinicianCredentialedInsurances',
    transform: (row) => {
      // Skip deleted rows
      if (row.fivetranDeleted === true || row.fivetranDeleted === 'true' || row._fivetran_deleted === true || row._fivetran_deleted === 'true') {
        return null;
      }
      
      // Map field names to match what the code expects
      // CSV has: care_provider_profile_id, credentialed_insurance_id
      // After camelCase conversion: careProviderProfileId, credentialedInsuranceId
      // Code expects: careProviderProfileId, insuranceId (or credentialedInsuranceId)
      return {
        ...row,
        // Ensure both field names are available for compatibility
        insuranceId: row.credentialedInsuranceId || row.credentialed_insurance_id,
      };
    },
  },
  {
    file: 'clinician_availabilities.csv',
    collection: 'clinicianAvailabilities',
    transform: (row) => {
      // Map field names and convert dates to Firestore Timestamps
      // CSV has: user_id, range_start, range_end
      // After camelCase conversion: userId, rangeStart, rangeEnd
      // Code expects: careProviderProfileId, startTime, endTime
      const Timestamp = admin.firestore.Timestamp;
      
      const transformed = {
        ...row,
        // Don't set careProviderProfileId here - it will be set by the ID map transform
        // This prevents undefined values
      };
      
      // Convert rangeStart to startTime (Firestore Timestamp)
      if (row.rangeStart) {
        const startDate = new Date(row.rangeStart);
        if (!isNaN(startDate.getTime())) {
          transformed.startTime = Timestamp.fromDate(startDate);
        }
      }
      
      // Convert rangeEnd to endTime (Firestore Timestamp)
      if (row.rangeEnd) {
        const endDate = new Date(row.rangeEnd);
        if (!isNaN(endDate.getTime())) {
          transformed.endTime = Timestamp.fromDate(endDate);
        }
      }
      
      // Ensure isBooked field exists (default to false)
      if (transformed.isBooked === undefined && transformed.is_booked === undefined) {
        transformed.isBooked = false;
      } else if (transformed.is_booked !== undefined) {
        transformed.isBooked = transformed.is_booked === true || transformed.is_booked === 'true';
      }
      
      return transformed;
    },
  },
  {
    file: 'documents.csv',
    collection: 'documents',
    transform: (row) => row,
  },
  {
    file: 'insurance_coverages.csv',
    collection: 'insuranceCoverages',
    transform: (row) => {
      // Parse numeric fields
      const numericFields = ['copay', 'deductible', 'outOfPocketMax', 'coverage'];
      numericFields.forEach(field => {
        if (row[field] && !isNaN(row[field])) {
          row[field] = parseFloat(row[field]);
        }
      });
      return row;
    },
  },
  {
    file: 'patients_and_guardians_anonymized.csv',
    collection: 'patients',
    transform: (row) => {
      // Separate patients and guardians if needed
      // For now, import all as patients (guardians will be linked via kinships)
      return row;
    },
  },
  {
    file: 'kinships.csv',
    collection: 'kinships',
    transform: (row) => {
      // Apply kinship code-to-label mapping
      return transformKinshipData(row);
    },
  },
  {
    file: 'memberships.csv',
    collection: 'memberships',
    transform: (row) => row,
  },
  {
    file: 'questionnaires.csv',
    collection: 'questionnaires',
    transform: (row) => {
      // Apply questionnaire type transformation
      const transformed = transformQuestionnaireData(row);
      
      // Parse numeric scores
      const numericFields = ['score', 'totalScore'];
      numericFields.forEach(field => {
        if (transformed[field] && !isNaN(transformed[field])) {
          transformed[field] = parseFloat(transformed[field]);
        }
      });
      
      return transformed;
    },
  },
  {
    file: 'referrals.csv',
    collection: 'referrals',
    transform: (row) => row,
  },
  {
    file: 'referral_members.csv',
    collection: 'referralMembers',
    transform: (row) => row,
  },
  {
    file: 'patient_availabilities.csv',
    collection: 'patientAvailabilities',
    transform: (row) => row,
  },
];

/**
 * Build a map of healthie_id to clinician UUID
 */
async function buildClinicianIdMap() {
  const db = admin.firestore();
  const cliniciansSnapshot = await db.collection('clinicians').get();
  const idMap = new Map();
  
  cliniciansSnapshot.forEach((doc) => {
    const data = doc.data();
    const healthieId = data.healthieId || data.healthie_id;
    if (healthieId) {
      idMap.set(String(healthieId), doc.id);
    }
  });
  
  return idMap;
}

/**
 * Main seeding function
 */
async function seedDatabase(options = {}) {
  const { dryRun = false, skipExisting = false } = options;
  
  console.log('🌱 Starting database seeding...');
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Skip Existing: ${skipExisting}\n`);

  const results = [];
  let totalImported = 0;
  let totalErrors = 0;
  let totalSkipped = 0;
  
  // Build clinician ID map after clinicians are imported
  let clinicianIdMap = new Map();

  for (const config of IMPORT_CONFIG) {
    // After clinicians are imported, build the ID map for availability mapping
    if (config.collection === 'clinicians' && !dryRun) {
      // Wait a moment for the import to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      clinicianIdMap = await buildClinicianIdMap();
      console.log(`📋 Built clinician ID map: ${clinicianIdMap.size} clinicians\n`);
    }
    
    // Update availability transform to use the ID map
    if (config.collection === 'clinicianAvailabilities' && clinicianIdMap.size > 0) {
      const originalTransform = config.transform;
      config.transform = (row) => {
        // Map user_id (healthie_id) to clinician UUID FIRST
        const userId = row.userId || row.user_id;
        if (!userId) {
          return { _skip: true };
        }
        
        const clinicianUuid = clinicianIdMap.get(String(userId));
        if (!clinicianUuid) {
          // Skip rows where we can't find the clinician
          return { _skip: true };
        }
        
        // Now call original transform with the mapped ID
        const transformed = originalTransform(row);
        transformed.careProviderProfileId = clinicianUuid;
        return transformed;
      };
    }
    
    // Update clinician_credentialed_insurances transform to use the ID map
    if (config.collection === 'clinicianCredentialedInsurances' && clinicianIdMap.size > 0) {
      const originalTransform = config.transform;
      config.transform = (row) => {
        // First check if row should be skipped (deleted, etc.)
        const preTransformed = originalTransform(row);
        if (!preTransformed || preTransformed._skip) {
          return preTransformed;
        }
        
        // Map care_provider_profile_id (which might be healthie_id) to clinician UUID
        const profileId = row.careProviderProfileId || row.care_provider_profile_id;
        if (!profileId) {
          return { _skip: true };
        }
        
        let clinicianUuid = null;
        // Check if it's already a UUID (contains hyphens)
        if (profileId.includes('-')) {
          // Already a UUID, validate it exists in our map (by checking reverse lookup)
          // Actually, just use it as-is since UUIDs should match
          clinicianUuid = profileId;
        } else {
          // It's a healthie_id, map to UUID
          clinicianUuid = clinicianIdMap.get(String(profileId));
          if (!clinicianUuid) {
            return { _skip: true };
          }
        }
        
        preTransformed.careProviderProfileId = clinicianUuid;
        
        // Ensure insuranceId is set
        if (!preTransformed.insuranceId && !preTransformed.credentialedInsuranceId) {
          return { _skip: true };
        }
        
        return preTransformed;
      };
    }
    try {
      const csvPath = getCSVPath(config.file);
      const result = await importCSVToFirestore(
        csvPath,
        config.collection,
        config.transform,
        {
          idField: 'id',
          merge: skipExisting,
          dryRun,
        }
      );

      results.push({
        file: config.file,
        collection: config.collection,
        ...result,
      });

      totalImported += result.imported;
      totalErrors += result.errors;
      totalSkipped += result.skipped;
    } catch (error) {
      console.error(`❌ Failed to import ${config.file}:`, error.message);
      results.push({
        file: config.file,
        collection: config.collection,
        imported: 0,
        errors: 1,
        skipped: 0,
        error: error.message,
      });
      totalErrors++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SEEDING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Total Imported: ${totalImported}`);
  console.log(`⚠️  Total Skipped: ${totalSkipped}`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log('\n📋 Per-File Results:');
  
  results.forEach(result => {
    const status = result.errors > 0 ? '❌' : result.imported > 0 ? '✅' : '⚠️';
    console.log(`   ${status} ${result.file.padEnd(40)} → ${result.collection.padEnd(25)} (${result.imported} imported, ${result.errors} errors)`);
  });

  return {
    success: totalErrors === 0,
    totalImported,
    totalErrors,
    totalSkipped,
    results,
  };
}

// Run if called directly
const runAsScript = process.argv[1] && process.argv[1].includes('seedDatabase.js');

if (runAsScript) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipExisting = args.includes('--skip-existing');

  seedDatabase({ dryRun, skipExisting })
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Database seeding completed successfully!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Database seeding completed with errors.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Database seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;

