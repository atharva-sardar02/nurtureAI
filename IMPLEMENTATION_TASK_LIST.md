# NurtureAI Implementation Task List
## Daybreak Health Parent Onboarding System

---

## 📁 Project File Structure

```
nurtureAI/
├── .github/
│   └── workflows/
│       └── firebase-deploy.yml
├── .cursor/
│   └── rules/
│       ├── base.mdc
│       ├── frontend/
│       └── backend/
├── memory-bank/
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── activeContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   └── progress.md
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── CrisisDetection.jsx
│   │   │   └── AlternativeResources.jsx
│   │   ├── onboarding/
│   │   │   ├── OnboardingWizard.jsx
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── DemographicInfo.jsx
│   │   │   ├── KinshipSelector.jsx
│   │   │   ├── ContactInfo.jsx
│   │   │   ├── ConsentForm.jsx
│   │   │   ├── QuestionnaireHistorySummary.jsx
│   │   │   ├── DataDeletionOption.jsx
│   │   │   └── ProgressBar.jsx
│   │   ├── scheduling/
│   │   │   ├── SchedulingCalendar.jsx
│   │   │   ├── TimeSlotSelector.jsx
│   │   │   ├── ClinicianCard.jsx
│   │   │   └── AppointmentConfirmation.jsx
│   │   ├── insurance/
│   │   │   ├── InsuranceVerification.jsx
│   │   │   ├── InsuranceCardUpload.jsx
│   │   │   ├── InsuranceForm.jsx
│   │   │   ├── CoverageDisplay.jsx
│   │   │   ├── NetworkStatus.jsx
│   │   │   ├── CostEstimator.jsx
│   │   │   └── CostBreakdown.jsx
│   │   ├── referrals/
│   │   │   ├── ReferralInfo.jsx
│   │   │   └── OrganizationLink.jsx
│   │   ├── support/
│   │   │   └── SupportChat.jsx
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   └── assessment/
│   │       └── AssessmentSummary.jsx
│   ├── services/
│   │   ├── firebase/
│   │   │   ├── config.js
│   │   │   ├── auth.js
│   │   │   ├── firestore.js
│   │   │   └── storage.js
│   │   ├── ai/
│   │   │   ├── openai.js
│   │   │   ├── AssessmentEngine.js
│   │   │   ├── RAGService.js
│   │   │   └── EmbeddingGenerator.js
│   │   ├── scheduling/
│   │   │   └── ClinicianMatcher.js
│   │   ├── insurance/
│   │   │   ├── InsuranceMatcher.js
│   │   │   ├── InsuranceValidator.js
│   │   │   ├── OCRProcessor.js
│   │   │   └── InsuranceCalculator.js
│   │   └── referrals/
│   │       └── ReferralTracker.js
│   ├── utils/
│   │   ├── kinshipMapping.js
│   │   ├── dateHelpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFirestore.js
│   │   ├── useChat.js
│   │   └── useScheduling.js
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── OnboardingContext.jsx
│   │   └── ThemeContext.jsx
│   ├── routes/
│   │   ├── Routes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Auth.jsx
│   │   ├── Assessment.jsx
│   │   ├── Onboarding.jsx
│   │   ├── Scheduling.jsx
│   │   └── Confirmation.jsx
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   └── components/
│   ├── App.jsx
│   └── index.js
├── functions/
│   ├── src/
│   │   ├── index.js
│   │   ├── processInsuranceCard.js
│   │   ├── calculateCostEstimate.js
│   │   ├── sendAppointmentReminder.js
│   │   ├── generateEmbeddings.js
│   │   └── performRAGSearch.js
│   └── package.json
├── scripts/
│   ├── seedDatabase.js
│   ├── importCSV.js
│   ├── generateKinshipMapping.js
│   ├── validateData.js
│   └── setupKnowledgeBase.js
├── tests/
│   ├── [CSV files - 16 total]
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── knowledge-base/
│   ├── phq-a/
│   ├── gad-7/
│   ├── psc-17/
│   ├── sdq/
│   └── risk-assessment/
├── .env.example
├── .gitignore
├── .cursorrules
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── package.json
├── README.md
└── nurtureai-prd.md
```

---

## 🎯 Pull Request Task Breakdown

---

### **PR #1: Project Setup & Configuration**
**Branch:** `feature/project-setup`  
**Description:** Initialize React project, configure Firebase, set up development environment

#### Tasks:
- [ ] **Task 1.1: Initialize React Application**
  - Files to create:
    - `package.json`
    - `public/index.html`
    - `public/favicon.ico`
    - `src/index.js`
    - `src/App.jsx`
  - Actions:
    - Run `npx create-react-app nurtureai` or use Vite
    - Install core dependencies: react-router-dom, firebase, axios
    - Configure ESLint and Prettier

- [ ] **Task 1.2: Firebase Project Setup**
  - Files to create:
    - `firebase.json`
    - `firestore.rules`
    - `firestore.indexes.json`
    - `storage.rules`
    - `.firebaserc`
  - Actions:
    - Create Firebase project in console
    - Enable Authentication (Email/Password + Google)
    - Enable Firestore Database
    - Enable Firebase Storage
    - Configure security rules

- [ ] **Task 1.3: Environment Configuration**
  - Files to create:
    - `.env.example`
    - `.env.local` (gitignored)
    - `.gitignore`
    - `src/services/firebase/config.js`
  - Actions:
    - Add Firebase config keys
    - Add OpenAI API key placeholder
    - Add Pinecone API key placeholder
    - Configure environment variables

- [ ] **Task 1.4: Project Structure Setup**
  - Files to create:
    - All directories from file structure above
    - `README.md`
    - `.cursorrules`
    - `.cursor/rules/base.mdc`
  - Actions:
    - Create folder structure
    - Add README with setup instructions
    - Configure Cursor rules

- [ ] **Task 1.5: Styling Framework Setup**
  - Files to create:
    - `src/styles/global.css`
    - `src/styles/variables.css`
    - `tailwind.config.js` (if using Tailwind)
  - Actions:
    - Install Material-UI or Tailwind CSS
    - Set up global styles and CSS variables
    - Create theme configuration

**Review Checklist:**
- [ ] All dependencies installed correctly
- [ ] Firebase project connected
- [ ] Environment variables configured
- [ ] Development server runs without errors
- [ ] Folder structure matches specification

---

### **PR #2: Memory Bank & Documentation Foundation**
**Branch:** `feature/memory-bank`  
**Description:** Set up Memory Bank structure and initial documentation

#### Tasks:
- [ ] **Task 2.1: Create Memory Bank Structure**
  - Files to create:
    - `memory-bank/projectbrief.md`
    - `memory-bank/productContext.md`
    - `memory-bank/activeContext.md`
    - `memory-bank/systemPatterns.md`
    - `memory-bank/techContext.md`
    - `memory-bank/progress.md`
  - Actions:
    - Document project goals from PRD
    - Define product context and user stories
    - Establish system architecture patterns
    - Document technology stack decisions

- [ ] **Task 2.2: Copy PRD to Repository**
  - Files to update:
    - `nurtureai-prd.md`
  - Actions:
    - Copy corrected PRD to repository root
    - Link PRD in README

- [ ] **Task 2.3: Create Implementation Task List**
  - Files to create:
    - `IMPLEMENTATION_TASK_LIST.md` (this file)
  - Actions:
    - Document all PRs and tasks
    - Reference in README

**Review Checklist:**
- [ ] All memory bank files created
- [ ] Documentation is clear and comprehensive
- [ ] PRD accurately reflects current decisions

---

### **PR #3: CSV Data Import System**
**Branch:** `feature/data-import`  
**Description:** Build CSV import scripts and seed Firestore with test data

#### Tasks:
- [ ] **Task 3.1: Install Data Processing Dependencies**
  - Files to update:
    - `package.json`
  - Actions:
    - Install `papaparse` for CSV parsing
    - Install Firebase Admin SDK for scripts

- [ ] **Task 3.2: Create Kinship Mapping Utility**
  - Files to create:
    - `src/utils/kinshipMapping.js`
    - `scripts/generateKinshipMapping.js`
  - Actions:
    - Define code-to-label mapping (1: "mother", 2: "father", 12: "other", 2051: "guardian")
    - Create helper functions to convert codes to labels
    - Export mapping for use across app

- [ ] **Task 3.3: Build CSV Import Script**
  - Files to create:
    - `scripts/seedDatabase.js`
    - `scripts/importCSV.js`
    - `scripts/validateData.js`
  - Actions:
    - Create generic CSV parser function
    - Implement row transformation logic
    - Handle merge operations for junction tables
    - Add data validation checks

- [ ] **Task 3.4: Import All CSV Files (16 files)**
  - Files to read:
    - `tests/contracts.csv`
    - `tests/orgs.csv`
    - `tests/org_contracts.csv`
    - `tests/clinicians_anonymized.csv`
    - `tests/credentialed_insurances.csv`
    - `tests/clinician_credentialed_insurances.csv`
    - `tests/clinician_availabilities.csv`
    - `tests/documents.csv`
    - `tests/insurance_coverages.csv`
    - `tests/patients_and_guardians_anonymized.csv`
    - `tests/kinships.csv`
    - `tests/memberships.csv`
    - `tests/questionnaires.csv`
    - `tests/referrals.csv`
    - `tests/referral_members.csv`
    - `tests/patient_availabilities.csv`
  - Actions:
    - Run import script in correct order
    - Verify all data imported successfully
    - Create data quality report
    - Document any data issues found

- [ ] **Task 3.5: Create Firestore Collections**
  - Firestore collections to create:
    - `contracts`
    - `organizations`
    - `orgContracts`
    - `clinicians`
    - `credentialedInsurances`
    - `documents`
    - `insuranceCoverages`
    - `patients`
    - `kinships`
    - `questionnaires`
    - `referrals`
  - Actions:
    - Verify collection structure matches schema
    - Create compound indexes as needed
    - Test queries for performance

- [ ] **Task 3.6: Unit Tests for Data Import**
  - Files to create:
    - `tests/unit/kinshipMapping.test.js`
    - `tests/unit/csvParser.test.js`
    - `tests/unit/dataTransform.test.js`
  - Actions:
    - Test kinship code-to-label mapping (verify 1→"mother", 2→"father", etc.)
    - Test CSV parsing for all 16 files
    - Test data transformation functions
    - Test validation rules

- [ ] **Task 3.7: Integration Tests for Database Seeding**
  - Files to create:
    - `tests/integration/dataImport.test.js`
  - Actions:
    - Test end-to-end import for sample CSV
    - Verify Firestore document structure matches schema
    - Test referential integrity (junction tables)
    - Verify data count matches CSV row count

**Review Checklist:**
- [ ] All 16 CSV files imported successfully
- [ ] Data relationships verified (foreign keys)
- [ ] Kinship code mapping working correctly
- [ ] No data quality issues
- [ ] Firestore indexes created
- [ ] ✅ **Unit tests passing** for kinship mapping and CSV parsing
- [ ] ✅ **Integration tests passing** for data import flow

---

### **PR #4: Authentication System**
**Branch:** `feature/authentication`  
**Description:** Implement Firebase Authentication with Email/Password and Google OAuth

#### Tasks:
- [ ] **Task 4.1: Authentication Service**
  - Files to create:
    - `src/services/firebase/auth.js`
    - `src/contexts/AuthContext.jsx`
    - `src/hooks/useAuth.js`
  - Actions:
    - Create auth service functions (signUp, signIn, signOut, resetPassword)
    - Implement Google OAuth flow
    - Set up auth state persistence
    - Create auth context provider

- [ ] **Task 4.2: Auth Pages**
  - Files to create:
    - `src/pages/Auth.jsx`
    - `src/components/common/Header.jsx`
  - Actions:
    - Create sign-up form
    - Create sign-in form
    - Add Google sign-in button
    - Add password reset functionality
    - Implement form validation

- [ ] **Task 4.3: Protected Routes**
  - Files to create:
    - `src/routes/Routes.jsx`
    - `src/routes/ProtectedRoute.jsx`
  - Actions:
    - Set up React Router
    - Create protected route wrapper
    - Add authentication guards
    - Handle unauthorized redirects

- [ ] **Task 4.4: User Profile Creation**
  - Files to update:
    - `src/services/firebase/firestore.js`
  - Firestore collections to use:
    - `users`
  - Actions:
    - Create user document on sign-up
    - Store role, authProvider, profile data
    - Set up 90-day conversation history TTL
    - Add data retention consent flag

- [ ] **Task 4.5: Integration Tests for Authentication**
  - Files to create:
    - `tests/integration/auth.test.js`
  - Actions:
    - Test sign-up flow (email/password)
    - Test sign-in flow (email/password)
    - Test Google OAuth flow (mock)
    - Test password reset
    - Test protected route access control
    - Verify user document creation in Firestore
    - Test auth state persistence

**Review Checklist:**
- [ ] Email/password authentication working
- [ ] Google OAuth working
- [ ] Protected routes preventing unauthorized access
- [ ] User documents created in Firestore
- [ ] Auth state persists across page refreshes
- [ ] ✅ **Integration tests passing** for all auth flows

---

### **PR #5: Core UI Components & Layout**
**Branch:** `feature/ui-foundation`  
**Description:** Build reusable UI components and application layout

#### Tasks:
- [ ] **Task 5.1: Common Components**
  - Files to create:
    - `src/components/common/Header.jsx`
    - `src/components/common/Footer.jsx`
    - `src/components/common/LoadingSpinner.jsx`
    - `src/components/common/ErrorBoundary.jsx`
  - Actions:
    - Create responsive header with navigation
    - Create footer with support links
    - Build loading state components
    - Implement error boundary for crash recovery

- [ ] **Task 5.2: Landing Page**
  - Files to create:
    - `src/pages/Landing.jsx`
  - Actions:
    - Create hero section
    - Add value proposition content
    - Add CTA buttons (Sign Up, Sign In)
    - Make responsive for mobile

- [ ] **Task 5.3: Utility Functions**
  - Files to create:
    - `src/utils/dateHelpers.js`
    - `src/utils/validators.js`
    - `src/utils/constants.js`
  - Actions:
    - Create date formatting functions
    - Create form validation utilities
    - Define app-wide constants

**Review Checklist:**
- [ ] All common components render correctly
- [ ] Landing page is visually appealing
- [ ] Responsive design works on mobile
- [ ] Error boundary catches errors gracefully

---

### **PR #6: AI Chat Interface (Core - No RAG)**
**Branch:** `feature/ai-chat-core`  
**Description:** Build conversational AI assessment interface using OpenAI API

#### Tasks:
- [ ] **Task 6.1: OpenAI Service Integration**
  - Files to create:
    - `src/services/ai/openai.js`
    - `src/services/ai/AssessmentEngine.js`
  - Actions:
    - Set up OpenAI API client
    - Create chat completion function
    - Implement streaming responses
    - Add error handling and retries
    - Set up rate limiting

- [ ] **Task 6.2: Chat Interface Components**
  - Files to create:
    - `src/components/chat/ChatInterface.jsx`
    - `src/components/chat/MessageBubble.jsx`
    - `src/hooks/useChat.js`
  - Actions:
    - Create chat UI with message history
    - Implement message input with send button
    - Add typing indicators
    - Style message bubbles (user vs AI)
    - Add auto-scroll to latest message

- [ ] **Task 6.3: Assessment Logic**
  - Files to create:
    - `src/components/chat/CrisisDetection.jsx`
    - `src/components/chat/AlternativeResources.jsx`
  - Actions:
    - Create system prompts for mental health assessment
    - Implement conversation flow logic
    - Add crisis detection keywords
    - Display alternative resources when not a fit
    - Add "seek immediate help" thresholds

- [ ] **Task 6.4: Conversation Storage**
  - Files to update:
    - `src/services/firebase/firestore.js`
  - Firestore collections to use:
    - `conversations`
  - Actions:
    - Store conversation messages in Firestore
    - Implement 90-day TTL
    - Link conversations to onboarding applications
    - Add user deletion capability

- [ ] **Task 6.5: Assessment Summary**
  - Files to create:
    - `src/components/assessment/AssessmentSummary.jsx`
    - `src/pages/Assessment.jsx`
  - Actions:
    - Generate assessment summary from conversation
    - Display suitability determination
    - Show "not a diagnosis" disclaimer
    - Add "Continue to Onboarding" button

- [ ] **Task 6.6: Unit Tests for Assessment Logic**
  - Files to create:
    - `tests/unit/AssessmentEngine.test.js`
    - `tests/unit/CrisisDetection.test.js`
  - Actions:
    - Test conversation flow branching logic
    - Test crisis keyword detection (self-harm, suicide, violence)
    - Test "seek immediate help" threshold triggers
    - Test assessment summary generation
    - Test alternative resources selection logic

- [ ] **Task 6.7: Integration Tests for AI Chat**
  - Files to create:
    - `tests/integration/aiChat.test.js`
  - Actions:
    - Test OpenAI API integration (use mock or test key)
    - Test message storage in Firestore
    - Test conversation retrieval
    - Test 90-day TTL setting
    - Test conversation deletion
    - Verify streaming response handling

**Review Checklist:**
- [ ] Chat interface functional and responsive
- [ ] OpenAI API responding correctly
- [ ] Conversations saved to Firestore
- [ ] Crisis detection working
- [ ] Assessment summary generates properly
- [ ] ✅ **Unit tests passing** for crisis detection and assessment logic
- [ ] ✅ **Integration tests passing** for OpenAI API and Firestore

---

### **PR #7: RAG Enhancement Layer**
**Branch:** `feature/rag-system`  
**Description:** Add RAG (Retrieval-Augmented Generation) for evidence-based responses

#### Tasks:
- [ ] **Task 7.1: Pinecone Setup**
  - Files to update:
    - `.env.example`
    - `src/services/ai/RAGService.js`
  - Actions:
    - Create Pinecone account and index
    - Configure dimension=1536 for OpenAI embeddings
    - Add Pinecone API key to environment
    - Test connection

- [ ] **Task 7.2: Knowledge Base Preparation**
  - Files to create:
    - `knowledge-base/phq-a/*.json` (10 documents)
    - `knowledge-base/gad-7/*.json` (8 documents)
    - `knowledge-base/psc-17/*.json` (10 documents)
    - `knowledge-base/sdq/*.json` (7 documents)
    - `knowledge-base/risk-assessment/*.json` (15 documents)
    - `scripts/setupKnowledgeBase.js`
  - Actions:
    - Create 50 curated documents total
    - Structure documents with metadata (category, source, ageGroup)
    - Validate content accuracy

- [ ] **Task 7.3: Embedding Generation**
  - Files to create:
    - `src/services/ai/EmbeddingGenerator.js`
  - Functions to create:
    - `functions/src/generateEmbeddings.js`
  - Actions:
    - Generate embeddings using OpenAI API
    - Upload embeddings to Pinecone
    - Store document metadata in Firestore
    - Create knowledge base index

- [ ] **Task 7.4: RAG Service Implementation**
  - Files to create:
    - `src/services/ai/RAGService.js`
  - Functions to create:
    - `functions/src/performRAGSearch.js`
  - Actions:
    - Implement vector similarity search
    - Set relevance threshold
    - Create context injection logic
    - Add graceful fallback if no results

- [ ] **Task 7.5: Integrate RAG with Chat**
  - Files to update:
    - `src/services/ai/AssessmentEngine.js`
    - `src/components/chat/ChatInterface.jsx`
  - Firestore collections to use:
    - `knowledgeBase`
  - Actions:
    - Modify chat flow to query RAG before OpenAI
    - Inject retrieved context into prompts
    - Store ragContext in conversation messages
    - Add feature flag to toggle RAG on/off

- [ ] **Task 7.6: Unit Tests for RAG System**
  - Files to create:
    - `tests/unit/RAGService.test.js`
    - `tests/unit/EmbeddingGenerator.test.js`
  - Actions:
    - Test embedding generation for sample text
    - Test relevance threshold logic
    - Test context injection formatting
    - Test graceful fallback when no results
    - Mock Pinecone responses for testing

- [ ] **Task 7.7: Integration Tests for RAG Retrieval**
  - Files to create:
    - `tests/integration/ragRetrieval.test.js`
  - Actions:
    - Test end-to-end RAG query with sample questions
    - Verify Pinecone API integration
    - Test knowledge base document retrieval
    - Verify metadata filtering (category, ageGroup)
    - Test that retrieved context improves response quality
    - Measure response time with/without RAG

**Review Checklist:**
- [ ] 50 knowledge base documents created
- [ ] Embeddings generated and uploaded to Pinecone
- [ ] RAG search returning relevant results
- [ ] AI responses improved with context
- [ ] Graceful fallback working
- [ ] ✅ **Unit tests passing** for RAG service and embedding generation
- [ ] ✅ **Integration tests passing** for Pinecone retrieval

---

### **PR #8: Onboarding Form System**
**Branch:** `feature/onboarding-forms`  
**Description:** Multi-step onboarding form with demographics, insurance, and consent

#### Tasks:
- [ ] **Task 8.1: Onboarding Context & State Management**
  - Files to create:
    - `src/contexts/OnboardingContext.jsx`
    - `src/hooks/useFirestore.js`
  - Actions:
    - Create onboarding state context
    - Implement form state persistence
    - Add auto-save functionality
    - Track completion progress

- [ ] **Task 8.2: Onboarding Wizard Container**
  - Files to create:
    - `src/components/onboarding/OnboardingWizard.jsx`
    - `src/components/onboarding/ProgressBar.jsx`
    - `src/pages/Onboarding.jsx`
  - Actions:
    - Create multi-step wizard container
    - Implement step navigation
    - Add progress indicator
    - Handle form submission

- [ ] **Task 8.3: Welcome & Referral Screen**
  - Files to create:
    - `src/components/onboarding/WelcomeScreen.jsx`
  - Firestore collections to use:
    - `referrals`
  - Actions:
    - Display welcome message
    - Show referral source if applicable ("Referred by: School X")
    - Add "Get Started" button

- [ ] **Task 8.4: Demographics Form**
  - Files to create:
    - `src/components/onboarding/DemographicInfo.jsx`
    - `src/components/onboarding/KinshipSelector.jsx`
  - Files to use:
    - `src/utils/kinshipMapping.js`
  - Actions:
    - Create child demographics form
    - Create parent/guardian demographics form
    - Implement kinship selector dropdown (numeric codes → labels)
    - Add form validation

- [ ] **Task 8.5: Contact Information**
  - Files to create:
    - `src/components/onboarding/ContactInfo.jsx`
  - Actions:
    - Create contact details form
    - Add phone number validation
    - Add email validation
    - Add address fields

- [ ] **Task 8.6: Consent Forms**
  - Files to create:
    - `src/components/onboarding/ConsentForm.jsx`
  - Firestore collections to use:
    - `documents`
  - Actions:
    - Display kinship relationship
    - Show data retention notice (90 days)
    - Load consent documents from Firestore
    - Require checkboxes for consent
    - Add signature field

- [ ] **Task 8.7: Questionnaire History Display**
  - Files to create:
    - `src/components/onboarding/QuestionnaireHistorySummary.jsx`
  - Firestore collections to use:
    - `questionnaires`
  - Actions:
    - Query past questionnaire responses
    - Display last score, date, trend
    - Make optional (don't block if no history)

- [ ] **Task 8.8: Data Deletion Option**
  - Files to create:
    - `src/components/onboarding/DataDeletionOption.jsx`
  - Actions:
    - Add "Delete My Data" button
    - Implement confirmation modal
    - Trigger conversation deletion
    - Update user preferences

- [ ] **Task 8.9: Onboarding Data Storage**
  - Files to update:
    - `src/services/firebase/firestore.js`
  - Firestore collections to use:
    - `onboardingApplications`
    - `patients`
  - Actions:
    - Create onboarding application document
    - Link to user, patient, guardian
    - Store kinship as {code, label} object
    - Update status as form progresses

- [ ] **Task 8.10: Unit Tests for Onboarding Logic**
  - Files to create:
    - `tests/unit/onboardingValidation.test.js`
    - `tests/unit/kinshipSelector.test.js`
  - Actions:
    - Test form validation rules (email, phone, required fields)
    - Test kinship dropdown rendering (numeric codes → labels)
    - Test progress calculation (percentage complete)
    - Test auto-save logic
    - Test step navigation (next/previous)

- [ ] **Task 8.11: Integration Tests for Onboarding Flow**
  - Files to create:
    - `tests/integration/onboarding.test.js`
  - Actions:
    - Test complete onboarding flow from start to finish
    - Verify data persists to Firestore after each step
    - Test form state recovery after page reload
    - Verify onboardingApplication document structure
    - Test kinship object stored as {code, label}
    - Test questionnaire history retrieval

**Review Checklist:**
- [ ] All onboarding steps functional
- [ ] Form validation working
- [ ] Kinship dropdown showing readable labels
- [ ] Data persists across sessions
- [ ] Progress bar updates correctly
- [ ] ✅ **Unit tests passing** for form validation and kinship logic
- [ ] ✅ **Integration tests passing** for complete onboarding flow

---

### **PR #9: Scheduling System with Clinician Matching**
**Branch:** `feature/scheduling`  
**Description:** Smart scheduling with clinician-patient matching based on availability and insurance

#### Tasks:
- [ ] **Task 9.1: Clinician Matching Service**
  - Files to create:
    - `src/services/scheduling/ClinicianMatcher.js`
    - `src/services/insurance/InsuranceMatcher.js`
  - Firestore collections to use:
    - `clinicians`
    - `credentialedInsurances`
    - `insuranceCoverages`
  - Actions:
    - Query clinicians by accepted insurance
    - Filter by availability slots
    - Match based on patient needs
    - Rank results by fit score

- [ ] **Task 9.2: Scheduling Calendar Component**
  - Files to create:
    - `src/components/scheduling/SchedulingCalendar.jsx`
    - `src/components/scheduling/TimeSlotSelector.jsx`
    - `src/hooks/useScheduling.js`
    - `src/pages/Scheduling.jsx`
  - Actions:
    - Build calendar view component
    - Display available appointment slots
    - Group slots by day/time
    - Add date picker
    - Highlight selected slot

- [ ] **Task 9.3: Clinician Display Cards**
  - Files to create:
    - `src/components/scheduling/ClinicianCard.jsx`
  - Firestore collections to use:
    - `clinicians`
  - Actions:
    - Display clinician photo, name, credentials
    - Show specialties and accepted insurances
    - Display available times
    - Add "Select" button

- [ ] **Task 9.4: Appointment Confirmation**
  - Files to create:
    - `src/components/scheduling/AppointmentConfirmation.jsx`
    - `src/pages/Confirmation.jsx`
  - Firestore collections to use:
    - `appointments`
  - Actions:
    - Create appointment document
    - Link to patient, clinician, availability slot
    - Display confirmation details
    - Show kinship relationship
    - Add to calendar button

- [ ] **Task 9.5: Appointment Reminder System**
  - Functions to create:
    - `functions/src/sendAppointmentReminder.js`
  - Actions:
    - Set up Firebase scheduled function
    - Send email reminders (optional)
    - Send SMS reminders (optional)
    - Update appointment status

- [ ] **Task 9.6: Unit Tests for Scheduling Logic**
  - Files to create:
    - `tests/unit/ClinicianMatcher.test.js`
    - `tests/unit/availabilityFiltering.test.js`
  - Actions:
    - Test clinician matching algorithm with sample data
    - Test insurance acceptance filtering
    - Test availability slot filtering (date/time)
    - Test fit score calculation
    - Test ranking of results
    - Test edge cases (no available clinicians, no insurance match)

- [ ] **Task 9.7: Integration Tests for Appointment Booking**
  - Files to create:
    - `tests/integration/scheduling.test.js`
  - Actions:
    - Test end-to-end appointment booking flow
    - Verify appointment document created in Firestore
    - Test appointment linked to correct patient, clinician, slot
    - Verify availability slot marked as booked
    - Test double-booking prevention
    - Test appointment retrieval for confirmation page

**Review Checklist:**
- [ ] Clinician matching working correctly
- [ ] Insurance filtering accurate
- [ ] Calendar displays available slots
- [ ] Appointments created successfully
- [ ] Confirmation page shows all details
- [ ] ✅ **Unit tests passing** for clinician matching and availability filtering
- [ ] ✅ **Integration tests passing** for appointment booking flow

---

### **PR #10: Insurance Verification & Matching**
**Branch:** `feature/insurance-verification`  
**Description:** Insurance verification, coverage display, and network status

#### Tasks:
- [ ] **Task 10.1: Insurance Verification Service**
  - Files to create:
    - `src/components/insurance/InsuranceVerification.jsx`
    - `src/services/insurance/InsuranceValidator.js`
  - Firestore collections to use:
    - `insuranceCoverages`
    - `credentialedInsurances`
  - Actions:
    - Lookup insurance plan in database
    - Validate member ID format
    - Check coverage status
    - Display verification results

- [ ] **Task 10.2: Insurance Matching Logic**
  - Files to update:
    - `src/services/insurance/InsuranceMatcher.js`
  - Firestore collections to use:
    - `credentialedInsurances`
    - `clinicians`
  - Actions:
    - Cross-reference patient insurance with clinicians
    - Identify in-network vs out-of-network
    - Filter clinician list by insurance acceptance

- [ ] **Task 10.3: Coverage Display Components**
  - Files to create:
    - `src/components/insurance/CoverageDisplay.jsx`
    - `src/components/insurance/NetworkStatus.jsx`
  - Actions:
    - Display coverage details (copay, deductible)
    - Show in-network/out-of-network status
    - Display coverage percentage
    - Add disclaimers

- [ ] **Task 10.4: Insurance Form (Manual Entry)**
  - Files to create:
    - `src/components/insurance/InsuranceForm.jsx`
  - Actions:
    - Create insurance information form
    - Add insurance provider dropdown
    - Add member ID field
    - Add group number field
    - Add validation

- [ ] **Task 10.5: Unit Tests for Insurance Logic**
  - Files to create:
    - `tests/unit/InsuranceMatcher.test.js`
    - `tests/unit/InsuranceValidator.test.js`
  - Actions:
    - Test insurance plan lookup with sample data
    - Test in-network vs out-of-network determination
    - Test clinician filtering by insurance acceptance
    - Test member ID validation
    - Test coverage status checking
    - Test edge cases (plan not found, invalid member ID)

- [ ] **Task 10.6: Integration Tests for Insurance Verification**
  - Files to create:
    - `tests/integration/insuranceVerification.test.js`
  - Actions:
    - Test insurance lookup in Firestore
    - Test cross-reference with credentialedInsurances collection
    - Verify coverage details retrieval
    - Test junction table queries (clinician_credentialed_insurances)
    - Test network status display logic

**Review Checklist:**
- [ ] Insurance verification working
- [ ] Coverage details displayed correctly
- [ ] Network status accurate
- [ ] Manual entry form functional
- [ ] ✅ **Unit tests passing** for insurance matching and validation
- [ ] ✅ **Integration tests passing** for insurance verification flow

---

### **PR #11: Insurance Card OCR & Cost Estimation**
**Branch:** `feature/insurance-ocr-cost`  
**Description:** OCR for insurance card upload and cost estimation tool

#### Tasks:
- [ ] **Task 11.1: Insurance Card Upload**
  - Files to create:
    - `src/components/insurance/InsuranceCardUpload.jsx`
  - Actions:
    - Create image upload component
    - Add image preview
    - Validate file type (JPG, PNG)
    - Upload to Firebase Storage

- [ ] **Task 11.2: OCR Processing**
  - Files to create:
    - `src/services/insurance/OCRProcessor.js`
  - Functions to create:
    - `functions/src/processInsuranceCard.js`
  - Actions:
    - Integrate Google Cloud Vision API or Tesseract.js
    - Extract text from insurance card image
    - Parse member ID, group number, plan name
    - Return confidence scores

- [ ] **Task 11.3: Auto-populate Insurance Form**
  - Files to update:
    - `src/components/insurance/InsuranceForm.jsx`
  - Actions:
    - Fill form fields from OCR results
    - Allow manual corrections
    - Validate extracted data
    - Fallback to manual entry if OCR fails

- [ ] **Task 11.4: Cost Estimation Service**
  - Files to create:
    - `src/components/insurance/CostEstimator.jsx`
    - `src/components/insurance/CostBreakdown.jsx`
    - `src/services/insurance/InsuranceCalculator.js`
  - Functions to create:
    - `functions/src/calculateCostEstimate.js`
  - Firestore collections to use:
    - `insuranceCoverages`
    - `memberships`
  - Actions:
    - Calculate estimated out-of-pocket costs
    - Factor in copay, deductible, coverage %
    - Display cost per session
    - Show cost breakdown
    - Add disclaimers about actual costs

- [ ] **Task 11.5: Unit Tests for Cost Calculation**
  - Files to create:
    - `tests/unit/InsuranceCalculator.test.js`
  - Actions:
    - Test cost calculation with various coverage scenarios
    - Test copay calculations
    - Test deductible calculations
    - Test percentage-based coverage calculations
    - Test out-of-pocket maximum logic
    - Test cost per session estimation
    - Test edge cases (no coverage, 100% coverage, high deductible)

- [ ] **Task 11.6: Integration Tests for OCR Processing**
  - Files to create:
    - `tests/integration/ocrProcessing.test.js`
  - Actions:
    - Test OCR with sample insurance card images
    - Verify text extraction accuracy
    - Test parsing of member ID, group number, plan name
    - Test confidence score calculation
    - Test fallback to manual entry on low confidence
    - Test form auto-population with OCR results

**Review Checklist:**
- [ ] Image upload working
- [ ] OCR extracting text accurately
- [ ] Form auto-populates from OCR
- [ ] Cost estimation accurate
- [ ] Disclaimers displayed
- [ ] ✅ **Unit tests passing** for cost calculation logic
- [ ] ✅ **Integration tests passing** for OCR processing

---

### **PR #12: Questionnaire & Referral Integration**
**Branch:** `feature/questionnaires-referrals`  
**Description:** Display questionnaire history and referral tracking

#### Tasks:
- [x] **Task 12.1: Questionnaire History Display** ✅
  - Files updated:
    - `src/components/onboarding/QuestionnaireHistorySummary.jsx`
    - `src/utils/questionnaireAnalysis.js` (new)
  - Firestore collections used:
    - `questionnaires`
  - Actions completed:
    - ✅ Query all questionnaires for patient by patientId
    - ✅ Display scores over time with severity badges
    - ✅ Show trend (improving/stable/worsening) with icons
    - ✅ Use questionnaire type mapping utility
    - ✅ Handle missing Firestore indexes gracefully

- [x] **Task 12.2: Referral Information Display** ✅
  - Files created:
    - `src/components/referrals/ReferralInfo.jsx`
    - `src/components/referrals/OrganizationLink.jsx`
    - `src/services/referrals/ReferralTracker.js`
  - Files updated:
    - `src/components/onboarding/WelcomeScreen.jsx`
  - Firestore collections used:
    - `referrals`
    - `referralMembers`
    - `organizations`
  - Actions completed:
    - ✅ Display referral source on welcome screen
    - ✅ Show organization relationship
    - ✅ Track referral journey
    - ✅ Store referral data in onboarding application

- [x] **Task 12.3: Unit Tests for Questionnaire Analysis** ✅
  - Files created:
    - `tests/unit/questionnaireTrends.test.js`
  - Actions completed:
    - ✅ Test trend calculation (improving/stable/worsening) - 8 tests
    - ✅ Test score interpretation (minimal/mild/moderate/severe) - 20+ tests
    - ✅ Test multiple questionnaire comparison
    - ✅ Test edge cases (single questionnaire, no history, null scores)

- [x] **Task 12.4: Integration Tests for Data Retrieval** ✅
  - Files created:
    - `tests/integration/questionnairesReferrals.test.js`
  - Actions completed:
    - ✅ Test questionnaire history retrieval from Firestore
    - ✅ Test referral data lookup
    - ✅ Test organization linking
    - ✅ Verify data displayed correctly in components

**Review Checklist:**
- [x] Questionnaire history displays correctly ✅
- [x] Trends calculated accurately ✅
- [x] Referral source shown on welcome ✅
- [x] Referral data tracked properly ✅
- [x] ✅ **Unit tests passing** for trend calculation (30+ tests) ✅
- [x] ✅ **Integration tests passing** for data retrieval (13 tests) ✅

---

### **PR #13: Support Chat System (P1 - Optional)**
**Branch:** `feature/support-chat`  
**Description:** Real-time support chat with Daybreak team

#### Tasks:
- [ ] **Task 13.1: Support Chat Component**
  - Files to create:
    - `src/components/support/SupportChat.jsx`
  - Firestore collections to use:
    - `supportChats`
  - Actions:
    - Create chat interface for support
    - Implement real-time messaging with Firestore
    - Add notification system
    - Create support queue

- [ ] **Task 13.2: Support Team Dashboard (Optional)**
  - Actions:
    - Create simple admin view for support team
    - Display active support chats
    - Add notification sounds

**Review Checklist:**
- [ ] Support chat functional
- [ ] Messages update in real-time
- [ ] Support team can respond

---

### **PR #14: UI Polish & Responsive Design**
**Branch:** `feature/ui-polish`  
**Description:** Refine UI, improve UX, ensure mobile responsiveness

#### Tasks:
- [ ] **Task 14.1: Responsive Design**
  - Files to update:
    - All component CSS files
    - `src/styles/global.css`
  - Actions:
    - Test on mobile, tablet, desktop
    - Fix layout issues
    - Adjust font sizes
    - Improve touch targets

- [ ] **Task 14.2: Accessibility Improvements**
  - Files to update:
    - All components
  - Actions:
    - Add ARIA labels
    - Ensure keyboard navigation
    - Test with screen readers
    - Check color contrast

- [ ] **Task 14.3: Loading States & Transitions**
  - Files to update:
    - All components with async operations
  - Actions:
    - Add loading spinners
    - Add skeleton screens
    - Add smooth transitions
    - Improve error messages

- [ ] **Task 14.4: Empty States**
  - Actions:
    - Add empty state designs
    - Add helpful messages
    - Add illustrations (optional)

**Review Checklist:**
- [ ] Mobile responsive
- [ ] Accessible (WCAG AA)
- [ ] Loading states polished
- [ ] Error handling improved

---

### **PR #15: Testing Suite**
**Branch:** `feature/testing`  
**Description:** Unit, integration, and E2E tests

#### Tasks:
- [ ] **Task 15.1: Consolidate & Enhance Existing Unit Tests**
  - Files to review/enhance:
    - `tests/unit/kinshipMapping.test.js` (from PR #3)
    - `tests/unit/validators.test.js`
    - `tests/unit/dateHelpers.test.js`
    - `tests/unit/AssessmentEngine.test.js` (from PR #6)
    - `tests/unit/CrisisDetection.test.js` (from PR #6)
    - `tests/unit/ClinicianMatcher.test.js` (from PR #9)
    - `tests/unit/InsuranceCalculator.test.js` (from PR #11)
  - Actions:
    - Review all unit tests from previous PRs
    - Enhance coverage for edge cases
    - Add missing tests for utility functions
    - Aim for 80%+ coverage overall

- [ ] **Task 15.2: Consolidate & Enhance Integration Tests**
  - Files to review/enhance:
    - `tests/integration/auth.test.js` (from PR #4)
    - `tests/integration/aiChat.test.js` (from PR #6)
    - `tests/integration/onboarding.test.js` (from PR #8)
    - `tests/integration/scheduling.test.js` (from PR #9)
    - `tests/integration/insuranceVerification.test.js` (from PR #10)
  - Actions:
    - Review all integration tests from previous PRs
    - Enhance test coverage
    - Test error scenarios
    - Test data flow across services

- [ ] **Task 15.3: Component Tests**
  - Files to create:
    - `tests/component/ChatInterface.test.jsx`
    - `tests/component/OnboardingWizard.test.jsx`
    - `tests/component/SchedulingCalendar.test.jsx`
  - Actions:
    - Test React component rendering
    - Test user interactions
    - Test component state changes
    - Use React Testing Library

- [ ] **Task 15.4: E2E Tests**
  - Files to create:
    - `tests/e2e/complete-onboarding-flow.test.js`
    - `tests/e2e/assessment-to-scheduling.test.js`
  - Actions:
    - Test complete user journey from assessment to scheduling
    - Use Cypress or Playwright
    - Test on multiple browsers
    - Test mobile responsive flow

- [ ] **Task 15.5: Test Coverage Report**
  - Actions:
    - Generate coverage report using Jest
    - Identify gaps in coverage
    - Add tests for uncovered code
    - Document coverage in README

**Review Checklist:**
- [ ] All unit tests passing (80%+ coverage)
- [ ] All integration tests passing
- [ ] Component tests passing
- [ ] E2E tests passing
- [ ] Coverage report generated
- [ ] No critical untested paths

---

### **PR #16: Firestore Security Rules & Indexes**
**Branch:** `feature/security-rules`  
**Description:** Finalize security rules and database indexes

#### Tasks:
- [ ] **Task 16.1: Security Rules**
  - Files to update:
    - `firestore.rules`
    - `storage.rules`
  - Actions:
    - Implement all security rules from PRD Section 9.5
    - Test with Firebase emulator
    - Deploy rules to production

- [ ] **Task 16.2: Firestore Indexes**
  - Files to update:
    - `firestore.indexes.json`
  - Actions:
    - Create indexes for common queries
    - Deploy indexes

- [ ] **Task 16.3: Security Rules Tests**
  - Files to create:
    - `tests/security/firestore.rules.test.js`
  - Actions:
    - Use Firebase Emulator for testing
    - Test user can only read/write own data
    - Test patient access restricted to guardians
    - Test clinician data readable by authenticated users
    - Test conversations deletable only by owner
    - Test admin role privileges
    - Test all security scenarios from PRD Section 9.5

**Review Checklist:**
- [ ] All security rules implemented
- [ ] Rules tested thoroughly
- [ ] Indexes created for performance
- [ ] ✅ **Security rules tests passing** using Firebase Emulator

---

### **PR #17: Documentation**
**Branch:** `feature/documentation`  
**Description:** Complete project documentation

#### Tasks:
- [ ] **Task 17.1: README Enhancement**
  - Files to update:
    - `README.md`
  - Actions:
    - Add detailed setup instructions
    - Document environment variables
    - Add usage examples
    - Add troubleshooting guide

- [ ] **Task 17.2: API Documentation**
  - Files to create:
    - `docs/API.md`
  - Actions:
    - Document all Firebase functions
    - Document service APIs
    - Add code examples

- [ ] **Task 17.3: Deployment Guide**
  - Files to create:
    - `docs/DEPLOYMENT.md`
  - Actions:
    - Document deployment process
    - Add Firebase hosting setup
    - Add CI/CD instructions

- [ ] **Task 17.4: Known Issues & Future Enhancements**
  - Files to create:
    - `docs/KNOWN_ISSUES.md`
    - `docs/FUTURE_ENHANCEMENTS.md`
  - Actions:
    - Document current limitations
    - List P2 features
    - Add improvement ideas

**Review Checklist:**
- [ ] README complete and clear
- [ ] API documented
- [ ] Deployment guide tested
- [ ] Known issues documented

---

### **PR #18: Deployment & CI/CD**
**Branch:** `feature/deployment`  
**Description:** Deploy to production and set up CI/CD pipeline

#### Tasks:
- [ ] **Task 18.1: Firebase Hosting Setup**
  - Files to update:
    - `firebase.json`
    - `.firebaserc`
  - Actions:
    - Configure hosting settings
    - Deploy to Firebase Hosting
    - Set up custom domain (optional)

- [ ] **Task 18.2: GitHub Actions CI/CD**
  - Files to create:
    - `.github/workflows/firebase-deploy.yml`
  - Actions:
    - Set up automated testing
    - Set up automated deployment
    - Add environment secrets

- [ ] **Task 18.3: Production Environment Variables**
  - Actions:
    - Set production API keys
    - Configure production Firebase project
    - Set up monitoring

- [ ] **Task 18.4: Smoke Tests for Production**
  - Files to create:
    - `tests/smoke/production.test.js`
  - Actions:
    - Test application loads successfully
    - Test authentication endpoints
    - Test Firestore connectivity
    - Test OpenAI API connectivity
    - Test critical user paths (sign-in, assessment start)
    - Run smoke tests after each deployment

**Review Checklist:**
- [ ] Application deployed successfully
- [ ] CI/CD pipeline working
- [ ] Production environment configured
- [ ] Monitoring set up
- [ ] ✅ **Smoke tests passing** in production

---

## 📊 Progress Tracking

**Total PRs:** 18  
**Completed:** 0  
**In Progress:** 0  
**Remaining:** 18  

### Recommended Order:
1. PR #1 (Setup) - **MUST DO FIRST**
2. PR #2 (Memory Bank) - **MUST DO SECOND**
3. PR #3 (Data Import) - **MUST DO THIRD**
4. PR #4 (Auth)
5. PR #5 (UI Foundation)
6. PR #6 (AI Chat Core)
7. PR #7 (RAG)
8. PR #8 (Onboarding)
9. PR #9 (Scheduling)
10. PR #10 (Insurance Verification)
11. PR #11 (OCR & Cost)
12. PR #12 (Questionnaires & Referrals)
13. PR #13 (Support Chat) - Optional
14. PR #14 (UI Polish)
15. PR #15 (Testing)
16. PR #16 (Security)
17. PR #17 (Documentation)
18. PR #18 (Deployment)

---

## 🔑 Key Dependencies

- **OpenAI API Key** (required for PR #6)
- **Pinecone API Key** (required for PR #7)
- **Google Cloud Vision API Key** (optional for PR #11 OCR)
- **Firebase Project** (required for PR #1)
- **16 CSV Test Files** (required for PR #3)

---

## 📈 Success Metrics

After all PRs are complete, verify:
- [ ] All P0 features functional
- [ ] At least 3 P1 features implemented
- [ ] All 16 CSV files imported successfully
- [ ] RAG system enhancing AI responses
- [ ] Insurance matching working correctly
- [ ] Scheduling system functional
- [ ] Security rules implemented
- [ ] Application deployed to production
- [ ] Documentation complete

---

**Last Updated:** 2025-11-10  
**Version:** 1.0  
**Total Estimated PRs:** 18

