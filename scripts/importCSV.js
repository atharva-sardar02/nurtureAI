/**
 * CSV Import Utility
 * Generic CSV parser and Firestore importer
 */

import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebaseAdmin() {
  if (admin.apps.length === 0) {
    // Try to use service account from environment or default credentials
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Use default credentials (for Firebase emulator or local development)
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'nurtureai-3feb1',
      });
    }
  }
  return admin.firestore();
}

/**
 * Parse CSV file
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} Parsed CSV data as array of objects
 */
export async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Convert header to camelCase for consistency
        // Handle both letters and numbers after underscore
        // user_0_id → user0Id, user_0_label → user0Label
        let result = header.trim().toLowerCase();
        // Replace underscore followed by letter/number with uppercase
        result = result.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
        // Capitalize first letter after a number (user0label → user0Label)
        result = result.replace(/([0-9])([a-z])/g, (_, num, letter) => num + letter.toUpperCase());
        return result;
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn(`⚠️  CSV parsing warnings for ${filePath}:`, results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV ${filePath}: ${error.message}`));
      },
    });
  });
}

/**
 * Transform row data (override in specific import scripts)
 * @param {Object} row - Raw CSV row
 * @returns {Object} Transformed row
 */
export function transformRow(row) {
  return row;
}

/**
 * Import CSV data to Firestore collection
 * @param {string} csvPath - Path to CSV file
 * @param {string} collectionName - Firestore collection name
 * @param {Function} transformFn - Optional transformation function
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Import result with stats
 */
export async function importCSVToFirestore(
  csvPath,
  collectionName,
  transformFn = transformRow,
  options = {}
) {
  const {
    idField = 'id',
    merge = false,
    batchSize = 500,
    dryRun = false,
  } = options;

  console.log(`\n📥 Importing ${csvPath} to collection: ${collectionName}`);
  
  const db = initializeFirebaseAdmin();
  if (!db) {
    throw new Error('Failed to initialize Firestore. Check Firebase Admin SDK configuration.');
  }
  
  const data = await parseCSV(csvPath);
  
  if (data.length === 0) {
    console.warn(`⚠️  No data found in ${csvPath}`);
    return { imported: 0, errors: 0, skipped: 0 };
  }

  let imported = 0;
  let errors = 0;
  let skipped = 0;

  // Process in batches
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = db.batch();
    const batchData = data.slice(i, i + batchSize);

    for (const row of batchData) {
      try {
        const transformed = transformFn(row);
        
        if (!transformed) {
          skipped++;
          continue;
        }

        const docId = transformed[idField] || transformed.id || null;
        
        if (!docId) {
          console.warn(`⚠️  Row missing ID field, skipping:`, transformed);
          skipped++;
          continue;
        }

        const docRef = db.collection(collectionName).doc(docId);
        
        if (dryRun) {
          console.log(`[DRY RUN] Would write: ${collectionName}/${docId}`);
        } else {
          if (merge) {
            batch.set(docRef, transformed, { merge: true });
          } else {
            batch.set(docRef, transformed);
          }
        }
        
        imported++;
      } catch (error) {
        console.error(`❌ Error processing row:`, error.message, row);
        errors++;
      }
    }

    if (!dryRun && imported > 0) {
      try {
        await batch.commit();
        console.log(`✅ Committed batch: ${imported} documents`);
      } catch (error) {
        console.error(`❌ Error committing batch:`, error.message);
        errors += batchData.length;
        imported -= batchData.length;
      }
    }
  }

  console.log(`\n📊 Import Summary for ${collectionName}:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);

  return { imported, skipped, errors, total: data.length };
}

/**
 * Get CSV file path from tests directory
 * @param {string} filename - CSV filename
 * @returns {string} Full path to CSV file
 */
export function getCSVPath(filename) {
  return path.join(__dirname, '..', 'tests', filename);
}

export default {
  initializeFirebaseAdmin,
  parseCSV,
  transformRow,
  importCSVToFirestore,
  getCSVPath,
};

