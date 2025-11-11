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
import { fileURLToPath } from 'url';
import path from 'path';

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
    transform: (row) => row,
  },
  {
    file: 'clinician_availabilities.csv',
    collection: 'clinicianAvailabilities',
    transform: (row) => row,
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
      // Validate questionnaire type
      const validTypes = ['PHQ-A', 'GAD-7', 'PSC-17', 'SDQ'];
      if (row.type && !validTypes.includes(row.type)) {
        console.warn(`⚠️  Invalid questionnaire type: ${row.type}`);
      }
      
      // Parse numeric scores
      const numericFields = ['score', 'totalScore'];
      numericFields.forEach(field => {
        if (row[field] && !isNaN(row[field])) {
          row[field] = parseFloat(row[field]);
        }
      });
      
      return row;
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

  for (const config of IMPORT_CONFIG) {
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

