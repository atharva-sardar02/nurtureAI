# Data Import Guide
## How to Import CSV Data into Firestore

This guide explains how to import the 16 CSV test files into your Firestore database.

---

## Prerequisites

1. **Firebase Project Configured**
   - Firebase project created
   - Firestore database initialized
   - `.env` file with Firebase credentials

2. **Firebase Admin SDK Setup**
   - Option 1: Use Application Default Credentials (recommended for local dev)
     ```bash
     # Login to Firebase
     firebase login
     
     # Set application default credentials
     gcloud auth application-default login
     ```
   
   - Option 2: Use Service Account Key
     - Download service account key from Firebase Console
     - Set `FIREBASE_SERVICE_ACCOUNT_PATH` environment variable to the key file path

3. **Dependencies Installed**
   ```bash
   npm install
   ```

---

## Import Process

### Step 1: Test CSV Parsing (Optional)

Verify that all CSV files can be parsed:

```bash
node tests/integration/dataImport.test.js
```

This will:
- ✅ Verify all 16 CSV files exist and can be parsed
- ✅ Test kinship code transformation
- ✅ Validate data structure

### Step 2: Dry Run Import (Recommended)

Test the import without writing to Firestore:

```bash
npm run seed:dry-run
```

This will:
- Parse all CSV files
- Show what would be imported
- Display import statistics
- **NOT write to Firestore**

### Step 3: Run Actual Import

Once you're satisfied with the dry run:

```bash
npm run seed:database
```

This will:
- Import all 16 CSV files in the correct dependency order
- Create Firestore collections
- Transform data (kinship codes, JSON parsing, etc.)
- Display progress and statistics

### Step 4: Validate Imported Data

After import, validate the data:

```bash
npm run validate:data
```

This will:
- Check referential integrity (foreign keys)
- Validate kinship codes
- Validate questionnaire types
- Generate a data quality report

---

## Import Order

The import follows this dependency order (from PRD Section 9.2):

1. **contracts.csv** → `contracts` collection
2. **orgs.csv** → `organizations` collection
3. **org_contracts.csv** → `orgContracts` collection (junction table)
4. **clinicians_anonymized.csv** → `clinicians` collection
5. **credentialed_insurances.csv** → `credentialedInsurances` collection
6. **clinician_credentialed_insurances.csv** → `clinicianCredentialedInsurances` collection (junction table)
7. **clinician_availabilities.csv** → `clinicianAvailabilities` collection
8. **documents.csv** → `documents` collection
9. **insurance_coverages.csv** → `insuranceCoverages` collection
10. **patients_and_guardians_anonymized.csv** → `patients` collection
11. **kinships.csv** → `kinships` collection (with code-to-label mapping)
12. **memberships.csv** → `memberships` collection
13. **questionnaires.csv** → `questionnaires` collection
14. **referrals.csv** → `referrals` collection
15. **referral_members.csv** → `referralMembers` collection (junction table)
16. **patient_availabilities.csv** → `patientAvailabilities` collection

---

## Data Transformations

### Kinship Code Mapping

The `kinships.csv` file uses numeric codes that are automatically converted to labels:

- `1` → `"mother"`
- `2` → `"father"`
- `12` → `"other"`
- `2051` → `"guardian"`

The import script transforms kinship data to include both code and label:
```javascript
{
  user_0_kinship: { code: 1, label: "mother" },
  user_1_kinship: { code: 2051, label: "guardian" }
}
```

### JSON Field Parsing

Fields containing JSON strings are automatically parsed:
- `contracts.services` → Array
- `contracts.terms` → Object
- `orgs.config` → Object
- `clinicians.profileData` → Object

### Field Name Conversion

CSV headers are converted from `snake_case` to `camelCase`:
- `organization_id` → `organizationId`
- `user_0_id` → `user0Id`
- `care_provider_profile_id` → `careProviderProfileId`

---

## Troubleshooting

### Error: "Firebase Admin SDK not initialized"

**Solution:**
- Ensure you've logged in: `firebase login`
- Or set `FIREBASE_SERVICE_ACCOUNT_PATH` environment variable

### Error: "Permission denied"

**Solution:**
- Check Firestore security rules
- Ensure you're using Admin SDK (bypasses security rules)
- Verify service account has proper permissions

### Error: "CSV file not found"

**Solution:**
- Verify CSV files are in `tests/` directory
- Check file names match exactly (case-sensitive)

### Error: "Invalid kinship code"

**Solution:**
- Check that kinship codes in CSV are: 1, 2, 12, or 2051
- Verify kinship mapping utility is working: `node tests/unit/kinshipMapping.test.js`

### Import is slow

**Solution:**
- This is normal for large datasets
- The script processes in batches of 500 documents
- Progress is shown for each file

---

## Import Options

### Skip Existing Documents

To update existing documents instead of overwriting:

```bash
node scripts/seedDatabase.js --skip-existing
```

This uses `merge: true` when writing to Firestore.

### Dry Run Mode

Test without writing:

```bash
npm run seed:dry-run
```

---

## Expected Results

After successful import, you should see:

- ✅ 16 collections created in Firestore
- ✅ All CSV rows imported (check counts match)
- ✅ Kinship codes transformed to labels
- ✅ JSON fields parsed correctly
- ✅ Referential integrity maintained

### Collection Counts

Check document counts in Firebase Console:
- `contracts`: ~3 documents
- `organizations`: ~10+ documents
- `clinicians`: ~100+ documents
- `patients`: ~100+ documents
- `kinships`: ~100+ documents
- And more...

---

## Next Steps

After successful import:

1. **Verify Data in Firebase Console**
   - Go to Firestore Database
   - Check each collection
   - Verify document structure

2. **Run Validation**
   ```bash
   npm run validate:data
   ```

3. **Test Queries**
   - Test clinician queries
   - Test patient queries
   - Test insurance matching

4. **Continue Development**
   - Proceed with PR #4 (Authentication - already done)
   - PR #5 (Core UI Components - already done)
   - PR #6 (AI Chat Interface)

---

## Scripts Reference

```bash
# Test kinship mapping utility
node tests/unit/kinshipMapping.test.js

# Test CSV parsing and transformation
node tests/integration/dataImport.test.js

# Dry run import (no Firestore writes)
npm run seed:dry-run

# Actual import
npm run seed:database

# Validate imported data
npm run validate:data
```

---

**Last Updated:** 2025-11-10  
**Status:** Ready for use

