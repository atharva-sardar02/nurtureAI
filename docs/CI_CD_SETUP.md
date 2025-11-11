# CI/CD Setup Guide

Complete guide for setting up Continuous Integration and Continuous Deployment for NurtureAI.

---

## Overview

The project uses **GitHub Actions** for CI/CD with automated testing and deployment to Firebase.

### Workflows

1. **CI Workflow** (`.github/workflows/ci.yml`)
   - Runs on pull requests and feature branches
   - Lints code
   - Runs tests
   - Builds application
   - Does NOT deploy

2. **Deploy Workflow** (`.github/workflows/firebase-deploy.yml`)
   - Runs on pushes to `main`/`master` branch
   - Runs all tests
   - Builds application
   - Deploys to Firebase
   - Runs smoke tests

---

## Prerequisites

- GitHub repository
- Firebase project
- GitHub Actions enabled (default)

---

## Step 1: Set Up GitHub Secrets

### 1.1 Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 1.2 Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### Required Secrets

**`FIREBASE_SERVICE_ACCOUNT`**
- Value: Contents of the service account JSON file (entire JSON as string)
- Used for: Firebase authentication in CI/CD

**`FIREBASE_PROJECT_ID`**
- Value: Your Firebase project ID (e.g., `nurtureai-3feb1`)
- Used for: Specifying which Firebase project to deploy to

**`VITE_FIREBASE_API_KEY`**
- Value: Firebase API key from Firebase Console
- Used for: Building the application with correct config

**`VITE_FIREBASE_AUTH_DOMAIN`**
- Value: Firebase auth domain (e.g., `nurtureai-3feb1.firebaseapp.com`)
- Used for: Building the application

**`VITE_FIREBASE_PROJECT_ID`**
- Value: Same as `FIREBASE_PROJECT_ID`
- Used for: Building the application

**`VITE_FIREBASE_STORAGE_BUCKET`**
- Value: Firebase storage bucket (e.g., `nurtureai-3feb1.appspot.com`)
- Used for: Building the application

**`VITE_FIREBASE_MESSAGING_SENDER_ID`**
- Value: Firebase messaging sender ID
- Used for: Building the application

**`VITE_FIREBASE_APP_ID`**
- Value: Firebase app ID
- Used for: Building the application

**`VITE_OPENAI_API_KEY`**
- Value: OpenAI API key
- Used for: Building the application (if needed at build time)

#### Optional Secrets

**`PRODUCTION_URL`**
- Value: Production URL (e.g., `https://nurtureai-3feb1.web.app`)
- Used for: Smoke tests

---

## Step 2: Configure Workflows

### 2.1 CI Workflow

The CI workflow (`.github/workflows/ci.yml`) runs automatically on:
- Pull requests to `main`/`master`
- Pushes to `develop` or `feature/**` branches
- Manual trigger via `workflow_dispatch`

**What it does:**
- Lints code
- Runs unit, integration, and security tests
- Builds the application
- Does NOT deploy

### 2.2 Deploy Workflow

The deploy workflow (`.github/workflows/firebase-deploy.yml`) runs automatically on:
- Pushes to `main`/`master` branch
- Manual trigger via `workflow_dispatch`

**What it does:**
1. Runs all tests
2. Builds the application
3. Deploys to Firebase Hosting
4. Deploys Firestore rules and indexes
5. Deploys Storage rules
6. Deploys Cloud Functions
7. Runs smoke tests

---

## Step 3: Test CI/CD

### 3.1 Test CI Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/test-ci
   ```

2. Make a small change and commit:
   ```bash
   git add .
   git commit -m "Test CI workflow"
   git push origin feature/test-ci
   ```

3. Create a pull request to `main`

4. Check GitHub Actions tab to see CI workflow running

### 3.2 Test Deploy Workflow

**⚠️ Warning:** Only test on a development branch or after verifying all secrets are set correctly.

1. Merge to `main` branch (or push directly to `main`)
2. Check GitHub Actions tab to see deploy workflow running
3. Verify deployment in Firebase Console

---

## Step 4: Manual Deployment

You can also deploy manually:

```bash
# Deploy everything
npm run deploy

# Deploy only hosting
npm run deploy:hosting

# Deploy only functions
npm run deploy:functions

# Deploy only rules
npm run deploy:rules

# Deploy only indexes
npm run deploy:indexes
```

---

## Step 5: Monitor Deployments

### 5.1 GitHub Actions

- Go to **Actions** tab in GitHub
- View workflow runs
- Check logs for errors

### 5.2 Firebase Console

- Go to [Firebase Console](https://console.firebase.google.com/)
- Check **Hosting** for deployment history
- Check **Functions** for function deployments
- Check **Firestore** for rules and indexes

---

## Troubleshooting

### Issue: "Firebase authentication failed"

**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT` secret is set correctly
- Ensure service account JSON is valid
- Check service account has required permissions

### Issue: "Build fails with missing environment variables"

**Solution:**
- Verify all `VITE_*` secrets are set in GitHub
- Check secrets are named correctly
- Ensure secrets are available to the workflow

### Issue: "Deployment fails"

**Solution:**
- Check Firebase project ID is correct
- Verify Firebase services are enabled
- Check deployment logs in GitHub Actions
- Review Firebase Console for errors

### Issue: "Tests fail in CI"

**Solution:**
- Some tests may fail in CI environment (expected)
- Check `continue-on-error: true` in workflow
- Review test output in Actions logs
- Fix critical test failures before deploying

---

## Best Practices

1. **Never commit secrets** - Always use GitHub Secrets
2. **Test on feature branches** - Use CI workflow to catch issues early
3. **Review before merging** - Check CI results before merging to main
4. **Monitor deployments** - Check Firebase Console after each deployment
5. **Use staging environment** - Consider setting up a staging Firebase project
6. **Rollback plan** - Know how to rollback if deployment fails

---

## Environment-Specific Deployments

### Development

- Deploy to development Firebase project
- Use development API keys
- Enable debug logging

### Staging

- Deploy to staging Firebase project
- Use staging API keys
- Run full test suite

### Production

- Deploy to production Firebase project
- Use production API keys
- Enable monitoring
- Run smoke tests

---

## Advanced Configuration

### Multiple Environments

To deploy to multiple environments, modify the workflow:

```yaml
jobs:
  deploy-dev:
    if: github.ref == 'refs/heads/develop'
    # Deploy to dev project
    
  deploy-prod:
    if: github.ref == 'refs/heads/main'
    # Deploy to prod project
```

### Deployment Channels

Firebase Hosting supports multiple channels:

```yaml
- name: Deploy to preview channel
  uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    channelId: preview-${{ github.sha }}
```

---

## Security Considerations

1. **Service Account Permissions**
   - Use least privilege principle
   - Only grant necessary permissions
   - Rotate keys regularly

2. **Secret Management**
   - Never log secrets
   - Use GitHub Secrets (not environment variables)
   - Rotate secrets periodically

3. **Access Control**
   - Limit who can merge to main
   - Require PR reviews
   - Use branch protection rules

---

## Monitoring

### Set Up Alerts

1. **GitHub Actions**
   - Enable notifications for failed workflows
   - Set up email/Slack notifications

2. **Firebase**
   - Set up billing alerts
   - Monitor function execution
   - Track hosting usage

3. **Application**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API usage
   - Track performance metrics

---

**Last Updated:** 2025-01-XX  
**CI/CD Version:** 1.0.0


