# Technical Context
## Technology Stack & Development Setup

---

## Technology Stack

### Frontend
- **Framework:** React 18+
- **Routing:** React Router v6
- **State Management:** React Context API
- **UI Components:** Material-UI or Tailwind CSS
- **Form Handling:** React Hook Form
- **API Calls:** Axios or Fetch API
- **Testing:** Jest, React Testing Library, Cypress/Playwright

### Backend
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Auth (Email/Password + Google OAuth)
- **File Storage:** Firebase Storage (for insurance card images)
- **Cloud Functions:** Firebase Functions (Node.js)
- **Security Rules:** Firestore Security Rules

### AI & External Services
- **AI Chat:** OpenAI API (GPT-4 or GPT-4-turbo)
- **Embeddings:** OpenAI text-embedding-ada-002
- **Vector Database:** Pinecone (for RAG)
- **OCR:** Google Cloud Vision API or Tesseract.js

### Data Processing
- **CSV Parsing:** Papa Parse
- **Data Validation:** Custom validation utilities

---

## Development Environment

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase CLI
- Git
- Code editor (VS Code recommended)

### Environment Variables
```env
# Firebase
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

# OpenAI
REACT_APP_OPENAI_API_KEY=

# Pinecone
REACT_APP_PINECONE_API_KEY=
REACT_APP_PINECONE_ENVIRONMENT=
REACT_APP_PINECONE_INDEX_NAME=

# Google Cloud Vision (Optional for OCR)
REACT_APP_GOOGLE_CLOUD_VISION_API_KEY=
```

### Project Structure
```
nurtureAI/
├── src/              # React application source
├── functions/        # Firebase Cloud Functions
├── scripts/          # Data import and utility scripts
├── tests/            # Test files (unit, integration, e2e)
├── knowledge-base/   # RAG knowledge base documents
└── memory-bank/      # Project documentation
```

---

## Firebase Configuration

### Firestore Collections
- 11+ collections for different data types
- Compound indexes for complex queries
- Security rules for row-level access control

### Firebase Functions
- Node.js runtime
- Deployed separately from frontend
- Environment variables for API keys

### Firebase Storage
- Insurance card image uploads
- Secure access rules
- Image processing for OCR

---

## API Integrations

### OpenAI API
- **Endpoint:** `https://api.openai.com/v1/chat/completions`
- **Model:** GPT-4 or GPT-4-turbo
- **Use Cases:** Mental health screening conversations, emotional support
- **Rate Limiting:** Monitor usage, implement caching
- **Error Handling:** Retry logic, fallback responses

### Pinecone API
- **Use Case:** Vector similarity search for RAG
- **Index:** Dimension 1536 (OpenAI embeddings)
- **Free Tier:** Available for development
- **Error Handling:** Graceful fallback to non-RAG

### Google Cloud Vision API (Optional)
- **Use Case:** OCR for insurance card images
- **Alternative:** Tesseract.js (client-side)
- **Accuracy:** 60-80% success rate, manual fallback required

---

## Data Management

### CSV Import Process
1. Parse CSV files using Papa Parse
2. Transform data to match Firestore schema
3. Handle merge operations for junction tables
4. Validate data integrity
5. Import in dependency order (16 files total)

### Data Files (16 total)
- `clinician_availabilities.csv`
- `clinician_credentialed_insurances.csv`
- `clinicians_anonymized.csv`
- `contracts.csv`
- `credentialed_insurances.csv`
- `documents.csv`
- `insurance_coverages.csv`
- `kinships.csv` (numeric codes)
- `memberships.csv`
- `org_contracts.csv`
- `orgs.csv`
- `patient_availabilities.csv`
- `patients_and_guardians_anonymized.csv`
- `questionnaires.csv`
- `referral_members.csv`
- `referrals.csv`

### Data Relationships
- Patient ↔ Guardian (via kinships.csv)
- Patient ↔ Insurance (via memberships.csv)
- Clinician ↔ Insurance (via junction table)
- Organization ↔ Contracts (via org_contracts.csv)

---

## Development Workflow

### Git Workflow
- **Branch Strategy:** Feature branches per PR
- **PR Process:** 18 PRs organized by feature
- **Testing:** Tests required before PR merge
- **Code Review:** Review checklist for each PR

### Testing Strategy
- **Unit Tests:** Individual functions and utilities
- **Integration Tests:** Service interactions
- **Component Tests:** React component rendering
- **E2E Tests:** Complete user journeys
- **Coverage Target:** 80%+

### Build & Deploy
- **Development:** `npm start` (React dev server)
- **Build:** `npm run build` (production build)
- **Deploy:** Firebase Hosting
- **CI/CD:** GitHub Actions (optional)

---

## Technical Constraints

### Performance
- **API Costs:** Monitor OpenAI and Pinecone usage
- **Latency:** Streaming responses for better UX
- **Caching:** Cache embeddings and common queries

### Security
- **HIPAA Compliance:** Data privacy and security rules
- **API Keys:** Never commit to version control
- **Firestore Rules:** Strict row-level access control

### Scalability
- **Firestore Limits:** Monitor read/write operations
- **Real-time Listeners:** Limit scope to active conversations
- **Pagination:** Implement for large data sets

---

## Dependencies

### Core Dependencies
```json
{
  "react": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "firebase": "^10.0.0",
  "openai": "^4.0.0",
  "@pinecone-database/pinecone": "^1.0.0"
}
```

### Development Dependencies
```json
{
  "jest": "^29.0.0",
  "react-testing-library": "^14.0.0",
  "cypress": "^13.0.0",
  "papaparse": "^5.4.0"
}
```

---

## Known Technical Challenges

1. **OCR Accuracy:** 60-80% success rate, manual fallback required
2. **RAG Complexity:** Need careful curation of knowledge base
3. **Data Relationships:** Complex junction tables require careful import order
4. **API Costs:** Monitor OpenAI and Pinecone usage carefully
5. **State Management:** Multi-step form with chat can be complex

---

## Development Tools

### Recommended Tools
- **VS Code** with React extensions
- **Firebase Emulator Suite** for local testing
- **React DevTools** for debugging
- **Jest** for unit/integration tests
- **Cypress/Playwright** for E2E tests

### Code Quality
- **ESLint** for linting
- **Prettier** for code formatting
- **TypeScript** (optional, not in current scope)

---

**Last Updated:** 2025-11-10  
**Status:** Active Development

