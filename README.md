# NurtureAI
## Daybreak Health Parent Onboarding System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0+-FFCA28?logo=firebase)](https://firebase.google.com/)

An AI-powered onboarding system that helps parents assess mental health needs for their children and complete the onboarding process efficiently through empathetic conversations, streamlined forms, and smart clinician matching.

---

## 🎯 Project Overview

NurtureAI provides a supportive, conversational onboarding experience for parents seeking mental health services for their children. The system uses AI-powered assessments enhanced with RAG (Retrieval-Augmented Generation) to provide evidence-based guidance, while streamlining insurance verification, cost estimation, and appointment scheduling.

### Key Features

- **🤖 AI-Powered Mental Health Assessment** - Conversational screening using OpenAI GPT-4 with RAG enhancement
- **📝 Streamlined Onboarding** - Multi-step forms with progress tracking and auto-save
- **🏥 Smart Scheduling** - Clinician-patient matching based on insurance, availability, and credentials
- **💳 Insurance Verification** - Real-time coverage checking and cost estimation
- **📸 OCR Support** - Insurance card image upload with automatic data extraction
- **📊 Questionnaire History** - Display past assessment scores and trends
- **🔗 Referral Tracking** - Track referral sources and organization relationships

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** and npm/yarn
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git**
- **Firebase project** (create at [Firebase Console](https://console.firebase.google.com/))
- **OpenAI API key** (get from [OpenAI Platform](https://platform.openai.com/))
- **Google Cloud account** (same as Firebase, for Vision API - optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nurtureAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration (get from Firebase Console > Project Settings > Your apps)
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

   # OpenAI API (required for AI chat)
   VITE_OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXX

   # Google Cloud Vision API (optional - for OCR)
   # Note: Vision API uses Application Default Credentials, no key needed in .env
   # Just enable the API in Google Cloud Console
   ```
   
   **⚠️ Important Notes:**
   - Vite requires `VITE_` prefix for all environment variables
   - Environment variables are only read at server startup
   - **Restart dev server** after updating `.env`
   - Never commit `.env` to version control (it's in `.gitignore`)

4. **Initialize Firebase**
   ```bash
   # Login to Firebase
   firebase login
   
   # Initialize Firebase (select Firestore, Functions, Hosting, Storage)
   firebase init
   ```

5. **Enable Firebase Services**
   
   In [Firebase Console](https://console.firebase.google.com/):
   - **Authentication**: Enable Email/Password provider
   - **Firestore**: Create database (start in test mode, we'll deploy rules)
   - **Storage**: Enable (start in test mode)
   - **Functions**: Already configured via `firebase init`

6. **Enable Google Cloud Vision API** (for OCR - optional)
   
   ```bash
   # Navigate to Google Cloud Console
   # https://console.cloud.google.com/apis/library/vision.googleapis.com
   # Select your Firebase project and click "Enable"
   ```
   
   Or use gcloud CLI:
   ```bash
   gcloud services enable vision.googleapis.com --project=your-project-id
   ```

7. **Import test data** (optional)
   ```bash
   npm run seed:database
   ```

8. **Start development server**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

### Usage Examples

#### Running Tests
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:security

# Run tests for specific features
npm run test:assessment
npm run test:onboarding
npm run test:scheduling
npm run test:insurance
```

#### Building for Production
```bash
# Build the app
npm run build

# Preview production build locally
npm run preview
```

#### Deploying to Firebase
```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Troubleshooting

#### Issue: "Firebase configuration is missing"
**Solution:**
- Verify `.env` file exists in root directory
- Check all variables have `VITE_` prefix
- Restart dev server after updating `.env`
- Verify Firebase config values in Firebase Console

#### Issue: "Invalid API key" or Firebase errors
**Solution:**
- Double-check API key in Firebase Console → Project Settings
- Ensure you're using the correct Firebase project
- Check for extra spaces or quotes in `.env` file
- Verify Firebase services are enabled in Console

#### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in vite.config.js
```

#### Issue: "Module not found" errors
**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Also reinstall functions dependencies
cd functions
rm -rf node_modules package-lock.json
npm install
cd ..
```

#### Issue: "OpenAI API error"
**Solution:**
- Verify API key is correct and has credits
- Check API key has access to GPT-4 models
- Ensure `VITE_OPENAI_API_KEY` is set in `.env`
- Restart dev server after adding key

#### Issue: "Google Cloud Vision API error"
**Solution:**
- Ensure Vision API is enabled in Google Cloud Console
- Verify you're using Application Default Credentials
- Run: `gcloud auth application-default login`
- Check service account has Vision API permissions

#### Issue: "Firestore permission denied"
**Solution:**
- Deploy security rules: `firebase deploy --only firestore:rules`
- Check rules file syntax: `firebase firestore:rules:validate`
- Verify user is authenticated in Firebase Auth
- Check user has required permissions in security rules

#### Issue: "Build fails with path alias errors"
**Solution:**
- Verify `vite.config.js` has path alias configuration
- Check `jsconfig.json` or `tsconfig.json` exists
- Ensure imports use `@/` prefix correctly

---

## 📁 Project Structure

```
nurtureAI/
├── .github/                 # GitHub workflows and templates
├── .cursor/                 # Cursor IDE rules
├── memory-bank/             # Project documentation
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── activeContext.md
│   └── progress.md
├── public/                  # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── chat/           # AI chat interface
│   │   ├── onboarding/     # Onboarding forms
│   │   ├── scheduling/     # Appointment scheduling
│   │   ├── insurance/        # Insurance verification
│   │   └── common/         # Shared components
│   ├── services/          # API clients and business logic
│   │   ├── firebase/       # Firebase services
│   │   ├── ai/            # OpenAI and RAG services
│   │   ├── scheduling/     # Scheduling logic
│   │   └── insurance/     # Insurance services
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React Context providers
│   ├── utils/             # Helper functions
│   ├── routes/            # Routing configuration
│   └── pages/             # Page components
├── functions/              # Firebase Cloud Functions
├── scripts/               # Data import and utility scripts
├── tests/                 # Test files
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── [16 CSV test data files]
├── knowledge-base/        # RAG knowledge base documents
├── .env.example          # Environment variables template
├── firebase.json         # Firebase configuration
├── firestore.rules       # Firestore security rules
└── package.json
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18+** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing (to be implemented)
- **React Context API** - State management
- **Tailwind CSS v3** - Styling framework
- **shadcn/ui** - UI component library
- **React Hook Form** - Form handling

### Backend
- **Firebase Firestore** - NoSQL database
- **Firebase Auth** - Authentication (Email/Password + Google OAuth)
- **Firebase Storage** - File storage
- **Firebase Functions** - Serverless functions

### AI & External Services
- **OpenAI API** - GPT-4 for conversational AI
- **Pinecone** - Vector database for RAG
- **Google Cloud Vision API** - OCR for insurance cards (optional)

### Development Tools
- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Cypress / Playwright** - E2E testing
- **Papa Parse** - CSV parsing

---

## 📋 Development Workflow

This project is organized into **18 Pull Requests** for incremental development. See [IMPLEMENTATION_TASK_LIST.md](./IMPLEMENTATION_TASK_LIST.md) for complete details.

### PR Structure
1. **PR #1-3:** Foundation (Setup, Documentation, Data Import)
2. **PR #4-6:** Core Features (Auth, UI, AI Chat)
3. **PR #7:** RAG Enhancement
4. **PR #8-9:** Onboarding & Scheduling
5. **PR #10-12:** Advanced Features (Insurance, OCR, Questionnaires)
6. **PR #13-18:** Polish, Testing, Security, Deployment

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- unit
npm test -- integration
npm test -- e2e
```

### Available Scripts

```bash
npm run dev            # Start Vite development server
npm run build          # Build for production
npm run preview        # Preview production build
npm test              # Run tests (when configured)
npm run seed:database  # Import CSV data to Firestore (when implemented)
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
```

---

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests** - Individual functions and utilities (80%+ coverage target)
- **Integration Tests** - Service interactions (Firebase, OpenAI, Pinecone)
- **Component Tests** - React component rendering and interactions
- **E2E Tests** - Complete user journeys
- **Security Tests** - Firestore security rules validation

Tests are integrated into each PR, not written separately. See test files in `tests/` directory.

---

## 📊 Data Import

The project uses **16 CSV files** for test data:

1. `clinician_availabilities.csv`
2. `clinician_credentialed_insurances.csv`
3. `clinicians_anonymized.csv`
4. `contracts.csv`
5. `credentialed_insurances.csv`
6. `documents.csv`
7. `insurance_coverages.csv`
8. `kinships.csv` (uses numeric codes - requires mapping)
9. `memberships.csv`
10. `org_contracts.csv`
11. `orgs.csv`
12. `patient_availabilities.csv`
13. `patients_and_guardians_anonymized.csv`
14. `questionnaires.csv`
15. `referral_members.csv`
16. `referrals.csv`

Import scripts are in `scripts/` directory. Run `npm run seed:database` to import all data.

---

## 🔒 Security

- **Firestore Security Rules** - Row-level access control
- **Authentication Required** - Protected routes and API endpoints
- **Data Privacy** - 90-day conversation retention, user-triggered deletion
- **HIPAA Considerations** - Anonymized test data, secure data handling
- **API Key Protection** - Never commit keys to version control

See `firestore.rules` for security rule implementation.

---

## 🚀 Deployment

### Firebase Hosting

```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

### Environment Setup

1. Create production Firebase project
2. Set production environment variables
3. Deploy Firestore security rules
4. Deploy Firebase Functions
5. Deploy frontend to Firebase Hosting

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment guide.

---

## 📚 Documentation

- **[Production Requirements Document (PRD)](./nurtureai-prd.md)** - Complete product requirements
- **[Implementation Task List](./IMPLEMENTATION_TASK_LIST.md)** - 18 PR breakdown with detailed tasks
- **[Memory Bank](./memory-bank/)** - Project documentation and context
  - `projectbrief.md` - Project overview and goals
  - `productContext.md` - User stories and product context
  - `systemPatterns.md` - Architecture and design patterns
  - `techContext.md` - Technology stack and setup
  - `activeContext.md` - Current work focus
  - `progress.md` - Status tracking

---

## 🤝 Contributing

This is a course project. Development follows the 18-PR structure outlined in the Implementation Task List.

### Development Guidelines

1. Follow the PR order in the task list
2. Write tests alongside features (not after)
3. Follow code style (ESLint + Prettier)
4. Update documentation as needed
5. Reference PRD for requirements

---

## 📝 License

This project is part of a course assignment. See LICENSE file for details.

---

## 🐛 Known Issues

See [docs/KNOWN_ISSUES.md](./docs/KNOWN_ISSUES.md) for current limitations and known issues.

---

## 🔮 Future Enhancements

See [docs/FUTURE_ENHANCEMENTS.md](./docs/FUTURE_ENHANCEMENTS.md) for P2 features and improvement ideas.

---

## 📞 Support

For questions or issues:
- Review the [PRD](./nurtureai-prd.md) for requirements
- Check [Memory Bank](./memory-bank/) for project context
- See [Implementation Task List](./IMPLEMENTATION_TASK_LIST.md) for development tasks

---

## 🙏 Acknowledgments

- **Daybreak Health** - For providing test data and requirements
- **OpenAI** - For GPT-4 API
- **Firebase** - For backend infrastructure
- **Pinecone** - For vector database services

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0  
**Status:** ✅ Complete - Ready for Production Deployment

---

## 📈 Project Status

- **Total PRs:** 18
- **Completed:** 18 ✅ (ALL PRs COMPLETE!)
- **In Progress:** 0
- **Remaining:** 0

**Current Progress:** 100% complete 🎉

### Completed Features
- ✅ Project Setup & Documentation
- ✅ Data Import & Validation
- ✅ Authentication System
- ✅ Core UI Components
- ✅ AI Chat Interface
- ✅ Onboarding Form System
- ✅ Scheduling System
- ✅ Insurance Verification & OCR
- ✅ Questionnaire & Referral Integration
- ✅ Support Chat System
- ✅ UI Polish & Responsive Design
- ✅ Testing Suite (400+ tests)
- ✅ Security Rules & Indexes
- ✅ Complete Documentation
- ✅ CI/CD Pipeline & Deployment

See [memory-bank/progress.md](./memory-bank/progress.md) for detailed progress tracking.

