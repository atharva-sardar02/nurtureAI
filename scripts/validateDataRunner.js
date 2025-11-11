/**
 * Validation Script Runner
 * Runs all data validations after import
 */

import { runAllValidations } from './validateData.js';
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'nurtureai-3feb1',
  });
}

runAllValidations()
  .then((result) => {
    if (result.isValid) {
      console.log('\n✅ All validations passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some validations failed. Review issues above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Validation failed:', error);
    process.exit(1);
  });

