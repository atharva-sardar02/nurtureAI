# Production Environment Setup

Guide for configuring production environment variables and settings.

---

## Overview

This guide covers setting up production environment variables, configuring the production Firebase project, and setting up monitoring.

---

## Step 1: Create Production Firebase Project

### 1.1 Create New Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter project name: `nurtureai-production` (or your preferred name)
4. Follow setup wizard
5. **Note the project ID** - you'll need it for configuration

### 1.2 Enable Required Services

Enable all required Firebase services:

- ✅ **Authentication** (Email/Password, Google)
- ✅ **Firestore Database**
- ✅ **Firebase Storage**
- ✅ **Cloud Functions**
- ✅ **Firebase Hosting**

### 1.3 Configure Firebase Project

```bash
# Set production project
firebase use --add
# Select your production project
```

Update `.firebaserc`:
```json
{
  "projects": {
    "default": "nurtureai-3feb1",
    "production": "nurtureai-production"
  }
}
```

---

## Step 2: Production Environment Variables

### 2.1 Firebase Configuration

Get from Firebase Console → Project Settings → Your apps:

```env
# Production Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy... (production key)
VITE_FIREBASE_AUTH_DOMAIN=nurtureai-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nurtureai-production
VITE_FIREBASE_STORAGE_BUCKET=nurtureai-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### 2.2 OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create production API key
3. Enable billing
4. Set usage limits

```env
VITE_OPENAI_API_KEY=sk-proj-... (production key)
```

**Important:**
- Use separate production key
- Set usage limits to prevent overages
- Monitor usage regularly

### 2.3 Google Cloud Vision API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your production Firebase project
3. Enable Vision API
4. Set up billing (required)

**Note:** Vision API uses Application Default Credentials, no key needed in `.env`.

---

## Step 3: Deploy Security Rules

### 3.1 Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules --project production
```

### 3.2 Deploy Storage Rules

```bash
firebase deploy --only storage --project production
```

### 3.3 Verify Rules

Test rules in Firebase Console → Firestore → Rules (test mode)

---

## Step 4: Deploy Indexes

### 4.1 Deploy Indexes

```bash
firebase deploy --only firestore:indexes --project production
```

### 4.2 Monitor Index Creation

- Go to Firebase Console → Firestore → Indexes
- Wait for all indexes to be created (can take 10+ minutes)
- Verify all indexes are "Enabled"

---

## Step 5: Deploy Functions

### 5.1 Set Function Environment Variables

```bash
# Set OpenAI API key (if needed in functions)
firebase functions:config:set openai.api_key="sk-..." --project production

# Set other function config
firebase functions:config:set vision.api_enabled="true" --project production
```

### 5.2 Deploy Functions

```bash
firebase deploy --only functions --project production
```

### 5.3 Verify Functions

- Check Firebase Console → Functions
- Test function execution
- Review function logs

---

## Step 6: Build and Deploy Frontend

### 6.1 Build with Production Variables

```bash
# Set production environment variables
export VITE_FIREBASE_API_KEY=prod_key
export VITE_FIREBASE_PROJECT_ID=prod_project
# ... other variables

# Build
npm run build
```

### 6.2 Deploy to Hosting

```bash
firebase deploy --only hosting --project production
```

### 6.3 Verify Deployment

- Visit production URL: `https://your-project-id.web.app`
- Test authentication
- Test critical features
- Check browser console for errors

---

## Step 7: Set Up Monitoring

### 7.1 Firebase Monitoring

**Firebase Console:**
- Monitor function execution
- Check Firestore usage
- Review authentication logs
- Monitor hosting traffic

**Set Up Alerts:**
1. Go to Google Cloud Console
2. Navigate to Monitoring → Alerting
3. Create alerts for:
   - Function errors
   - High Firestore usage
   - Authentication failures
   - Hosting errors

### 7.2 Billing Alerts

1. Go to Google Cloud Console → Billing
2. Set up budget alerts
3. Configure spending limits
4. Set up email notifications

### 7.3 Application Monitoring

**Error Tracking:**
- Set up Sentry or LogRocket
- Track JavaScript errors
- Monitor API errors
- Track user sessions

**Performance Monitoring:**
- Use Firebase Performance Monitoring
- Track page load times
- Monitor API response times
- Track user interactions

---

## Step 8: Production Checklist

Before going live, verify:

### Configuration
- [ ] Production Firebase project created
- [ ] All environment variables set
- [ ] Security rules deployed
- [ ] Indexes created and enabled
- [ ] Functions deployed
- [ ] Hosting configured

### Security
- [ ] Security rules tested
- [ ] API keys secured (not in code)
- [ ] Service accounts configured
- [ ] HTTPS enabled (automatic with Firebase)
- [ ] CORS configured correctly

### Functionality
- [ ] Authentication working
- [ ] AI chat functional
- [ ] Onboarding flow complete
- [ ] Scheduling working
- [ ] Insurance verification working
- [ ] Support chat functional

### Monitoring
- [ ] Error tracking set up
- [ ] Billing alerts configured
- [ ] Usage monitoring enabled
- [ ] Logging configured

### Documentation
- [ ] Deployment guide reviewed
- [ ] API documentation complete
- [ ] Troubleshooting guide available
- [ ] Known issues documented

---

## Step 9: Post-Deployment Verification

### 9.1 Run Smoke Tests

```bash
npm run test:smoke
```

Or manually test:
1. Visit production URL
2. Sign up new user
3. Complete onboarding
4. Start AI chat
5. Verify data saved

### 9.2 Monitor First 24 Hours

- Check error logs hourly
- Monitor API usage
- Review user feedback
- Check performance metrics

---

## Step 10: Rollback Plan

### 10.1 Rollback Hosting

1. Go to Firebase Console → Hosting
2. Click on deployment history
3. Select previous version
4. Click "Rollback"

### 10.2 Rollback Functions

```bash
# List function versions
firebase functions:list --project production

# Rollback to previous version
firebase functions:rollback <function-name> --project production
```

### 10.3 Rollback Rules

```bash
# Revert to previous rules
git checkout HEAD~1 firestore.rules
firebase deploy --only firestore:rules --project production
```

---

## Production Environment Variables Reference

### Required Variables

```env
# Firebase (Production)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# OpenAI (Production)
VITE_OPENAI_API_KEY=
```

### Optional Variables

```env
# Pinecone (if RAG is implemented)
VITE_PINECONE_API_KEY=
VITE_PINECONE_ENVIRONMENT=
VITE_PINECONE_INDEX_NAME=
```

---

## Security Best Practices

1. **Separate Environments**
   - Use different Firebase projects for dev/staging/prod
   - Use different API keys for each environment
   - Never use production keys in development

2. **Key Rotation**
   - Rotate API keys quarterly
   - Rotate service account keys annually
   - Monitor for unauthorized access

3. **Access Control**
   - Limit who has production access
   - Use least privilege for service accounts
   - Enable 2FA for all accounts

4. **Monitoring**
   - Set up alerts for unusual activity
   - Monitor API usage
   - Review access logs regularly

---

## Troubleshooting Production Issues

### Issue: "Environment variables not working in production"

**Solution:**
- Variables must be set at build time
- Use CI/CD to inject variables during build
- Verify variables are in GitHub Secrets

### Issue: "Functions not working in production"

**Solution:**
- Check function logs in Firebase Console
- Verify function environment variables
- Check function permissions
- Review function execution logs

### Issue: "High API costs"

**Solution:**
- Set usage limits in OpenAI dashboard
- Monitor API usage daily
- Implement caching where possible
- Review and optimize API calls

---

**Last Updated:** 2025-01-XX  
**Production Setup Version:** 1.0.0


