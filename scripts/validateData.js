/**
 * Data Validation Utility
 * Validates imported data for referential integrity and data quality
 */

import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize Firestore if not already initialized
 */
function getFirestore() {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'nurtureai-3feb1',
    });
  }
  return admin.firestore();
}

/**
 * Validate referential integrity
 * @param {string} collectionName - Collection to validate
 * @param {string} foreignKeyField - Field that references another collection
 * @param {string} referencedCollection - Collection being referenced
 * @returns {Promise<Object>} Validation results
 */
export async function validateReferentialIntegrity(
  collectionName,
  foreignKeyField,
  referencedCollection
) {
  const db = getFirestore();
  const issues = [];
  
  console.log(`\n🔍 Validating ${collectionName}.${foreignKeyField} → ${referencedCollection}`);
  
  // Get all documents in the collection
  const snapshot = await db.collection(collectionName).get();
  const referencedIds = new Set();
  
  // Get all referenced IDs
  const refSnapshot = await db.collection(referencedCollection).get();
  refSnapshot.forEach(doc => referencedIds.add(doc.id));
  
  // Check each document
  snapshot.forEach(doc => {
    const data = doc.data();
    const foreignKey = data[foreignKeyField];
    
    if (foreignKey && !referencedIds.has(foreignKey)) {
      issues.push({
        collection: collectionName,
        documentId: doc.id,
        field: foreignKeyField,
        value: foreignKey,
        issue: `Referenced ${referencedCollection} does not exist`,
      });
    }
  });
  
  if (issues.length > 0) {
    console.log(`   ⚠️  Found ${issues.length} referential integrity issues`);
  } else {
    console.log(`   ✅ All references valid`);
  }
  
  return {
    collection: collectionName,
    totalDocuments: snapshot.size,
    issues,
    isValid: issues.length === 0,
  };
}

/**
 * Validate kinship codes
 * @returns {Promise<Object>} Validation results
 */
export async function validateKinshipCodes() {
  const db = getFirestore();
  const issues = [];
  const validCodes = [1, 2, 12, 2051];
  
  console.log(`\n🔍 Validating kinship codes`);
  
  const snapshot = await db.collection('kinships').get();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Check user0Kinship (camelCase) or user_0_kinship (snake_case)
    const kinship0 = data.user0Kinship || data.user_0_kinship;
    if (kinship0) {
      const code = kinship0.code;
      if (!validCodes.includes(code)) {
        issues.push({
          documentId: doc.id,
          field: 'user0Kinship.code',
          value: code,
          issue: `Invalid kinship code: ${code}`,
        });
      }
    }
    
    // Check user1Kinship (camelCase) or user_1_kinship (snake_case)
    const kinship1 = data.user1Kinship || data.user_1_kinship;
    if (kinship1) {
      const code = kinship1.code;
      if (!validCodes.includes(code)) {
        issues.push({
          documentId: doc.id,
          field: 'user1Kinship.code',
          value: code,
          issue: `Invalid kinship code: ${code}`,
        });
      }
    }
  });
  
  if (issues.length > 0) {
    console.log(`   ⚠️  Found ${issues.length} invalid kinship codes`);
  } else {
    console.log(`   ✅ All kinship codes valid`);
  }
  
  return {
    collection: 'kinships',
    totalDocuments: snapshot.size,
    issues,
    isValid: issues.length === 0,
  };
}

/**
 * Validate questionnaire types
 * @returns {Promise<Object>} Validation results
 */
export async function validateQuestionnaireTypes() {
  const db = getFirestore();
  const issues = [];
  const validTypes = ['PHQ_A', 'GAD_7', 'PSC_17', 'SDQ', 'OTHER']; // Standardized codes
  
  console.log(`\n🔍 Validating questionnaire types`);
  
  const snapshot = await db.collection('questionnaires').get();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const type = data.type; // Should be standardized code (PHQ_A, GAD_7, etc.)
    const typeCode = data.typeCode; // Original numeric code
    
    // Check if type is a valid standardized code
    if (type && !validTypes.includes(type)) {
      issues.push({
        documentId: doc.id,
        field: 'type',
        value: type,
        originalCode: typeCode,
        issue: `Invalid questionnaire type: ${type}. Must be one of: ${validTypes.join(', ')}`,
      });
    }
    
    // Warn if typeCode exists but type is missing (transformation may have failed)
    if (typeCode && !type) {
      issues.push({
        documentId: doc.id,
        field: 'type',
        value: null,
        originalCode: typeCode,
        issue: `Questionnaire has typeCode (${typeCode}) but missing standardized type field`,
      });
    }
  });
  
  if (issues.length > 0) {
    console.log(`   ⚠️  Found ${issues.length} invalid questionnaire types`);
  } else {
    console.log(`   ✅ All questionnaire types valid`);
  }
  
  return {
    collection: 'questionnaires',
    totalDocuments: snapshot.size,
    issues,
    isValid: issues.length === 0,
  };
}

/**
 * Run all validations
 * @returns {Promise<Object>} Combined validation results
 */
export async function runAllValidations() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DATA VALIDATION');
  console.log('='.repeat(60));
  
  const results = [];
  
  // Validate referential integrity
  // Note: Field names are converted to camelCase during import (snake_case → camelCase)
  // org_contracts.csv: organization_id → organizationId, contract_id → contractId
  results.push(await validateReferentialIntegrity('orgContracts', 'organizationId', 'organizations'));
  results.push(await validateReferentialIntegrity('orgContracts', 'contractId', 'contracts'));
  
  // clinician_credentialed_insurances.csv: care_provider_profile_id → careProviderProfileId
  // Note: This links to clinicians collection, but field name is careProviderProfileId
  // We'll skip this validation for now as it requires mapping careProviderProfileId to clinician id
  
  // clinician_availabilities.csv: care_provider_profile_id → careProviderProfileId
  // Similar issue - skip for now
  
  // kinships.csv: user_0_id → user0Id, user_1_id → user1Id
  results.push(await validateReferentialIntegrity('kinships', 'user0Id', 'patients'));
  results.push(await validateReferentialIntegrity('kinships', 'user1Id', 'patients'));
  
  // memberships.csv: user_id → userId (links to patients)
  results.push(await validateReferentialIntegrity('memberships', 'userId', 'patients'));
  
  // questionnaires.csv: user_id → userId (links to patients)
  results.push(await validateReferentialIntegrity('questionnaires', 'userId', 'patients'));
  
  // referral_members.csv: referral_id → referralId
  results.push(await validateReferentialIntegrity('referralMembers', 'referralId', 'referrals'));
  
  // patient_availabilities.csv: user_id → userId (links to patients)
  results.push(await validateReferentialIntegrity('patientAvailabilities', 'userId', 'patients'));
  
  // Validate data quality
  results.push(await validateKinshipCodes());
  results.push(await validateQuestionnaireTypes());
  
  // Summary
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const isValid = results.every(r => r.isValid);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`   ${isValid ? '✅' : '⚠️'} Overall Status: ${isValid ? 'VALID' : 'ISSUES FOUND'}`);
  console.log(`   Total Issues: ${totalIssues}`);
  
  if (totalIssues > 0) {
    console.log('\n📋 Issues by Collection:');
    results.forEach(result => {
      if (result.issues.length > 0) {
        console.log(`   ⚠️  ${result.collection}: ${result.issues.length} issues`);
        result.issues.slice(0, 5).forEach(issue => {
          console.log(`      - ${issue.issue} (doc: ${issue.documentId})`);
        });
        if (result.issues.length > 5) {
          console.log(`      ... and ${result.issues.length - 5} more`);
        }
      }
    });
  }
  
  return {
    isValid,
    totalIssues,
    results,
  };
}

export default {
  validateReferentialIntegrity,
  validateKinshipCodes,
  validateQuestionnaireTypes,
  runAllValidations,
};

