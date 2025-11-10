# Production Requirements Document
## Daybreak Health Parent Onboarding AI - Implementation Plan

---

## 1. Project Overview

**Project Name:** Parent Onboarding AI  
**Organization:** Daybreak Health  
**Technology Stack:** React (Frontend), Firebase/Firestore (Backend), OpenAI API with RAG  
**Project Goal:** Build an AI-powered onboarding system that helps parents assess mental health needs for their children and complete the onboarding process efficiently.

**Timeline:** Project submission deadline as per course requirements

**Test Data Provided:** CSV files containing production-like data for development and testing
- Clinician availability, credentials, and contracts
- Insurance coverages and memberships
- Patient and guardian information
- Organization contracts and data
- Questionnaires and referrals
- Kinships (relationships between patients and guardians)

---

## 2. User Stories & Personas

### Primary User: Parents of Children Needing Mental Health Services

#### User Story 1: Mental Health Assessment
**As a parent,** I want to have a conversational assessment with an AI assistant about my child's mental health concerns, **so that** I can understand if Daybreak Health services are appropriate for my child's needs.

**Acceptance Criteria:**
- AI chatbot initiates a friendly, non-judgmental conversation
- Questions adapt based on parent responses
- Assessment covers key mental health indicators (mood, behavior, social interactions, academic performance)
- Provides clear feedback on service suitability
- Takes no more than 10-15 minutes to complete

#### User Story 2: Insurance Information Submission
**As a parent,** I want to easily submit my insurance information through a simple form or image upload, **so that** I can quickly move forward without confusion or frustration.

**Acceptance Criteria:**
- Option to manually enter insurance details OR upload insurance card image
- Image-to-text extraction for insurance card photos (P1 requirement)
- Clear validation of required fields
- Progress indicator showing completion status
- Ability to save and return later

#### User Story 3: Emotional Support & Reassurance
**As a parent,** I want to receive supportive messages and guidance throughout the process, **so that** I feel confident and less anxious about seeking help for my child.

**Acceptance Criteria:**
- Empathetic AI tone throughout conversations
- Reassuring messages at key transition points
- Clear explanation of next steps
- Option to connect with human support if needed
- Acknowledgment of the difficulty in seeking help

---

## 3. Key Features & Priority Breakdown

### P0 Features (Must-Have for Submission)

#### 3.1 AI-Powered Mental Health Screener with RAG Enhancement
**Description:** Conversational AI that guides parents through mental health assessment, enhanced with RAG for evidence-based accuracy

**Technical Implementation:**
- **Core AI System:**
  - Use OpenAI API (GPT-4) for natural language conversations
  - Structured conversation flow with branching logic
  - Store conversation history in Firestore
  - Generate assessment summary based on responses
  
- **RAG Enhancement Layer (adds robustness):**
  - Vector database (Pinecone or Firebase Vector Search) for mental health knowledge base (~50 documents)
  - Embeddings of validated mental health screening questions and criteria
  - Real-time retrieval of relevant context to augment AI responses
  - Context injection into prompts when relevant information is available
  - Falls back to core AI if retrieval fails or returns low-confidence matches

**Implementation Flow:**
1. User sends message → Store in conversation history
2. Generate embedding for user's message
3. Search vector database for relevant context (optional enhancement)
4. Combine retrieved context + conversation history + system prompt
5. Send to OpenAI API for response generation
6. Return response to user

**Components Required:**
- `ChatInterface.jsx` - Main chat UI component
- `AssessmentEngine.js` - Logic for question flow and conversation management
- `CrisisDetection.js` - Flag high-risk conversations for safety review
- `AlternativeResources.jsx` - Display alternative care options when Daybreak isn't best fit
- `RAGService.js` - (Week 2.5) Vector search and context retrieval
- `EmbeddingGenerator.js` - (Week 2.5) Generate embeddings for queries
- `KnowledgeBase` - Firestore/Pinecone collection with PHQ-A, GAD-7, PSC-17, SDQ documents
- `ConversationHistory` - Firestore collection for storing chats (90-day TTL)
- `AssessmentSummary.jsx` - Results display component with "not a diagnosis" disclaimer

**RAG Knowledge Base Content (~50 documents):**
- **PHQ-A (Adolescent PHQ-9)** - 10 documents: Questions, scoring criteria, severity levels
- **GAD-7** - 8 documents: Anxiety screening questions and interpretations
- **PSC-17 (Pediatric Symptom Checklist)** - 10 documents: Behavioral/emotional indicators
- **SDQ (Strengths and Difficulties Questionnaire)** - 7 documents: Supplemental assessment
- **Risk Assessment Protocols** - 10 documents: When to escalate, crisis indicators
- **"Seek Help Now" Criteria** - 5 documents: Emergency/crisis thresholds

**Note:** The system works fully without RAG. RAG is an enhancement layer that makes responses more accurate and grounded in validated content when available. **All screening tools used for guidance/triage language only—not diagnosis. AI will cite specific criteria in responses.**

#### 3.2 Streamlined Onboarding Form
**Description:** Multi-step form collecting demographic and basic clinical information

**Technical Implementation:**
- React multi-step form with state management
- Form validation using React Hook Form or Formik
- Progress indicator showing completion percentage
- Data persistence in Firestore

**Components Required:**
- `OnboardingWizard.jsx` - Main form container with progress tracking
- `WelcomeScreen.jsx` - Show referral source if applicable ("Referred by: School X")
- `DemographicInfo.jsx` - Child and parent demographics
- `KinshipSelector.jsx` - Relationship dropdown (from kinships.csv - note: uses numeric codes requiring mapping to labels like "mother", "father", "guardian")
- `ContactInfo.jsx` - Contact details
- `ConsentForm.jsx` - Display kinship relationship, data retention notice (90 days)
- `QuestionnaireHistorySummary.jsx` - Show past assessment scores if available
- `DataDeletionOption.jsx` - User-triggered data deletion interface
- `ProgressBar.jsx` - Visual progress indicator

#### 3.3 Enhanced Scheduling Interface with Real Clinician Data
**Description:** Smart scheduling system that matches patients with available clinicians based on real availability data

**Technical Implementation:**
- Display available appointment slots from clinician_availabilities.csv
- Filter clinicians by credentials and accepted insurance from clinician_credentialed_insurances.csv (junction table) and credentialed_insurances.csv (insurance provider data)
- Calendar component showing available times
- Smart matching based on:
  - Insurance coverage compatibility
  - Clinician specialties and credentials
  - Patient/guardian availability from patient_availabilities.csv
  - Referral preferences if applicable
- Confirmation and reminder system
- Integration with Firestore for appointment management

**Components Required:**
- `SchedulingCalendar.jsx` - Calendar view with clinician availability
- `ClinicianMatcher.js` - Logic to match patient needs with clinician credentials
- `TimeSlotSelector.jsx` - Available time slots filtered by insurance/specialty
- `ClinicianCard.jsx` - Display clinician info and credentials
- `AppointmentConfirmation.jsx` - Booking confirmation
- `Appointments` - Firestore collection linked to clinician and patient data

### P1 Features (Should-Have for Full Credit)

#### 3.4 Insurance Verification & Matching
**Description:** Verify insurance coverage and match with clinicians who accept the patient's insurance

**Technical Implementation:**
- Import insurance_coverages.csv and memberships.csv data
- Cross-reference patient insurance with clinician accepted insurances
- Display in-network vs out-of-network options
- Real-time coverage verification
- Link membership data to patient profiles

**Components Required:**
- `InsuranceVerification.jsx` - Insurance lookup and verification
- `InsuranceMatcher.js` - Match patient insurance with clinician acceptance
- `CoverageDisplay.jsx` - Show coverage details and benefits
- `NetworkStatus.jsx` - Display in-network/out-of-network status
#### 3.5 Insurance Card Image Upload & OCR
**Description:** Allow parents to photograph insurance card for automatic data extraction

**Technical Implementation:**
- Image upload component with preview
- OCR processing using Google Cloud Vision API or Tesseract.js
- Auto-populate insurance form fields from extracted text
- Match extracted data against insurance_coverages.csv for validation
- Manual override option for corrections

**Components Required:**
- `InsuranceCardUpload.jsx` - Image upload interface
- `OCRProcessor.js` - Text extraction logic
- `InsuranceForm.jsx` - Auto-populated form with edit capability
- `InsuranceValidator.js` - Validate against known insurance plans

**Technical Considerations:**
- OCR accuracy may vary (60-80% success rate)
- Need fallback to manual entry
- Privacy concerns with image storage
- Consider client-side OCR (Tesseract.js) vs cloud (Google Vision API)

#### 3.6 Cost Estimation Tool
**Description:** Provide upfront cost estimate based on insurance information from real coverage data

**Technical Implementation:**
- Calculate costs using insurance_coverages.csv data (copay, deductible, coverage %)
- Display estimated out-of-pocket costs per session
- Factor in membership type from memberships.csv
- Show comparison if multiple insurance options available
- Disclaimer about actual costs

**Components Required:**
- `CostEstimator.jsx` - Cost display component
- `InsuranceCalculator.js` - Pricing logic using real coverage data
- `CostBreakdown.jsx` - Detailed cost breakdown (copay, deductible, out-of-pocket max)
- `insuranceCoverages` - Firestore collection populated from CSV

#### 3.7 Questionnaire Integration
**Description:** Import and display pre-existing questionnaire data for patient assessment history

**Technical Implementation:**
- Load questionnaire data from questionnaires.csv
- Display previous assessment scores and interpretations
- Link questionnaire history to patient profile
- Use historical data to inform AI assessment

**Components Required:**
- `QuestionnaireHistory.jsx` - Display past questionnaires
- `QuestionnaireViewer.jsx` - View individual questionnaire details
- `AssessmentTrends.jsx` - Visualize assessment scores over time

#### 3.8 Referral Management
**Description:** Handle referral information and track referral sources

**Technical Implementation:**
- Import referral data from referrals.csv and referral_members.csv
- Track referral sources and relationships
- Link referrals to appropriate organization contracts
- Display referral context during onboarding

**Components Required:**
- `ReferralInfo.jsx` - Display referral source and details
- `ReferralTracker.js` - Track referral journey
- `OrganizationLink.jsx` - Show organization relationship if applicable
#### 3.9 Live Support Chat
**Description:** Real-time chat option to connect with Daybreak support team

**Technical Implementation:**
- Real-time messaging using Firestore real-time listeners
- Support queue management
- Notification system for support team

**Components Required:**
- `SupportChat.jsx` - Chat interface
- `SupportQueue` - Firestore collection
- `SupportNotifications.js` - Alert system

---

## 4. Technical Architecture

### 4.1 Frontend Stack
- **Framework:** React 18+
- **Routing:** React Router v6
- **State Management:** React Context API or Redux Toolkit
- **UI Components:** Material-UI or Tailwind CSS
- **Form Handling:** React Hook Form
- **API Calls:** Axios or Fetch API
- **Authentication:** Firebase Auth SDK (Email/Password + Google OAuth)

### 4.2 Backend Stack
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Auth
- **File Storage:** Firebase Storage (for insurance card images)
- **Cloud Functions:** Firebase Functions (for server-side logic)
- **AI Integration:** OpenAI API (GPT-4)
- **Vector Database:** Pinecone or Firebase Vector Search (for RAG)
- **Embeddings:** OpenAI text-embedding-ada-002

### 4.3 Database Schema (Firestore Collections)

**Note:** Schema designed to work with provided CSV test data

```
users/
  ├── {userId}/
      ├── profile (object)
      ├── role (string: 'parent' | 'clinician' | 'admin')
      ├── authProvider (string: 'email' | 'google.com')
      ├── guardianInfo (object) - from patients_and_guardians_anonymized.csv
      ├── dataRetentionConsent (boolean)
      ├── conversationHistoryExpiresAt (timestamp) - 90 days from creation
      └── createdAt (timestamp)

clinicians/
  ├── {clinicianId}/
      ├── credentials (object) - from clinicians_anonymized.csv
      ├── availability (array) - from clinician_availabilities.csv
      ├── contracts (array) - from clinicians_anonymized.csv
      ├── specialties (array)
      ├── acceptedInsurances (array) - from clinician_credentialed_insurances.csv junction table
      └── isActive (boolean)

organizations/
  ├── {organizationId}/
      ├── name (string) - from orgs.csv
      ├── contracts (array) - from org_contracts.csv (links to contracts.csv)
      ├── settings (object)
      └── createdAt (timestamp)

contracts/
  ├── {contractId}/
      ├── effectiveDate (timestamp) - from contracts.csv
      ├── endDate (timestamp)
      ├── services (array)
      ├── terms (object)
      ├── contractUrl (string)
      └── createdAt (timestamp)

onboardingApplications/
  ├── {applicationId}/
      ├── userId (string)
      ├── patientId (string) - links to patients
      ├── guardianId (string) - links to guardians
      ├── kinship (object) - from kinships.csv (stores numeric code + mapped label, e.g., {code: 1, label: "mother"})
      ├── status (string: 'started' | 'assessment_complete' | 'insurance_submitted' | 'scheduled' | 'complete')
      ├── assessmentData (object)
      ├── demographicData (object)
      ├── insuranceData (object) - from insurance_coverages.csv
      ├── membershipData (object) - from memberships.csv
      ├── appointmentData (object)
      ├── questionnaireResponses (array) - from questionnaires.csv
      ├── referralInfo (object) - from referrals.csv and referral_members.csv
      ├── createdAt (timestamp)
      └── updatedAt (timestamp)

patients/
  ├── {patientId}/
      ├── demographics (object) - from patients_and_guardians_anonymized.csv
      ├── guardians (array of guardianIds)
      ├── insuranceMemberships (array) - from memberships.csv
      ├── availability (object) - from patient_availabilities.csv
      ├── assignedClinician (string)
      └── createdAt (timestamp)

insuranceCoverages/
  ├── {coverageId}/
      ├── patientId (string)
      ├── planDetails (object) - from insurance_coverages.csv
      ├── membershipId (string) - from memberships.csv
      ├── coverageType (string)
      ├── copay (number)
      ├── deductible (number)
      ├── isActive (boolean)
      └── verificationStatus (string)

conversations/
  ├── {conversationId}/
      ├── applicationId (string)
      ├── messages (array)
      │   ├── role (string: 'user' | 'assistant')
      │   ├── content (string)
      │   ├── timestamp (timestamp)
      │   └── ragContext (array) - Retrieved knowledge base entries
      ├── assessmentSummary (object)
      ├── expiresAt (timestamp) - 90 days from creation (Firestore TTL)
      ├── userDeletionRequested (boolean)
      └── containsCrisisIndicators (boolean) - flag for safety review

knowledgeBase/
  ├── {documentId}/
      ├── content (string)
      ├── category (string: 'screening_question' | 'symptom_indicator' | 'risk_assessment')
      ├── embedding (array of numbers)
      ├── source (string)
      ├── ageGroup (string)
      └── metadata (object)

appointments/
  ├── {appointmentId}/
      ├── applicationId (string)
      ├── patientId (string)
      ├── clinicianId (string)
      ├── dateTime (timestamp)
      ├── availabilitySlotId (string) - from clinician_availabilities.csv
      ├── status (string: 'pending' | 'confirmed' | 'completed' | 'cancelled')
      └── notes (string)

questionnaires/
  ├── {questionnaireId}/
      ├── patientId (string)
      ├── type (string: 'PHQ-A' | 'GAD-7' | 'PSC-17' | 'SDQ') - from questionnaires.csv
      ├── responses (object)
      ├── score (number)
      ├── severity (string: 'minimal' | 'mild' | 'moderate' | 'severe')
      ├── trend (string: 'improving' | 'stable' | 'worsening')
      ├── completedAt (timestamp)
      └── interpretation (string)

referrals/
  ├── {referralId}/
      ├── patientId (string)
      ├── referralData (object) - from referrals.csv
      ├── source (string: 'school' | 'provider' | 'self' | 'other')
      ├── sourceName (string) - "School X" or "Provider Y"
      ├── members (array) - from referral_members.csv
      ├── displayInOnboarding (boolean) - whether to show "Referred by" message
      ├── status (string)
      └── createdAt (timestamp)

supportChats/
  ├── {chatId}/
      ├── userId (string)
      ├── messages (array)
      ├── status (string: 'active' | 'resolved')
      └── assignedTo (string)
```

### 4.4 API Integration Points

**OpenAI API:**
- **Chat Completions:** `https://api.openai.com/v1/chat/completions`
  - Model: GPT-4 or GPT-4-turbo
  - Use cases: Mental health screening conversations, emotional support responses
  - Context window: 8K-128K tokens depending on model
- **Embeddings:** `https://api.openai.com/v1/embeddings`
  - Model: text-embedding-ada-002
  - Use case: Generate embeddings for RAG queries and knowledge base indexing
  - Dimensions: 1536

**Vector Database (Pinecone or Firebase):**
- Store and query mental health knowledge embeddings
- Similarity search for context retrieval
- Real-time updates to knowledge base

**Firebase Cloud Functions:**
- `processInsuranceCard` - OCR processing
- `calculateCostEstimate` - Insurance cost calculation
- `sendAppointmentReminder` - Email/SMS notifications
- `generateEmbeddings` - Batch embedding generation for knowledge base
- `performRAGSearch` - Vector similarity search wrapper

---

## 5. User Flow Diagram

```
1. Landing Page
   ↓
2. Create Account / Sign In (Firebase Auth)
   ↓
3. Welcome & Introduction
   ↓
4. AI Mental Health Assessment (P0)
   - Conversational screening
   - Symptom evaluation
   - Suitability determination
   ↓
5. Assessment Results & Next Steps
   ↓
6. Demographic Information Form (P0)
   - Child information
   - Parent information
   - Contact details
   ↓
7. Insurance Information (P0/P1)
   - Manual entry OR
   - Insurance card upload with OCR (P1)
   - Cost estimation display (P1)
   ↓
8. Schedule Initial Consultation (P0)
   - View available slots
   - Select preferred time
   - Confirm appointment
   ↓
9. Confirmation & Next Steps
   - Summary of information
   - What to expect
   - Access to support chat (P1)
```

---

## 6. Technology Stack Rationale & Considerations

### 6.1 Why React?
**Pros:**
- Large ecosystem and community support
- Component reusability for forms and chat interfaces
- Excellent for interactive UIs
- Good documentation for course context

**Cons:**
- Learning curve if not familiar
- Requires careful state management

### 6.2 Why Firebase/Firestore?
**Pros:**
- Quick setup with minimal backend code
- Real-time capabilities for chat features
- Built-in authentication
- Generous free tier for project scope
- NoSQL flexibility for evolving data structures

**Cons:**
- Vendor lock-in
- Costs can scale unexpectedly with large usage
- Query limitations compared to SQL
- Not ideal for complex relational data

**Alternative Consideration:** If you prefer SQL structure, consider Supabase (PostgreSQL-based) instead

### 6.3 Why OpenAI API?
**Pros:**
- Industry-leading language model performance
- Excellent at empathetic, nuanced conversations
- Strong reasoning capabilities for assessment
- Well-documented API with good error handling
- Cost-effective for moderate usage
- Native support for embeddings (for RAG)

**Cons:**
- API costs scale with usage (monitor carefully)
- Latency considerations for real-time chat
- Need error handling for API failures
- Rate limiting on free tier

**RAG Enhancement Benefits:**
- **Accuracy:** Augments AI responses with validated mental health information
- **Consistency:** Reduces hallucinations by providing factual context when available
- **Transparency:** Can cite specific screening criteria from knowledge base
- **Updateability:** Easy to update knowledge base without retraining
- **Graceful Degradation:** System works without RAG, RAG just makes it better
- **Incremental Improvement:** Start with 50 documents, expand knowledge base over time

**Mitigation Strategies:**
- Implement conversation caching
- Set usage limits per user session
- Have fallback responses for API failures
- Use streaming responses for better UX
- Cache embeddings to reduce API calls

### 6.4 Potential Technical Pitfalls

#### Pitfall #1: OCR Accuracy Issues
**Problem:** Insurance card OCR may have 20-40% failure rate
**Solution:** 
- Always provide manual entry option
- Show extracted text for user verification
- Use confidence scores to auto-flag low-accuracy extractions

#### Pitfall #2: RAG System Complexity & Accuracy
**Problem:** RAG adds complexity; need to ensure it enhances rather than degrades experience
**Solution:** 
- **Build core AI chat first, add RAG as enhancement layer**
- Start with curated, high-quality 50-document knowledge base
- Use established frameworks (validated screening tools - to be determined)
- Test retrieval relevance before enabling in production
- Implement confidence thresholds - only inject context if highly relevant
- Have graceful fallback to non-RAG responses
- Make RAG optional/toggleable during development

**Monitoring:**
- Track which knowledge base entries are retrieved most often
- Log cases where no relevant context is found
- Compare RAG-enhanced vs non-RAG responses for quality
- Monitor assessment accuracy over time

#### Pitfall #3: HIPAA Compliance
**Problem:** Mental health data is highly sensitive
**Solution:**
- Use Firebase Security Rules strictly
- Enable encryption at rest
- Implement audit logging
- **Consider:** This may be out of scope for course project, but document awareness

#### Pitfall #4: Real-time Chat Scalability
**Problem:** Firestore real-time listeners can be expensive
**Solution:**
- Limit listener scope to active conversations
- Implement pagination for message history
- Use Cloud Functions for batch operations

#### Pitfall #5: State Management Complexity
**Problem:** Multi-step form with chat can have complex state
**Solution:**
- Use Context API for global state
- Persist form progress to Firestore
- Implement auto-save functionality

---

## 7. Out of Scope (Not Required for Submission)

### Explicitly Excluded Features:
1. **Therapist Dashboard** - Admin interface for providers
2. **Payment Processing** - Billing and payment collection
3. **Long-term Patient Tracking** - Post-care outcome monitoring
4. **Video Conferencing** - Integrated therapy session platform
5. **Mobile Native Apps** - iOS/Android applications (web-responsive only)
6. **Multi-language Support** - English only for initial version
7. **Advanced Analytics** - Usage metrics and reporting dashboards
8. **Automated Therapist Matching Algorithm** - Manual matching acceptable
9. **SMS/Email Notifications** - System notifications (nice-to-have, not critical)
10. **Insurance Verification API** - Real insurance eligibility checks

### Reasoning:
These features are either too complex for the project timeline, require external integrations beyond scope, or are business logic features not essential to demonstrating core technical competencies.

---

## 8. P2 Features (Nice-to-Have / Future Enhancements)

### 8.1 Emotional Support Content Library
- Curated articles and resources
- Coping strategies for parents
- Educational content about child mental health

### 8.2 Self-Help Resource Center
- Symptom guides
- When to seek help decision trees
- FAQ section

### 8.3 Progress Dashboard
- Visual representation of onboarding completion
- Next steps checklist
- Document upload status

---

## 9. CSV Data Import & Seeding Strategy

### 9.1 Data Files Provided
1. **clinician_availabilities.csv** - Clinician scheduling slots
2. **clinician_credentialed_insurances.csv** - Junction table linking clinicians to accepted insurances
3. **clinicians_anonymized.csv** - Clinician profile and contract details
4. **contracts.csv** - Contract terms, services, and effective dates
5. **credentialed_insurances.csv** - Insurance provider master data (Molina, United Healthcare, BCBS, etc.)
6. **documents.csv** - Legal documents (privacy policy, consent forms, terms of service)
7. **insurance_coverages.csv** - Insurance plan details and coverage information
8. **kinships.csv** - Relationship types using numeric codes (requires code-to-label mapping)
9. **memberships.csv** - Patient insurance memberships
10. **org_contracts.csv** - Junction table linking organizations to contracts
11. **orgs.csv** - Organization information
12. **patient_availabilities.csv** - Patient/guardian availability preferences
13. **patients_and_guardians_anonymized.csv** - Patient and guardian demographic data
14. **questionnaires.csv** - Assessment questionnaire data
15. **referral_members.csv** - Referral participant information
16. **referrals.csv** - Referral source and tracking data

### 9.2 Data Import Strategy

**Phase 1: Initial Database Seeding**
- Create Firebase Cloud Function or Node.js script to import CSV data
- Use Papa Parse library to parse CSV files
- Transform CSV data to match Firestore schema
- Import in correct order (handle dependencies):
  1. Contracts (contracts.csv) - contract terms and services
  2. Organizations (orgs.csv)
  3. Organization contracts (org_contracts.csv) - link orgs to contracts
  4. Clinicians base data (clinicians_anonymized.csv)
  5. Credentialed insurances (credentialed_insurances.csv) - insurance provider master data
  6. Clinician credentialed insurances (clinician_credentialed_insurances.csv) - junction table, merge with clinicians
  7. Clinician availability (clinician_availabilities.csv) - merge with clinicians
  8. Documents (documents.csv) - legal documents
  9. Insurance coverages (insurance_coverages.csv)
  10. Patients and guardians (patients_and_guardians_anonymized.csv)
  11. Kinships (kinships.csv) - link patients to guardians (note: uses numeric codes like 1, 2, 12, 2051)
  12. Memberships (memberships.csv) - link patients to insurance
  13. Questionnaires (questionnaires.csv) - with type validation (PHQ-A, GAD-7, PSC-17, SDQ)
  14. Referrals (referrals.csv)
  15. Referral members (referral_members.csv) - merge with referrals
  16. Patient availabilities (patient_availabilities.csv) - merge with patients

**Phase 2: Data Validation**
- Verify referential integrity (e.g., patient has valid guardian, insurance exists)
- Check for missing required fields
- Validate data types and formats
- Ensure questionnaire types match allowed values (PHQ-A, GAD-7, PSC-17, SDQ)
- Verify kinship relationships are valid
- Create data quality report

**Phase 3: Admin Re-import Support**
- Admin panel with CSV upload interface
- Support idempotent upsert with `merge: true`
- Log all import operations for audit
- Validation before overwriting existing data
- Rollback capability for failed imports

### 9.3 Data Seeding Script Structure

```javascript
// seedDatabase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import Papa from 'papaparse';
import fs from 'fs';

const CSV_FILES = [
  { file: 'contracts.csv', collection: 'contracts' },
  { file: 'orgs.csv', collection: 'organizations' },
  { file: 'org_contracts.csv', collection: 'orgContracts' },
  { file: 'clinicians_anonymized.csv', collection: 'clinicians' },
  { file: 'credentialed_insurances.csv', collection: 'credentialedInsurances' },
  { file: 'clinician_credentialed_insurances.csv', collection: 'clinicians', merge: true },
  { file: 'clinician_availabilities.csv', collection: 'clinicians', merge: true },
  { file: 'documents.csv', collection: 'documents' },
  { file: 'insurance_coverages.csv', collection: 'insuranceCoverages' },
  { file: 'patients_and_guardians_anonymized.csv', collection: 'patients' },
  { file: 'kinships.csv', collection: 'kinships' },
  { file: 'memberships.csv', collection: 'patients', merge: true },
  { file: 'questionnaires.csv', collection: 'questionnaires' },
  { file: 'referrals.csv', collection: 'referrals' },
  { file: 'referral_members.csv', collection: 'referrals', merge: true },
  { file: 'patient_availabilities.csv', collection: 'patients', merge: true },
];

async function importCSV(filepath, collectionName, shouldMerge = false) {
  const fileContent = fs.readFileSync(filepath, 'utf8');
  const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
  
  // Transform and import data
  for (const row of parsed.data) {
    const docId = row.id || generateId();
    const transformedData = transformRow(row, collectionName);
    
    if (shouldMerge) {
      await setDoc(doc(db, collectionName, docId), transformedData, { merge: true });
    } else {
      await setDoc(doc(db, collectionName, docId), transformedData);
    }
  }
}

function transformRow(row, collection) {
  // Transform CSV row to match Firestore schema
  // Handle data type conversions, nested objects, etc.
}
```

### 9.4 Data Relationships & Linking

**Key Relationships to Maintain:**
- Patient ↔ Guardian (via kinships.csv - numeric codes)
- Patient ↔ Insurance Coverage (via memberships.csv)
- Patient ↔ Questionnaires
- Patient ↔ Referrals
- Clinician ↔ Insurance Acceptance (via clinician_credentialed_insurances.csv junction table → credentialed_insurances.csv)
- Clinician ↔ Availability Slots (via clinician_availabilities.csv)
- Clinician ↔ Contracts (via clinicians_anonymized.csv)
- Organization ↔ Contracts (via org_contracts.csv → contracts.csv)
- Appointment ↔ Clinician Availability
- Appointment ↔ Patient Availability

### 9.5 Data Privacy & Security

**Anonymization Considerations:**
- CSV files are already anonymized (patients_and_guardians_anonymized.csv, clinicians_anonymized.csv)
- Ensure no PII in version control
- Use .gitignore for CSV files
- Store CSV files outside of public directories
- Implement row-level security in Firestore rules
- Note: kinships.csv uses numeric codes (1, 2, 12, 2051) for relationship types

**Firestore Security Rules Example:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Patients accessible only to their guardians or assigned clinician
    match /patients/{patientId} {
      allow read: if isAuthenticated() && (
        request.auth.uid in resource.data.guardians ||
        request.auth.uid == resource.data.assignedClinician ||
        isAdmin()
      );
      allow write: if isAuthenticated() && request.auth.uid in resource.data.guardians;
    }
    
    // Onboarding applications - owner access only
    match /onboardingApplications/{applicationId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    // Conversations - owner access with 90-day TTL enforcement
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() && 
                  get(/databases/$(database)/documents/onboardingApplications/$(resource.data.applicationId)).data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId) || isAdmin();
      allow delete: if isOwner(resource.data.userId) && resource.data.userDeletionRequested == true;
    }
    
    // Clinicians and availability - read by authenticated users (for matching)
    match /clinicians/{clinicianId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Insurance coverages - owner access only
    match /insuranceCoverages/{coverageId} {
      allow read, write: if isAuthenticated() && 
                          get(/databases/$(database)/documents/patients/$(resource.data.patientId)).data.guardians contains request.auth.uid;
    }
    
    // Appointments - accessible to patient guardian and assigned clinician
    match /appointments/{appointmentId} {
      allow read: if isAuthenticated() && (
        request.auth.uid == resource.data.clinicianId ||
        request.auth.uid in get(/databases/$(database)/documents/patients/$(resource.data.patientId)).data.guardians
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        request.auth.uid == resource.data.clinicianId ||
        request.auth.uid in get(/databases/$(database)/documents/patients/$(resource.data.patientId)).data.guardians
      );
    }
    
    // Questionnaires - guardian access only
    match /questionnaires/{questionnaireId} {
      allow read: if isAuthenticated() && 
                  request.auth.uid in get(/databases/$(database)/documents/patients/$(resource.data.patientId)).data.guardians;
    }
    
    // Referrals - guardian access
    match /referrals/{referralId} {
      allow read: if isAuthenticated() && 
                  request.auth.uid in get(/databases/$(database)/documents/patients/$(resource.data.patientId)).data.guardians;
    }
    
    // Knowledge base - read-only for all authenticated users
    match /knowledgeBase/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Organizations - read by authenticated (for display purposes)
    match /organizations/{orgId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

## 10. Success Metrics (For Project Evaluation)
### Functional Completeness:
- [ ] P0 features fully implemented and working with real CSV data
- [ ] At least 3 of 5 P1 features implemented (Insurance Verification, OCR, Cost Estimation, Questionnaires, Referrals)
- [ ] CSV data successfully imported into Firestore
- [ ] Clinician-patient matching works with real availability data
- [ ] Insurance verification works with real coverage data
- [ ] Clean, bug-free user experience

### Technical Quality:
- [ ] Proper error handling throughout application
- [ ] Responsive design (mobile and desktop)
- [ ] Secure Firebase rules implemented
- [ ] Code quality and organization
- [ ] Git commit history showing iterative development

### User Experience:
- [ ] Onboarding flow takes <15 minutes
- [ ] Clear navigation and progress indicators
- [ ] Empathetic AI conversation tone
- [ ] Accessibility considerations (keyboard navigation, contrast)

### Documentation:
- [ ] README with setup instructions
- [ ] API documentation
- [ ] Deployment guide
- [ ] Known issues and future enhancements

---

## 11. Implementation Timeline Recommendation

### Week 1: Foundation & Data Import
- Set up React project structure
- Configure Firebase project
- Implement authentication
- Create basic routing structure
- **Create CSV import scripts using Papa Parse**
- **Import all CSV data into Firestore (16 files total)**
- **Create kinship code-to-label mapping (numeric codes → readable strings)**
- **Verify data relationships and integrity**
- **Create data seeding documentation**

### Week 2: Core Features (P0) - Build Foundation First
- Build AI chat interface
- Integrate OpenAI API (without RAG initially)
- Implement conversation flow logic
- Create onboarding forms
- Test basic assessment flow

### Week 2.5: Add RAG Enhancement Layer
- **Set up vector database (Pinecone/Firebase Vector Search)**
- **Prepare initial 50-document knowledge base**
- **Generate embeddings for knowledge base**
- **Implement RAG retrieval system**
- **Test RAG-enhanced vs baseline conversations**

### Week 3: Advanced Features with Real Data (P1)
- **Insurance verification and matching using insurance_coverages.csv and credentialed_insurances.csv**
- **Clinician-patient matching based on credentials and insurance (via clinician_credentialed_insurances.csv junction table)**
- Insurance card upload and OCR
- **Cost estimation using real coverage data**
- **Display questionnaire history from questionnaires.csv**
- **Implement referral tracking from referrals.csv and referral_members.csv**
- Enhanced scheduling with availability matching from clinician_availabilities.csv and patient_availabilities.csv

### Week 4: Polish & Testing
- Responsive design refinement
- Error handling
- User testing
- Documentation
- Deployment

---

## 12. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CSV data quality issues | High | High | Validate and clean data during import, create data quality report, handle kinship code mapping |
| OpenAI API costs exceed budget | Medium | Medium | Implement usage caps, caching, use GPT-3.5 for less critical interactions |
| RAG retrieval returns irrelevant context | Medium | High | Curate knowledge base carefully, implement relevance scoring, test thoroughly |
| Complex data relationships cause bugs | High | Medium | Thorough testing, clear documentation of relationships (especially junction tables), unit tests for data queries |
| Clinician availability matching complexity | Medium | High | Start with simple matching, gradually add sophistication |
| Insurance verification accuracy | Medium | High | Cross-validate with multiple data sources (credentialed_insurances.csv + insurance_coverages.csv), allow manual override |
| Vector database setup complexity | Low | Medium | Use managed service (Pinecone), start with small knowledge base |
| OCR accuracy too low | High | Low | Prioritize manual entry, make OCR optional |
| Firebase security misconfiguration | Low | High | Review security rules thoroughly, especially for CSV-imported data |
| Scope creep | High | High | Stick to prioritized features list, CSV data gives clear scope (16 files) |

---

## 13. Management Decisions - All Questions Resolved ✅

### Authentication (Q1) - **DECISION MADE**
**Decision:** Email/password + Google OAuth via Firebase Auth at launch  
**Rationale:** Reduces friction while keeping scope light; fits existing "Create Account / Sign In (Firebase Auth)" flow  
**Implementation:** Use Firebase Auth with email provider + Google provider enabled

### Data Retention (Q2) - **DECISION MADE**
**Decision:** Retain AI conversation history for 90 days (rolling) for continuity and QA; allow user-triggered deletion; store only minimal metadata beyond 90 days (anonymized aggregates)  
**Rationale:** Balances UX with HIPAA-minded "Security" requirements in NFRs  
**Implementation:** 
- Firestore TTL on conversation documents (90 days)
- User-facing "Delete My Data" button
- Archive aggregated analytics only (no PII)

### AI Behavior (Q3) - **DECISION MADE**
**Decision:** Be supportive and safety-first, but tell the truth—if screener suggests Daybreak isn't a fit or higher-acuity care is needed, clearly recommend alternatives and when to seek immediate help  
**Rationale:** Aligns to goal of helping parents assess fit (not upsell); ethical duty of care  
**Implementation:** 
- Build "crisis detection" logic into assessment
- Include "seek immediate help" thresholds in knowledge base
- Provide clear alternative resource recommendations

### Insurance Coverage (Q4) - **DECISION MADE**
**Decision:** Support in-network plans present in insurance_coverages.csv and self-pay; no real-time eligibility API calls (out of scope)  
**Rationale:** Matches data we have and keeps verification APIs out of scope  
**Implementation:** 
- Use insurance_coverages.csv as source of truth
- Display "based on plan information provided" disclaimer
- Self-pay option always available

### Appointment Scheduling (Q5) - **DECISION MADE**
**Decision:** Use real clinician availability from CSV; allow admin-only manual override (for demos and edge cases), but default logic must honor availability + insurance acceptance + patient availability  
**Rationale:** Realistic matching; admin override for flexibility  
**Implementation:**
- Query clinician_availability.csv data
- Filter by insurance acceptance from clinician_credentials_insurance.csv
- Cross-reference patient_availabilities.csv
- Admin panel for manual slot creation

### Knowledge Base Source (Q6) - **DECISION MADE** ✅
**Decision:** Start with PHQ-A (PHQ-9 adolescent variant) and GAD-7 as core; add PSC-17; include SDQ as supplemental. Use them for guidance/triage language (not diagnosis) and cite criteria in RAG responses  
**Rationale:** Evidence-based, validated tools appropriate for pediatric/adolescent mental health  
**Implementation:**
- 50-document knowledge base breakdown:
  - PHQ-A questions and scoring (10 docs)
  - GAD-7 questions and scoring (8 docs)
  - PSC-17 indicators (10 docs)
  - SDQ supplemental (7 docs)
  - Risk assessment protocols (10 docs)
  - Crisis intervention thresholds (5 docs)
- Include disclaimers: "for guidance, not diagnosis"
- Cite specific criteria in AI responses

### Vector Database Choice (Q7) - **DECISION MADE**
**Decision:** Pinecone for MVP (managed, fastest to stable); revisit Firebase Vector Search later if we want tighter platform integration  
**Rationale:** Risk section recommends managed service first; proven reliability  
**Implementation:** 
- Sign up for Pinecone free tier
- Create index with dimension=1536 (OpenAI embeddings)
- Use in development and production

### RAG Scope (Q8) - **DECISION MADE** ✅
**Decision:** 50 documents for MVP (confirmed). Keep them tightly curated (screening questions, indicators, risk criteria, "seek help now" thresholds)  
**Implementation:** Complete (see Q6 breakdown)

### RAG Priority (Q9) - **DECISION MADE** ✅
**Decision:** Phase 2 enhancement after baseline chat works. Implement during "Week 2.5" (per plan), and ship core AI first  
**Rationale:** De-risks core functionality; RAG enhances but doesn't block  
**Implementation:**
- Week 2: Core AI chat working end-to-end
- Week 2.5: Add RAG layer
- Feature flag to toggle RAG on/off during testing

### CSV Data Updates (Q10) - **DECISION MADE**
**Decision:** Support admin re-import (idempotent upsert) after initial seed. Provide simple admin upload to re-run import with `merge: true` semantics  
**Rationale:** Seeding code already anticipates merges; needed for data corrections  
**Implementation:**
- Admin panel with CSV upload interface
- Re-run import script with merge flag
- Log import operations for audit

### Patient-Guardian Relationships (Q11) - **DECISION MADE**
**Decision:** Show the relationship (e.g., mother, father, legal guardian) during onboarding and store it on application record. Visible wherever consent/attestation appears  
**Rationale:** Important for legal consent and care coordination  
**Implementation:**
- Dropdown populated from kinships.csv (note: CSV uses numeric codes like 1, 2, 12, 2051)
- Create code-to-label mapping: {1: "mother", 2: "father", 12: "other", 2051: "guardian", etc.}
- Display human-readable labels on consent forms
- Store both code and label in onboardingApplications.kinship field
- Show readable label in appointment confirmations

### Questionnaire Display (Q12) - **DECISION MADE**
**Decision:** Yes—read-only summary if history exists: last score, date, and trend cue. Don't block onboarding if absent  
**Rationale:** Provides context without overwhelming; optional enhancement  
**Implementation:**
- Query questionnaires.csv for patient history
- Display card: "Previous Assessment: PHQ-A score 12 (moderate) on 10/15/2024"
- Show trend: ↑ improving, → stable, ↓ worsening
- Continue if no history

### Referral Tracking (Q13) - **DECISION MADE**
**Decision:** Yes—surface referral source unobtrusively ("Referred by: School X / Provider Y") and keep full details in record for analytics  
**Rationale:** Tracks conversion sources; may be contractually required  
**Implementation:**
- Display referral source on welcome screen: "Welcome! We see you were referred by [Source]"
- Store complete referral data from referrals.csv and referral_members.csv
- Include in analytics dashboards
- Don't make it prominent if user sensitive

---

## Implementation Guardrails 🚧

**Build Order (Critical):**
1. **P0 First:** Chat + Onboarding + Scheduling (Weeks 1-2)
2. **RAG Enhancement:** Add after core works (Week 2.5)
3. **P1 Features:** Insurance matching, cost estimation (Week 3)

**Security Requirements (Non-Negotiable):**
- HIPAA/PII top-of-mind per NFRs
- Firebase rules MUST enforce record-level access
- No conversation data in logs
- Encrypt insurance card images at rest
- 90-day data retention with user deletion rights

---

## 14. Recommended Next Steps

1. **Review and Approve This PRD** - Make any necessary adjustments
2. **Examine CSV Files** - Review structure and content of all provided CSV files
3. **Set Up Development Environment** - React, Firebase, OpenAI API credentials
4. **Create Project Repository** - Initialize with proper .gitignore (exclude CSV files)
5. **Build CSV Import Scripts** - Create data seeding utilities using Papa Parse
6. **Import and Validate Data** - Seed Firestore with CSV data and verify relationships
7. **Design Low-Fidelity Wireframes** - Sketch out key screens
8. **Implement P0 Features First** - Get core functionality working with real data
9. **Test with Real Data Scenarios** - Use CSV data to create realistic test cases
10. **Iterate Based on Testing** - Gather feedback and refine
11. **Add P1 Features** - Enhance with advanced capabilities (insurance matching, cost estimation)
12. **Document and Deploy** - Prepare for submission

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Author:** [Your Name]  
**Status:** Draft - Awaiting Review