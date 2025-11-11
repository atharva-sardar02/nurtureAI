# Firebase Setup Guide - Step by Step

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Open your browser and navigate to: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click the **"Add project"** button (or "Create a project" if this is your first)
   - Enter project name: `nurtureai` (or `nurture-ai` or your preferred name)
   - Click **"Continue"**

3. **Configure Google Analytics (Optional)**
   - You can enable or disable Google Analytics
   - For this project, you can choose **"Not now"** (optional)
   - Click **"Create project"**

4. **Wait for Project Creation**
   - Firebase will create your project (takes 30-60 seconds)
   - Click **"Continue"** when ready

---

## Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In the left sidebar, click **"Authentication"** (or find it under "Build")
   - Click **"Get started"** button

2. **Enable Sign-in Methods**
   - Click on the **"Sign-in method"** tab
   - You'll see a list of sign-in providers

3. **Enable Email/Password**
   - Click on **"Email/Password"**
   - Toggle **"Enable"** to ON
   - Leave "Email link (passwordless sign-in)" as OFF (optional)
   - Click **"Save"**

4. **Enable Google Sign-in**
   - Click on **"Google"**
   - Toggle **"Enable"** to ON
   - Set **Project support email** (use your email or project email)
   - Click **"Save"**
   - You may need to configure OAuth consent screen (follow prompts if needed)

---

## Step 3: Enable Firestore Database

1. **Navigate to Firestore Database**
   - In the left sidebar, click **"Firestore Database"** (under "Build")
   - Click **"Create database"** button

2. **Choose Security Rules Mode**
   - Select **"Start in test mode"** (we'll update rules later)
   - Click **"Next"**

3. **Choose Location**
   - Select a location closest to your users (e.g., `us-central1`, `us-east1`)
   - **Important:** This cannot be changed later
   - Click **"Enable"**

4. **Wait for Database Creation**
   - Firestore will be created (takes 30-60 seconds)
   - You'll see the Firestore Database console

---

## Step 4: Enable Firebase Storage

1. **Navigate to Storage**
   - In the left sidebar, click **"Storage"** (under "Build")
   - Click **"Get started"** button

2. **Set Up Storage**
   - Choose **"Start in test mode"** (we have storage.rules file)
   - Click **"Next"**

3. **Choose Location**
   - Use the same location as Firestore (recommended)
   - Click **"Done"**

4. **Wait for Storage Creation**
   - Storage will be created (takes 30-60 seconds)

---

## Step 5: Get Firebase Configuration

1. **Go to Project Settings**
   - Click the **gear icon** (⚙️) next to "Project Overview" in the left sidebar
   - Click **"Project settings"**

2. **Find Your Web App Config**
   - Scroll down to **"Your apps"** section
   - If you don't have a web app yet:
     - Click the **"</>"** (web) icon
     - Register app nickname: `nurtureai-web` (or any name)
     - **Do NOT** check "Also set up Firebase Hosting"
     - Click **"Register app"**
   - You'll see your Firebase configuration object

3. **Copy Configuration Values**
   You'll see something like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef1234567890"
   };
   ```

4. **Note Your Project ID**
   - Your `projectId` is what you need for `.firebaserc`
   - Example: If `projectId: "nurtureai-12345"`, that's your project ID

---

## Step 6: Update Local Files

### Update `.firebaserc`

1. **Open `.firebaserc` file** in your project
2. **Replace** `"your-project-id"` with your actual project ID:
   ```json
   {
     "projects": {
       "default": "nurtureai-12345"
     }
   }
   ```
   (Use your actual project ID from Step 5)

### Create `.env.local` File

1. **Copy `.env.example`** to create `.env.local`:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env.local
   
   # On Mac/Linux:
   cp .env.example .env.local
   ```

2. **Open `.env.local`** and fill in your Firebase config:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

   # OpenAI API (add later)
   VITE_OPENAI_API_KEY=your_openai_api_key_here

   # Pinecone (add later)
   VITE_PINECONE_API_KEY=your_pinecone_api_key_here
   VITE_PINECONE_ENVIRONMENT=us-east-1-aws
   VITE_PINECONE_INDEX_NAME=nurtureai-knowledge-base

   # Google Cloud Vision (optional, add later)
   VITE_GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_key_here
   ```

3. **Replace all values** with your actual Firebase config from Step 5

---

## Step 7: Install Firebase CLI (if not already installed)

1. **Check if Firebase CLI is installed:**
   ```bash
   firebase --version
   ```

2. **If not installed, install it:**
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase:**
   ```bash
   firebase login
   ```
   - This will open a browser window
   - Sign in with the same Google account you used for Firebase Console
   - Grant permissions

4. **Initialize Firebase in your project:**
   ```bash
   firebase init
   ```
   - Select features: **Firestore**, **Functions**, **Hosting**, **Storage**
   - Use existing project: **Yes**
   - Select your project from the list
   - For Firestore rules: Use existing `firestore.rules` (already created)
   - For Firestore indexes: Use existing `firestore.indexes.json`
   - For Functions: Use existing `functions` directory
   - For Hosting: Use existing `build` directory
   - For Storage rules: Use existing `storage.rules`

---

## Step 8: Verify Setup

1. **Install project dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Check for errors:**
   - The app should start at `http://localhost:3000`
   - Check browser console for any Firebase connection errors
   - If you see Firebase warnings about missing config, check your `.env.local` file

---

## Step 9: Deploy Security Rules (Optional but Recommended)

Once you've verified everything works:

```bash
firebase deploy --only firestore:rules,storage:rules
```

This will deploy your security rules to Firebase.

---

## Troubleshooting

### "Firebase configuration is missing" warning
- Check that `.env.local` exists and has all required values
- Make sure variable names start with `VITE_` (for Vite)
- Restart your dev server after creating/updating `.env.local`

### "Permission denied" errors
- Make sure you've enabled Authentication, Firestore, and Storage in Firebase Console
- Check that your security rules are correct
- Verify you're logged in: `firebase login`

### Project ID not found
- Double-check `.firebaserc` has the correct project ID
- Run `firebase projects:list` to see your available projects

---

## Quick Reference Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Firestore Database created
- [ ] Firebase Storage enabled
- [ ] Firebase config values copied
- [ ] `.firebaserc` updated with project ID
- [ ] `.env.local` created with Firebase config
- [ ] Firebase CLI installed and logged in
- [ ] `firebase init` completed
- [ ] `npm install` completed
- [ ] Dev server runs without errors
- [ ] Security rules deployed (optional)

---

**Next Steps:** Once Firebase is set up, you can proceed with PR #3 (CSV Data Import) or continue with other features!

