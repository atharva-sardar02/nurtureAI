# Deployment Guide

Complete guide for deploying NurtureAI to production.

---

## Prerequisites

- Firebase project created and configured
- Firebase CLI installed and logged in
- All environment variables configured
- Google Cloud account (for Vision API)
- Domain name (optional, for custom domain)

---

## Step 1: Pre-Deployment Checklist

### 1.1 Environment Variables

Ensure all production environment variables are set:

**Firebase Configuration:**
- Get from Firebase Console → Project Settings → Your apps
- Use production Firebase project (not development)

**OpenAI API Key:**
- Use production API key with billing enabled
- Monitor usage in OpenAI dashboard

**Google Cloud Vision API:**
- Enable in Google Cloud Console
- Set up billing (required for Vision API)

### 1.2 Firebase Project Setup

1. **Create Production Firebase Project**
   ```bash
   # In Firebase Console
   # Create new project or use existing
   # Note the project ID
   ```

2. **Enable Required Services**
   - Authentication (Email/Password, Google)
   - Firestore Database
   - Firebase Storage
   - Cloud Functions
   - Firebase Hosting

3. **Configure Firebase Project**
   ```bash
   firebase use --add
   # Select your production project
   ```

### 1.3 Security Rules

Deploy security rules before deploying data:

```bash
# Validate rules first
firebase firestore:rules:validate

# Deploy rules
firebase deploy --only firestore:rules

# Deploy storage rules
firebase deploy --only storage
```

### 1.4 Firestore Indexes

Deploy indexes for query performance:

```bash
# Deploy indexes
firebase deploy --only firestore:indexes
```

**Note:** Index creation can take several minutes. Monitor in Firebase Console.

---

## Step 2: Build Application

### 2.1 Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..
```

### 2.2 Build Frontend

```bash
npm run build
```

This creates a `build/` directory with production-ready files.

### 2.3 Verify Build

```bash
npm run preview
```

Test the production build locally at `http://localhost:4173` (or shown port).

---

## Step 3: Deploy Firebase Functions

### 3.1 Configure Functions Environment

Set environment variables for functions:

```bash
# Set OpenAI API key (if needed in functions)
firebase functions:config:set openai.api_key="sk-..."

# Or use .env file in functions/ directory
```

### 3.2 Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:processInsuranceCard
```

### 3.3 Verify Functions

Check Firebase Console → Functions to verify deployment.

Test function:
```bash
# Using Firebase CLI
firebase functions:shell
# Then call: processInsuranceCard({ imageUrl: '...' })
```

---

## Step 4: Deploy Firestore Security Rules & Indexes

### 4.1 Deploy Security Rules

```bash
# Validate rules
firebase firestore:rules:validate

# Deploy rules
firebase deploy --only firestore:rules
```

### 4.2 Deploy Indexes

```bash
# Deploy indexes
firebase deploy --only firestore:indexes
```

**Important:** Index creation is asynchronous. Check Firebase Console → Firestore → Indexes to monitor progress.

---

## Step 5: Deploy Frontend to Firebase Hosting

### 5.1 Configure Hosting

Ensure `firebase.json` has hosting configuration:

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 5.2 Deploy to Hosting

```bash
# Deploy frontend
firebase deploy --only hosting
```

### 5.3 Verify Deployment

After deployment, you'll get a URL like:
```
https://your-project-id.web.app
https://your-project-id.firebaseapp.com
```

Visit the URL to verify the app is working.

---

## Step 6: Set Up Custom Domain (Optional)

### 6.1 Add Custom Domain

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain name
4. Follow verification steps

### 6.2 Configure DNS

Add the provided DNS records to your domain registrar:
- A record or CNAME record
- Wait for DNS propagation (can take 24-48 hours)

### 6.3 SSL Certificate

Firebase automatically provisions SSL certificates for custom domains.

---

## Step 7: Post-Deployment Verification

### 7.1 Smoke Tests

Test critical user flows:

1. **Authentication**
   - Sign up new user
   - Sign in existing user
   - Password reset

2. **AI Chat**
   - Start conversation
   - Send messages
   - Verify responses

3. **Onboarding**
   - Complete onboarding form
   - Verify data saved

4. **Scheduling**
   - View available clinicians
   - Book appointment
   - Verify appointment created

5. **Insurance Verification**
   - Verify automatic pre-fill from memberships (if patient has existing insurance)
   - Upload insurance card (if OCR enabled)
   - Verify coverage display
   - Test manual entry if no memberships exist

### 7.2 Monitor Logs

```bash
# View function logs
firebase functions:log

# View hosting logs
firebase hosting:channel:list
```

### 7.3 Check Firebase Console

- **Authentication**: Verify users can sign up
- **Firestore**: Check data is being created
- **Storage**: Verify file uploads work
- **Functions**: Check function execution logs
- **Hosting**: Verify site is accessible

---

## Step 8: CI/CD Setup (Optional)

### 8.1 GitHub Actions

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          npm install
          cd functions && npm install && cd ..
      
      - name: Run tests
        run: npm run test:all
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
          channelId: live
```

### 8.2 Set Up Secrets

In GitHub repository settings:
- Add `FIREBASE_SERVICE_ACCOUNT` secret (JSON key from Firebase)

---

## Step 9: Production Environment Variables

### 9.1 Firebase Hosting Environment Variables

For Vite apps, environment variables must be set at build time:

```bash
# Build with production variables
VITE_FIREBASE_API_KEY=prod_key \
VITE_FIREBASE_PROJECT_ID=prod_project \
npm run build
```

Or use a CI/CD pipeline to inject variables during build.

### 9.2 Functions Environment Variables

```bash
# Set function config
firebase functions:config:set \
  openai.api_key="sk-..." \
  vision.api_enabled="true"
```

---

## Step 10: Monitoring & Maintenance

### 10.1 Set Up Monitoring

1. **Firebase Console**
   - Monitor function execution
   - Check Firestore usage
   - Review authentication logs

2. **Google Cloud Console**
   - Set up billing alerts
   - Monitor API usage
   - Check error logs

3. **OpenAI Dashboard**
   - Monitor API usage
   - Set usage limits
   - Review costs

### 10.2 Regular Maintenance

- **Weekly**: Review error logs
- **Monthly**: Check billing and usage
- **Quarterly**: Review security rules
- **As needed**: Update dependencies

---

## Troubleshooting Deployment

### Issue: "Functions deployment timeout"

**Solution:**
- Check function code for long-running operations
- Increase function timeout in `functions/package.json`
- Use lazy initialization for heavy imports

### Issue: "Index creation failed"

**Solution:**
- Check index definition in `firestore.indexes.json`
- Verify field names match Firestore schema
- Wait for index creation (can take 10+ minutes)

### Issue: "Hosting deployment failed"

**Solution:**
- Verify `build/` directory exists
- Check `firebase.json` hosting configuration
- Ensure build completed successfully

### Issue: "Environment variables not working"

**Solution:**
- Verify `VITE_` prefix for all variables
- Rebuild after changing variables
- Check variables are set before `npm run build`

### Issue: "CORS errors"

**Solution:**
- Verify Firebase Functions CORS configuration
- Check function allows requests from your domain
- Review Firebase Hosting rewrites

---

## Rollback Procedure

### Rollback Functions

```bash
# List function versions
firebase functions:list

# Rollback to previous version
firebase functions:rollback <function-name>
```

### Rollback Hosting

1. Go to Firebase Console → Hosting
2. Click on deployment history
3. Select previous version
4. Click "Rollback"

### Rollback Security Rules

```bash
# Revert to previous rules
git checkout HEAD~1 firestore.rules
firebase deploy --only firestore:rules
```

---

## Production Checklist

Before going live, verify:

- [ ] All environment variables configured
- [ ] Security rules deployed and tested
- [ ] Firestore indexes created
- [ ] Functions deployed and tested
- [ ] Frontend built and deployed
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Billing alerts configured
- [ ] Error tracking enabled
- [ ] Smoke tests passing
- [ ] Documentation updated

---

## Deployment Commands Reference

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage

# Preview before deploying
firebase hosting:channel:deploy preview

# List deployments
firebase hosting:channel:list
```

---

**Last Updated:** 2025-01-27  
**Deployment Version:** 1.0.0


