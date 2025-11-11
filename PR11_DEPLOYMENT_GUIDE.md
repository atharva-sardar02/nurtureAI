# PR #11 Deployment Guide: Firebase Functions & Google Cloud Vision API

This guide walks you through deploying the OCR Firebase Function and setting up Google Cloud Vision API for insurance card processing.

---

## Prerequisites

- Firebase project already created and configured
- Firebase CLI installed (`npm install -g firebase-tools`)
- Logged into Firebase CLI (`firebase login`)
- Google Cloud account (same as Firebase account)

---

## Step 1: Enable Google Cloud Vision API

### 1.1 Navigate to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the same project as your Firebase project
   - Check the project selector at the top
   - If different, select your Firebase project from the dropdown

### 1.2 Enable Vision API

1. In the search bar at the top, type: **"Cloud Vision API"**
2. Click on **"Cloud Vision API"** from the results
3. Click the **"Enable"** button
4. Wait for the API to be enabled (takes 30-60 seconds)
5. You'll see a confirmation message when enabled

**Alternative Method:**
- Go directly to: `https://console.cloud.google.com/apis/library/vision.googleapis.com`
- Select your Firebase project
- Click **"Enable"**

---

## Step 2: Set Up Authentication Credentials

Google Cloud Vision API requires authentication. For Firebase Functions, we'll use **Application Default Credentials (ADC)** which is automatically configured.

### 2.1 Verify Service Account (Automatic)

Firebase Functions automatically use the **App Engine default service account** which has the necessary permissions. No manual setup needed if:
- Your Firebase project is linked to a Google Cloud project (it should be by default)
- The Vision API is enabled (from Step 1)

### 2.2 Manual Service Account Setup (If Needed)

If you encounter authentication errors, you may need to grant explicit permissions:

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Find the service account: `PROJECT_ID@appspot.gserviceaccount.com`
3. Click on it, then click **"Permissions"** tab
4. Ensure it has the role: **"Cloud Vision API User"** or **"Editor"**
5. If missing, click **"Grant Access"** and add the role

### 2.3 Local Testing (Optional)

For local testing with Firebase Emulators, you may need to set up Application Default Credentials:

```bash
# Install Google Cloud SDK (if not installed)
# Download from: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth application-default login

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

---

## Step 3: Deploy Firebase Function

### 3.1 Install Function Dependencies

First, make sure all dependencies are installed in the `functions` directory:

```bash
cd functions
npm install
cd ..
```

This installs:
- `@google-cloud/vision` (for OCR processing)
- `firebase-admin` (Firebase Admin SDK)
- `firebase-functions` (Firebase Functions SDK)

### 3.2 Verify Function Code

Check that `functions/src/processInsuranceCard.js` exists and contains the OCR function.

### 3.3 Deploy the Function

Deploy only the functions (not Firestore rules, hosting, etc.):

```bash
firebase deploy --only functions
```

**What happens:**
1. Firebase CLI will lint your code (runs `npm run lint` in functions directory)
2. Uploads function code to Firebase
3. Installs dependencies in the cloud
4. Deploys the function
5. Provides you with the function URL

**Expected Output:**
```
✔  functions[processInsuranceCard(us-central1)] Successful create operation.
Function URL: https://us-central1-YOUR_PROJECT.cloudfunctions.net/processInsuranceCard
```

### 3.4 Verify Deployment

1. Go to [Firebase Console > Functions](https://console.firebase.google.com/project/_/functions)
2. You should see `processInsuranceCard` listed
3. Check the logs: Click on the function > "Logs" tab

### 3.5 Test the Function (Optional)

You can test the function directly from Firebase Console:
1. Go to Functions > `processInsuranceCard`
2. Click **"Test"** tab
3. Enter test data:
   ```json
   {
     "data": {
       "imageUrl": "https://example.com/test-image.jpg"
     }
   }
   ```
4. Click **"Test"** button

---

## Step 4: Update Client-Side Code (If Needed)

The client-side code in `src/services/insurance/OCRProcessor.js` should automatically use the deployed function. Verify:

1. **Check Firebase Config** - Ensure `src/services/firebase/config.js` exports `functions`:
   ```javascript
   export const functions = getFunctions(app);
   ```

2. **Verify Function Call** - The `processInsuranceCardOCR` function should call:
   ```javascript
   const processCard = httpsCallable(functions, 'processInsuranceCard');
   ```

3. **No Changes Needed** - If the code matches the above, you're good to go!

---

## Step 5: Test with Real Insurance Card Images

### 5.1 Prepare Test Images

1. Take a photo of an insurance card (front side)
2. Ensure good lighting and clear text
3. Save as JPG or PNG (max 5MB)
4. **Important:** Use a test/dummy insurance card, not real patient data

### 5.2 Test in Application

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Insurance Verification:**
   - Go to `/onboarding` or wherever `InsuranceVerification` component is used
   - Or navigate to the insurance verification page

3. **Upload Test Image:**
   - Click on **"Upload Card"** tab
   - Drag and drop or browse for your test image
   - Click **"Extract Information"**

4. **Verify Results:**
   - Check that member ID is extracted
   - Check that group number is extracted (if present)
   - Check that provider name is detected
   - Review confidence score

### 5.3 Check Function Logs

If something goes wrong, check the function logs:

```bash
# View recent logs
firebase functions:log --only processInsuranceCard

# Or in Firebase Console:
# Functions > processInsuranceCard > Logs tab
```

### 5.4 Common Issues & Solutions

**Issue: "Permission denied" or "Authentication error"**
- **Solution:** Ensure Vision API is enabled (Step 1) and service account has permissions (Step 2.2)

**Issue: "No text detected in image"**
- **Solution:** 
  - Check image quality (good lighting, clear text)
  - Try a different image
  - Verify image format (JPG/PNG)

**Issue: "Failed to download image"**
- **Solution:** 
  - Check Firebase Storage rules allow read access
  - Verify image URL is correct
  - Check that image was uploaded successfully

**Issue: Function timeout**
- **Solution:** 
  - Large images may take longer
  - Check function timeout settings (currently 60 seconds)
  - Try with a smaller image

---

## Step 6: Monitor Usage & Costs

### 6.1 Monitor API Usage

1. Go to [Google Cloud Console > APIs & Services > Dashboard](https://console.cloud.google.com/apis/dashboard)
2. Select **"Cloud Vision API"**
3. View metrics:
   - Requests per day
   - Error rate
   - Latency

### 6.2 Set Up Billing Alerts (Recommended)

1. Go to [Google Cloud Console > Billing](https://console.cloud.google.com/billing)
2. Select your billing account
3. Click **"Budgets & alerts"**
4. Create a budget for Vision API usage
5. Set alert thresholds (e.g., $10, $50, $100)

### 6.3 Cost Estimation

Based on Google Cloud Vision API pricing:
- **First 1,000 units/month:** Free
- **1,001-5,000,000 units:** $1.50 per 1,000 units
- **Each insurance card = 1 unit**

**Example:**
- 100 cards/month = Free (within free tier)
- 1,000 cards/month = ~$0 (mostly free tier)
- 10,000 cards/month = ~$13.50

---

## Step 7: Production Considerations

### 7.1 Security

- ✅ Images are stored in Firebase Storage with user-specific paths
- ✅ Storage rules restrict access to authenticated users only
- ✅ Function is callable only by authenticated users (via Firebase Auth)
- ✅ OCR results are not logged with PII

### 7.2 Performance

- Function timeout: 60 seconds (sufficient for most images)
- Max instances: 10 (can be increased if needed)
- Consider caching OCR results for duplicate images

### 7.3 Error Handling

The function includes error handling for:
- Missing image URL
- Failed image download
- No text detected
- Vision API errors

Client-side code handles:
- Upload failures
- Processing errors
- Low confidence results

---

## Quick Reference Commands

```bash
# Deploy function
firebase deploy --only functions

# View function logs
firebase functions:log --only processInsuranceCard

# Test function locally (requires emulator)
firebase emulators:start --only functions

# Check function status
firebase functions:list
```

---

## Checklist

- [ ] Google Cloud Vision API enabled
- [ ] Service account has proper permissions
- [ ] Function dependencies installed (`cd functions && npm install`)
- [ ] Function deployed successfully
- [ ] Function appears in Firebase Console
- [ ] Test image uploaded successfully
- [ ] OCR extraction working correctly
- [ ] Form auto-population working
- [ ] Error handling tested
- [ ] Billing alerts configured (optional)

---

## Next Steps

After successful deployment and testing:

1. **Monitor usage** for the first few days
2. **Collect user feedback** on OCR accuracy
3. **Fine-tune extraction patterns** if needed (in `extractInsuranceData` function)
4. **Consider adding more provider patterns** as you encounter different insurance cards
5. **Set up monitoring/alerts** for function errors

---

## Support & Troubleshooting

If you encounter issues:

1. **Check Firebase Console Logs:**
   - Functions > processInsuranceCard > Logs

2. **Check Google Cloud Console:**
   - APIs & Services > Cloud Vision API > Metrics

3. **Verify Environment:**
   - Firebase project linked to Google Cloud project
   - Vision API enabled
   - Service account has permissions

4. **Test Locally:**
   - Use Firebase Emulators for local testing
   - Requires `gcloud auth application-default login`

---

**Last Updated:** 2025-11-11  
**Version:** 1.0

