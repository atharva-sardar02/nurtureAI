# Setup Guide
## Complete Development Environment Setup

This guide will walk you through setting up the NurtureAI development environment from scratch.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Firebase CLI** - Install with `npm install -g firebase-tools`
- **Code Editor** - VS Code recommended with React extensions

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd nurtureAI
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install all project dependencies including:
- React 18+
- Vite (build tool)
- Tailwind CSS v3
- shadcn/ui components
- Firebase SDK
- React Hook Form
- And more...

---

## Step 3: Set Up Environment Variables

### 3.1 Copy Environment Template

```bash
cp .env.example .env
```

### 3.2 Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. Click the web icon `</>` to add a web app
6. Copy the Firebase configuration values

### 3.3 Update `.env` File

Open `.env` and fill in your Firebase credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# OpenAI API (add when implementing AI chat)
VITE_OPENAI_API_KEY=sk-proj-...

# Pinecone (add when implementing RAG)
VITE_PINECONE_API_KEY=your_pinecone_api_key_here
VITE_PINECONE_ENVIRONMENT=us-east-1-aws
VITE_PINECONE_INDEX_NAME=nurtureai-knowledge-base

# Google Cloud Vision (optional, for OCR)
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_key_here
```

**⚠️ Important Notes:**
- Vite requires `VITE_` prefix (not `REACT_APP_`)
- Environment variables are only read at server startup
- Restart dev server after updating `.env`
- Never commit `.env` to version control (it's in `.gitignore`)

---

## Step 4: Initialize Firebase

### 4.1 Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

### 4.2 Initialize Firebase in Project

```bash
firebase init
```

Select the following:
- ✅ **Firestore** - Configure security rules and indexes
- ✅ **Functions** - Set up Cloud Functions
- ✅ **Hosting** - Configure hosting
- ✅ **Storage** - Set up Storage rules

Follow the prompts to:
- Select your Firebase project
- Choose default settings where appropriate
- Keep existing files when prompted

### 4.3 Update `.firebaserc`

Ensure `.firebaserc` has your project ID:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

---

## Step 5: Configure Firebase Services

### 5.1 Enable Authentication

1. Go to Firebase Console → **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Enable **Google** provider (optional, for OAuth)

### 5.2 Set Up Firestore

1. Go to Firebase Console → **Firestore Database**
2. Click **Create Database**
3. Start in **test mode** (we'll add security rules later)
4. Choose a location (closest to your users)

### 5.3 Set Up Storage

1. Go to Firebase Console → **Storage**
2. Click **Get Started**
3. Start in **test mode**
4. Use the same location as Firestore

---

## Step 6: Start Development Server

```bash
npm run dev
```

The app should open at `http://localhost:3000` (or the port shown in terminal).

You should see:
- ✅ Login page (if not authenticated)
- ✅ Firebase initialized successfully (in console)
- ✅ No errors in browser console

---

## Step 7: Verify Setup

### 7.1 Test Authentication

1. Click **Sign Up** on the login page
2. Create a test account with email/password
3. You should be redirected to the chat interface
4. Check Firebase Console → Authentication to see your user

### 7.2 Test Firebase Connection

Open browser console and run:

```javascript
window.testFirebase()
```

You should see:
- ✅ Firebase services initialized
- ✅ Auth service available
- ✅ Firestore connection successful

---

## Troubleshooting

### Issue: "Firebase configuration is missing"

**Solution:**
- Check that `.env` file exists and has `VITE_` prefix
- Restart dev server after updating `.env`
- Verify all Firebase config values are correct

### Issue: "Invalid API key"

**Solution:**
- Verify API key in Firebase Console
- Check that you're using the correct project
- Ensure no extra spaces in `.env` file

### Issue: Port already in use

**Solution:**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in vite.config.js
```

### Issue: Module not found errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

After setup is complete:

1. **PR #3:** Import CSV test data
   ```bash
   npm run seed:database  # (when implemented)
   ```

2. **Continue Development:** Follow the [Implementation Task List](./IMPLEMENTATION_TASK_LIST.md)

3. **Read Documentation:**
   - [PRD](./nurtureai-prd.md) - Product requirements
   - [Memory Bank](./memory-bank/) - Project context

---

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format

# Run tests (when configured)
npm test
```

---

## Project Structure

```
nurtureAI/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   ├── services/         # API clients
│   ├── styles/          # CSS files
│   └── utils/           # Helper functions
├── functions/            # Firebase Cloud Functions
├── memory-bank/          # Project documentation
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── firebase.json        # Firebase config
└── vite.config.js      # Vite configuration
```

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

**Last Updated:** 2025-11-10  
**Status:** Active Development

