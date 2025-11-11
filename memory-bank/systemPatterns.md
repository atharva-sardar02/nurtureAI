# System Patterns
## Architecture & Design Patterns

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   React App     │  (Frontend)
│   (Components)  │
└────────┬────────┘
         │
         ├──► Firebase Auth (Authentication)
         │
         ├──► Firestore (Database)
         │
         ├──► Firebase Storage (Images)
         │
         ├──► OpenAI API (AI Chat)
         │
         ├──► Pinecone (Vector DB for RAG)
         │
         └──► Firebase Functions (Server-side)
```

---

## Frontend Architecture

### Component Structure
- **Pages:** Top-level route components (Landing, Auth, Assessment, Onboarding, Scheduling) - To be created
- **Components:** 
  - **UI Components:** shadcn/ui components (button, input, card, label, select, progress, scroll-area, textarea) in `src/components/ui/`
  - **Feature Components:** AssessmentChat, OnboardingWizard, InsuranceVerification, ClinicianScheduler, Header in respective feature folders
- **Services:** API clients and business logic (Firebase, OpenAI, Pinecone) - To be created
- **Hooks:** Custom React hooks (use-mobile) in `src/hooks/`
- **Contexts:** Global state management (Auth, Onboarding, Theme) - To be created
- **Utils:** Helper functions (`cn` utility in `src/lib/utils.js`)

### State Management Pattern
- **React Context API** for global state (auth, onboarding progress)
- **Local State** (useState) for component-specific state
- **Custom Hooks** for reusable stateful logic
- **Firestore Real-time Listeners** for live data updates

### Routing Pattern
- **React Router v6** for client-side routing - To be set up
- **Protected Routes** wrapper for authentication guards - To be created
- **Route-based code splitting** for performance - To be implemented

---

## Backend Architecture

### Firebase Services

**Firestore Collections:**
- `users` - User profiles and authentication data
- `clinicians` - Clinician profiles, credentials, availability
- `patients` - Patient demographics and relationships
- `onboardingApplications` - Onboarding form data and status
- `conversations` - AI chat history (90-day TTL)
- `appointments` - Scheduled appointments
- `insuranceCoverages` - Insurance plan details
- `questionnaires` - Assessment questionnaire history
- `referrals` - Referral source tracking
- `knowledgeBase` - RAG knowledge base documents
- `contracts` - Organization contracts
- `organizations` - Organization data

**Firebase Functions:**
- `processInsuranceCard` - OCR processing
- `calculateCostEstimate` - Insurance cost calculation
- `sendAppointmentReminder` - Email/SMS notifications
- `generateEmbeddings` - Batch embedding generation
- `performRAGSearch` - Vector similarity search

### Data Flow Patterns

**CSV Import Pattern:**
1. Parse CSV using Papa Parse
2. Transform data to match Firestore schema
3. Handle merge operations for junction tables
4. Validate data integrity
5. Import in dependency order

**AI Chat Pattern:**
1. User sends message → Store in conversation history
2. (Optional) Generate embedding → Query Pinecone for context
3. Combine context + conversation history + system prompt
4. Send to OpenAI API for response
5. Store response in Firestore
6. Return to user

**Scheduling Pattern:**
1. Query clinicians by insurance acceptance
2. Filter by availability slots
3. Match with patient availability
4. Rank by fit score
5. Display results
6. Create appointment document on selection

---

## Design Patterns

### Service Layer Pattern
- **Separation of Concerns:** Business logic in services, not components
- **API Abstraction:** Services abstract Firebase/OpenAI/Pinecone details
- **Error Handling:** Centralized error handling in services

### Repository Pattern (Implicit)
- Firestore collections act as repositories
- Service layer queries collections
- Components never directly access Firestore

### Factory Pattern
- Component factories for dynamic component creation
- Service factories for API client creation

### Observer Pattern
- Firestore real-time listeners for live updates
- React Context for state propagation

### Strategy Pattern
- Different matching strategies for clinician-patient matching
- Different validation strategies for form fields

---

## Data Patterns

### Junction Tables
- `clinician_credentialed_insurances` - Links clinicians to accepted insurances
- `org_contracts` - Links organizations to contracts
- `kinships` - Links patients to guardians with relationship type

### Code Mapping Pattern
- Kinship codes (1, 2, 12, 2051) mapped to readable labels ("mother", "father", "guardian")
- Centralized mapping utility (`kinshipMapping.js`)

### TTL Pattern
- Conversations have 90-day TTL for automatic deletion
- User-triggered deletion also supported

---

## Security Patterns

### Authentication
- Firebase Auth with Email/Password + Google OAuth
- JWT tokens managed by Firebase
- Protected routes check authentication state

### Authorization
- Firestore Security Rules enforce row-level access
- Users can only access their own data
- Patients accessible only to guardians
- Clinicians readable by authenticated users

### Data Privacy
- 90-day conversation retention
- User-triggered data deletion
- Anonymized test data
- No PII in logs

---

## Error Handling Patterns

### Frontend Error Handling
- Error boundaries for React component crashes
- Try-catch blocks for async operations
- User-friendly error messages
- Fallback UI states

### Backend Error Handling
- Firebase Functions error handling
- API retry logic with exponential backoff
- Graceful degradation (RAG fallback to non-RAG)

### Validation Patterns
- Form validation using React Hook Form
- Server-side validation in Firebase Functions
- Data type validation during CSV import

---

## Testing Patterns

### Unit Tests
- Test individual functions and utilities
- Mock external dependencies (OpenAI, Pinecone, Firebase)
- Test edge cases and error scenarios

### Integration Tests
- Test service interactions (Firebase, OpenAI, Pinecone)
- Test data flow across services
- Use Firebase Emulator for Firestore tests

### Component Tests
- React Testing Library for component rendering
- Test user interactions and state changes
- Mock service dependencies

### E2E Tests
- Cypress or Playwright for complete user journeys
- Test critical paths (assessment → onboarding → scheduling)

---

## Performance Patterns

### Code Splitting
- Route-based code splitting
- Lazy loading for heavy components

### Caching
- Cache OpenAI embeddings
- Cache Firestore queries where appropriate
- Cache RAG retrieval results

### Optimization
- Pagination for large data sets
- Debouncing for search inputs
- Memoization for expensive calculations

---

## RAG System Pattern

### Knowledge Base Structure
- 50 curated documents organized by category:
  - PHQ-A (10 docs)
  - GAD-7 (8 docs)
  - PSC-17 (10 docs)
  - SDQ (7 docs)
  - Risk Assessment (15 docs)

### RAG Flow
1. User query → Generate embedding
2. Query Pinecone for similar documents
3. Filter by relevance threshold
4. Inject context into OpenAI prompt
5. Fallback to non-RAG if no results

### Enhancement Layer
- RAG is optional enhancement
- System works without RAG
- Feature flag to toggle RAG on/off

---

**Last Updated:** 2025-11-10  
**Status:** Active Development - PR #1 in progress (60% complete)

