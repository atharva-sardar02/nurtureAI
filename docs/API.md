# API Documentation

## Overview

This document describes all APIs available in the NurtureAI application, including Firebase Cloud Functions and service layer APIs.

---

## Firebase Cloud Functions

### `processInsuranceCard`

Processes insurance card images using Google Cloud Vision API to extract insurance information.

**Endpoint:** `https://<region>-<project-id>.cloudfunctions.net/processInsuranceCard`

**Method:** `onCall` (callable function)

**Authentication:** Required (Firebase Auth)

**Parameters:**
```typescript
{
  imageUrl: string;  // Firebase Storage URL of the insurance card image
}
```

**Returns:**
```typescript
{
  success: boolean;
  data?: {
    memberId: string | null;
    groupNumber: string | null;
    provider: string | null;
    planName: string | null;
    confidence: number;  // 0-1, confidence score for extraction
  };
  error?: string;
}
```

**Example:**
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const processInsuranceCard = httpsCallable(functions, 'processInsuranceCard');

const result = await processInsuranceCard({ 
  imageUrl: 'gs://bucket/insurance-cards/user123/card.jpg' 
});

if (result.data.success) {
  console.log('Extracted data:', result.data.data);
}
```

**Error Handling:**
- Returns `{ success: false, error: "..." }` on failure
- Common errors: invalid image format, API quota exceeded, authentication failure

---

## Service APIs

### Authentication Service (`src/services/firebase/auth.js`)

#### `signUp(email, password)`
Creates a new user account.

**Parameters:**
- `email` (string): User email address
- `password` (string): User password (min 6 characters)

**Returns:**
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

**Example:**
```javascript
import { signUp } from '@/services/firebase/auth';

const result = await signUp('user@example.com', 'password123');
if (result.success) {
  console.log('User created:', result.user);
}
```

#### `signIn(email, password)`
Signs in an existing user.

**Parameters:**
- `email` (string): User email address
- `password` (string): User password

**Returns:**
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

#### `signOut()`
Signs out the current user.

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

#### `resetPassword(email)`
Sends password reset email.

**Parameters:**
- `email` (string): User email address

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

---

### Firestore Service (`src/services/firebase/firestore.js`)

#### `createUserProfile(userId, userData, authProvider)`
Creates a user profile document in Firestore.

**Parameters:**
- `userId` (string): Firebase Auth user ID
- `userData` (object): User data (email, displayName, photoURL, etc.)
- `authProvider` (string): 'email' or 'google.com'

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

#### `getUserProfile(userId)`
Retrieves user profile from Firestore.

**Parameters:**
- `userId` (string): Firebase Auth user ID

**Returns:**
```typescript
{
  success: boolean;
  data?: UserProfile;
  error?: string;
}
```

#### `saveConversation(userId, messages, assessmentData, onboardingApplicationId)`
Saves AI chat conversation to Firestore.

**Parameters:**
- `userId` (string): User ID
- `messages` (Array): Array of message objects
- `assessmentData` (object, optional): Assessment summary data
- `onboardingApplicationId` (string, optional): Related onboarding application ID

**Returns:**
```typescript
{
  success: boolean;
  conversationId?: string;
  error?: string;
}
```

#### `getUserConversations(userId, limitCount)`
Retrieves user's conversation history.

**Parameters:**
- `userId` (string): User ID
- `limitCount` (number, default: 10): Maximum number of conversations

**Returns:**
```typescript
{
  success: boolean;
  conversations?: Array<Conversation>;
  error?: string;
}
```

#### `createOnboardingApplication(userId, applicationData)`
Creates a new onboarding application.

**Parameters:**
- `userId` (string): User ID
- `applicationData` (object): Application form data

**Returns:**
```typescript
{
  success: boolean;
  applicationId?: string;
  error?: string;
}
```

#### `getOnboardingApplication(userId)`
Retrieves user's onboarding application.

**Parameters:**
- `userId` (string): User ID

**Returns:**
```typescript
{
  success: boolean;
  data?: OnboardingApplication;
  error?: string;
}
```

---

### OpenAI Service (`src/services/ai/openai.js`)

#### `sendMessage(messages, options)`
Sends messages to OpenAI API for AI chat responses.

**Parameters:**
- `messages` (Array): Array of message objects with `role` and `content`
- `options` (object, optional): 
  - `stream` (boolean): Enable streaming responses
  - `temperature` (number): Response creativity (0-2)
  - `maxTokens` (number): Maximum response length

**Returns:**
```typescript
{
  success: boolean;
  response?: string;
  error?: string;
}
```

**Example:**
```javascript
import { sendMessage } from '@/services/ai/openai';

const result = await sendMessage([
  { role: 'system', content: 'You are a mental health assistant.' },
  { role: 'user', content: 'How can I help my child with anxiety?' }
]);

if (result.success) {
  console.log('AI Response:', result.response);
}
```

---

### Assessment Engine (`src/services/ai/AssessmentEngine.js`)

#### `new AssessmentEngine(userId)`
Creates a new assessment engine instance.

**Parameters:**
- `userId` (string): User ID

**Methods:**

##### `async startAssessment()`
Starts a new assessment conversation.

**Returns:**
```typescript
{
  success: boolean;
  initialMessage?: string;
  error?: string;
}
```

##### `async processMessage(userMessage)`
Processes a user message and returns AI response.

**Parameters:**
- `userMessage` (string): User's message

**Returns:**
```typescript
{
  success: boolean;
  response?: string;
  assessmentComplete?: boolean;
  crisisDetected?: boolean;
  error?: string;
}
```

##### `async getAssessmentSummary()`
Gets the assessment summary after completion.

**Returns:**
```typescript
{
  success: boolean;
  summary?: {
    severity: string;
    recommendations: Array<string>;
    nextSteps: Array<string>;
  };
  error?: string;
}
```

---

### Scheduling Services

#### `matchCliniciansByInsurance(insuranceProvider)` (`src/services/scheduling/ClinicianMatcher.js`)
Matches clinicians based on patient insurance.

**Parameters:**
- `insuranceProvider` (string): Insurance provider name

**Returns:**
```typescript
Promise<Array<Clinician>>
```

**Example:**
```javascript
import { matchCliniciansByInsurance } from '@/services/scheduling/ClinicianMatcher';

const clinicians = await matchCliniciansByInsurance('Aetna');
console.log('Matching clinicians:', clinicians);
```

#### `getClinicianAvailability(clinicianId, startDate, endDate)` (`src/services/scheduling/ClinicianMatcher.js`)
Gets available time slots for a clinician.

**Parameters:**
- `clinicianId` (string): Clinician ID
- `startDate` (Date): Start date for availability search
- `endDate` (Date): End date for availability search

**Returns:**
```typescript
Promise<Array<TimeSlot>>
```

#### `createAppointment(appointmentData)` (`src/services/scheduling/AppointmentService.js`)
Creates a new appointment.

**Parameters:**
```typescript
{
  patientId: string;
  clinicianId: string;
  availabilityId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  appointmentId?: string;
  error?: string;
}
```

#### `getAppointment(appointmentId)` (`src/services/scheduling/AppointmentService.js`)
Retrieves appointment details.

**Parameters:**
- `appointmentId` (string): Appointment ID

**Returns:**
```typescript
{
  success: boolean;
  appointment?: Appointment;
  error?: string;
}
```

---

### Insurance Services

#### `lookupInsurancePlan(providerName, memberId, groupNumber)` (`src/services/insurance/InsuranceValidator.js`)
Looks up insurance plan details.

**Parameters:**
- `providerName` (string): Insurance provider name
- `memberId` (string): Member ID
- `groupNumber` (string, optional): Group number

**Returns:**
```typescript
{
  success: boolean;
  data?: InsurancePlan;
  error?: string;
}
```

#### `checkCoverageStatus(insuranceData)` (`src/services/insurance/InsuranceValidator.js`)
Checks if insurance coverage is active.

**Parameters:**
- `insuranceData` (object): Insurance plan data

**Returns:**
```typescript
{
  active: boolean;
  status: 'active' | 'inactive' | 'pending';
  message?: string;
}
```

#### `matchProviderNameToId(providerName)` (`src/services/insurance/InsuranceMatcher.js`)
Matches OCR-extracted provider name to Firestore insurance ID.

**Parameters:**
- `providerName` (string): Provider name from OCR

**Returns:**
```typescript
Promise<string | null>  // Insurance ID or null if not found
```

#### `calculateCostEstimate(insuranceCoverage, sessionCost)` (`src/services/insurance/InsuranceCalculator.js`)
Calculates estimated out-of-pocket cost.

**Parameters:**
- `insuranceCoverage` (object): Insurance coverage data
- `sessionCost` (number, default: 150): Base session cost

**Returns:**
```typescript
{
  sessionCost: number;
  copay: number;
  deductibleRemaining: number;
  coveragePercentage: number;
  estimatedOutOfPocket: number;
  breakdown: {
    copay: number;
    deductible: number;
    coinsurance: number;
  };
}
```

#### `processInsuranceCardOCR(imageUrl)` (`src/services/insurance/OCRProcessor.js`)
Processes insurance card image via Firebase Function.

**Parameters:**
- `imageUrl` (string): Firebase Storage URL

**Returns:**
```typescript
{
  success: boolean;
  data?: {
    memberId: string | null;
    groupNumber: string | null;
    provider: string | null;
    planName: string | null;
    confidence: number;
  };
  error?: string;
}
```

#### `getPatientMemberships(patientId)` (`src/services/insurance/MembershipService.js`)
Retrieves all memberships for a patient from the `memberships` collection.

**Parameters:**
- `patientId` (string): Patient ID (used to query `userId` field in memberships)

**Returns:**
```typescript
{
  success: boolean;
  memberships?: Array<Membership>;
  error?: string;
}
```

**Example:**
```javascript
import { getPatientMemberships } from '@/services/insurance/MembershipService';

const result = await getPatientMemberships('patient123');
if (result.success) {
  console.log('Memberships:', result.memberships);
}
```

#### `getMembershipCoverage(membershipId)` (`src/services/insurance/MembershipService.js`)
Retrieves the linked insurance coverage for a membership.

**Parameters:**
- `membershipId` (string): Membership document ID

**Returns:**
```typescript
{
  success: boolean;
  coverage?: InsuranceCoverage;
  error?: string;
}
```

**Example:**
```javascript
import { getMembershipCoverage } from '@/services/insurance/MembershipService';

const result = await getMembershipCoverage('membership123');
if (result.success) {
  console.log('Coverage:', result.coverage);
}
```

#### `extractInsuranceDataFromMembership(membership, coverage)` (`src/services/insurance/MembershipService.js`)
Extracts and formats insurance data from membership and coverage documents for form pre-filling.

**Parameters:**
- `membership` (object): Membership document data
- `coverage` (object): Insurance coverage document data

**Returns:**
```typescript
Promise<{
  provider: string;           // Provider ID or name
  memberId: string;           // Member ID
  groupNumber: string | null; // Group number (if available)
  insuranceProviderName: string; // Original provider name
} | null>
```

**Example:**
```javascript
import { extractInsuranceDataFromMembership } from '@/services/insurance/MembershipService';

const insuranceData = await extractInsuranceDataFromMembership(membership, coverage);
if (insuranceData) {
  console.log('Extracted data:', insuranceData);
}
```

#### `getInsuranceDataFromMemberships(patientId)` (`src/services/insurance/MembershipService.js`)
Orchestrates the retrieval and extraction of insurance data from a patient's memberships for pre-filling the insurance form during onboarding.

**Parameters:**
- `patientId` (string): Patient ID

**Returns:**
```typescript
{
  success: boolean;
  insuranceData?: {
    provider: string;
    memberId: string;
    groupNumber: string | null;
    insuranceProviderName: string;
  } | null;
  error?: string;
}
```

**Example:**
```javascript
import { getInsuranceDataFromMemberships } from '@/services/insurance/MembershipService';

const result = await getInsuranceDataFromMemberships('patient123');
if (result.success && result.insuranceData) {
  // Pre-fill insurance form with result.insuranceData
  console.log('Pre-fill data:', result.insuranceData);
}
```

**Note:** This function gracefully handles errors and returns `{ success: true, insuranceData: null }` if no memberships are found or if extraction fails, allowing users to enter insurance information manually.

---

### Support Chat Service (`src/services/support/SupportChatService.js`)

#### `createSupportChat(userId, initialMessage)`
Creates a new support chat.

**Parameters:**
- `userId` (string): User ID
- `initialMessage` (string): Initial message from user

**Returns:**
```typescript
{
  success: boolean;
  chatId?: string;
  error?: string;
}
```

#### `addMessageToChat(chatId, role, content)`
Adds a message to a support chat.

**Parameters:**
- `chatId` (string): Chat ID
- `role` (string): 'user' or 'support'
- `content` (string): Message content

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

#### `getChatMessages(chatId)`
Retrieves all messages for a chat.

**Parameters:**
- `chatId` (string): Chat ID

**Returns:**
```typescript
{
  success: boolean;
  messages?: Array<Message>;
  error?: string;
}
```

#### `getUserActiveChats(userId)`
Gets all active support chats for a user.

**Parameters:**
- `userId` (string): User ID

**Returns:**
```typescript
{
  success: boolean;
  chats?: Array<SupportChat>;
  error?: string;
}
```

---

### Referral Service (`src/services/referrals/ReferralTracker.js`)

#### `getPatientReferral(patientId)`
Gets referral information for a patient.

**Parameters:**
- `patientId` (string): Patient ID

**Returns:**
```typescript
{
  success: boolean;
  referral?: Referral;
  error?: string;
}
```

#### `getOrganization(organizationId)`
Gets organization details.

**Parameters:**
- `organizationId` (string): Organization ID

**Returns:**
```typescript
{
  success: boolean;
  organization?: Organization;
  error?: string;
}
```

---

## React Hooks

### `useChat()` (`src/hooks/useChat.js`)

Manages chat state and AI conversation.

**Returns:**
```typescript
{
  messages: Array<Message>;
  isLoading: boolean;
  error: string | null;
  crisisDetected: boolean;
  sendMessage: (message: string, options?: object) => Promise<void>;
  getAssessmentSummary: () => Promise<AssessmentSummary>;
}
```

**Example:**
```javascript
import { useChat } from '@/hooks/useChat';

function ChatComponent() {
  const { messages, isLoading, sendMessage } = useChat();
  
  const handleSend = async () => {
    await sendMessage('Hello, I need help');
  };
  
  return (
    <div>
      {messages.map(msg => <div key={msg.id}>{msg.content}</div>)}
      <button onClick={handleSend} disabled={isLoading}>
        Send
      </button>
    </div>
  );
}
```

### `useScheduling()` (`src/hooks/useScheduling.js`)

Manages scheduling state and operations.

**Returns:**
```typescript
{
  clinicians: Array<Clinician>;
  selectedClinician: Clinician | null;
  selectedSlot: TimeSlot | null;
  loading: boolean;
  error: string | null;
  searchClinicians: (startDate: Date, endDate: Date) => Promise<void>;
  selectClinician: (clinicianId: string) => void;
  selectSlot: (slot: TimeSlot) => void;
  bookAppointment: () => Promise<{ success: boolean; appointmentId?: string }>;
}
```

### `useSupportChat(chatId)` (`src/hooks/useSupportChat.js`)

Manages support chat state and real-time updates.

**Parameters:**
- `chatId` (string, optional): Existing chat ID

**Returns:**
```typescript
{
  chat: SupportChat | null;
  messages: Array<Message>;
  loading: boolean;
  error: string | null;
  sending: boolean;
  sendMessage: (content: string) => Promise<void>;
  loadChat: (initialMessage?: string) => Promise<void>;
}
```

---

## Data Models

### User Profile
```typescript
{
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'parent' | 'admin' | 'clinician';
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  onboardingCompleted: boolean;
}
```

### Conversation
```typescript
{
  id: string;
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
  }>;
  assessmentData?: {
    severity: string;
    recommendations: Array<string>;
  };
  createdAt: Timestamp;
  expiresAt: Timestamp;  // 90 days from creation
}
```

### Onboarding Application
```typescript
{
  id: string;
  userId: string;
  patientId?: string;
  status: 'started' | 'assessment_complete' | 'insurance_submitted' | 'scheduled' | 'complete';
  formData: {
    childName: string;
    childDateOfBirth: Date;
    parentName: string;
    // ... other form fields
  };
  progress: number;  // 0-100
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Appointment
```typescript
{
  id: string;
  patientId: string;
  clinicianId: string;
  availabilityId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Timestamp;
}
```

---

## Error Handling

All service functions return a consistent error format:

```typescript
{
  success: boolean;
  error?: string;
  // ... other fields
}
```

**Best Practice:**
```javascript
const result = await someServiceFunction();
if (!result.success) {
  console.error('Error:', result.error);
  // Handle error in UI
  return;
}
// Use result.data
```

---

## Rate Limiting

- **OpenAI API**: Monitor usage in OpenAI dashboard
- **Firebase**: Free tier limits apply
- **Google Cloud Vision**: Pay-per-use, monitor in Cloud Console

---

## Authentication

All API calls require Firebase Authentication. Use `useAuth()` hook to get current user:

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  // User is authenticated, make API calls
}
```

---

**Last Updated:** 2025-01-27  
**API Version:** 1.0.0


