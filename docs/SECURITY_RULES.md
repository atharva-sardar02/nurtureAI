# Firestore Security Rules & Indexes Documentation

## Overview

This document describes the Firestore security rules and indexes implemented for the NurtureAI application. All rules follow the principle of least privilege, ensuring users can only access data they are authorized to view or modify.

## Security Rules

### Helper Functions

```javascript
// Check if user is authenticated
function isAuthenticated() {
  return request.auth != null;
}

// Check if user is the owner of a resource
function isOwner(userId) {
  return request.auth.uid == userId;
}

// Check if user has admin role
function isAdmin() {
  return isAuthenticated() && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Collection Rules

#### Users (`/users/{userId}`)
- **Read/Write**: Users can only access their own user document
- **Rule**: `allow read, write: if isOwner(userId)`

#### Patients (`/patients/{patientId}`)
- **Read**: Guardians, assigned clinicians, and admins
- **Write**: Only guardians
- **Rule**: 
  - `allow read: if isAuthenticated() && (uid in guardians || uid == assignedClinician || isAdmin())`
  - `allow write: if isAuthenticated() && uid in guardians`

#### Onboarding Applications (`/onboardingApplications/{applicationId}`)
- **Read/Write**: Owner only
- **Rule**: `allow read, write: if isAuthenticated() && (resource.data.userId == auth.uid || request.resource.data.userId == auth.uid)`

#### Conversations (`/conversations/{conversationId}`)
- **Read**: Owner only
- **Create**: Authenticated users (must set their own userId)
- **Update**: Owner or admin
- **Delete**: Owner (if deletion requested) or admin
- **Rule**: 
  - `allow read: if isAuthenticated() && resource.data.userId == auth.uid`
  - `allow create: if isAuthenticated() && request.resource.data.userId == auth.uid`
  - `allow update: if isAuthenticated() && (resource.data.userId == auth.uid || isAdmin())`
  - `allow delete: if isAuthenticated() && (resource.data.userId == auth.uid && userDeletionRequested == true) || isAdmin()`

#### Clinicians (`/clinicians/{clinicianId}`)
- **Read**: All authenticated users (for matching)
- **Write**: Admins only
- **Rule**: 
  - `allow read: if isAuthenticated()`
  - `allow write: if isAdmin()`

#### Appointments (`/appointments/{appointmentId}`)
- **Read**: Clinician or patient guardian
- **Create**: Authenticated users
- **Update**: Clinician or patient guardian
- **Rule**: 
  - `allow read: if isAuthenticated() && (uid == clinicianId || uid in patient.guardians)`
  - `allow create: if isAuthenticated()`
  - `allow update: if isAuthenticated() && (uid == clinicianId || uid in patient.guardians)`

#### Questionnaires (`/questionnaires/{questionnaireId}`)
- **Read**: Patient guardians only
- **Rule**: `allow read: if isAuthenticated() && uid in patient.guardians`

#### Referrals (`/referrals/{referralId}`)
- **Read**: Patient guardians only
- **Rule**: `allow read: if isAuthenticated() && uid in patient.guardians`

#### Support Chats (`/supportChats/{chatId}`)
- **Create**: Users can create their own chats
- **Read**: Owner, assigned support, or active chats (for support team)
- **Update**: Owner, assigned support, or admin
- **Rule**: 
  - `allow create: if isAuthenticated() && request.resource.data.userId == auth.uid`
  - `allow read: if isAuthenticated() && (resource.data.userId == auth.uid || resource.data.status == 'active' || isAdmin())`
  - `allow update: if isAuthenticated() && (resource.data.userId == auth.uid || resource.data.assignedTo == auth.uid || isAdmin())`

#### Insurance Coverages (`/insuranceCoverages/{coverageId}`)
- **Read**: All authenticated users (for insurance verification)
- **Write**: Patient guardians only
- **Rule**: 
  - `allow read: if isAuthenticated()`
  - `allow write: if isAuthenticated() && uid in patient.guardians`

#### Memberships (`/memberships/{membershipId}`)
- **Read**: All authenticated users (for insurance pre-fill)
- **Write**: Patient guardians only
- **Rule**: 
  - `allow read: if isAuthenticated()`
  - `allow write: if isAuthenticated() && request.resource.data.userId == auth.uid`

#### Knowledge Base (`/knowledgeBase/{docId}`)
- **Read**: All authenticated users
- **Write**: Admins only
- **Rule**: 
  - `allow read: if isAuthenticated()`
  - `allow write: if isAdmin()`

#### Organizations (`/organizations/{orgId}`)
- **Read**: All authenticated users
- **Write**: Admins only
- **Rule**: 
  - `allow read: if isAuthenticated()`
  - `allow write: if isAdmin()`

#### Junction Tables
- **clinicianAvailabilities**: Read by authenticated, write by admin (can update `isBooked` by authenticated users)
- **clinicianCredentialedInsurances**: Read by authenticated, write by admin
- **credentialedInsurances**: Read by authenticated, write by admin
- **referralMembers**: Read by guardians
- **contracts**: Read by authenticated, write by admin
- **orgContracts**: Read by authenticated, write by admin

## Storage Rules

### Insurance Cards (`/insurance-cards/{userId}/{fileName}`)
- **Read/Write**: Owner only
- **Rule**: `allow read, write: if request.auth != null && request.auth.uid == userId`

### User Uploads (`/users/{userId}/{allPaths=**}`)
- **Read/Write**: Owner only
- **Rule**: `allow read, write: if request.auth != null && request.auth.uid == userId`

## Firestore Indexes

The following indexes have been created to optimize query performance:

### 1. Conversations
- **Fields**: `userId` (ASC), `createdAt` (DESC)
- **Purpose**: Query user conversations by date

### 2. Onboarding Applications
- **Fields**: `userId` (ASC), `createdAt` (DESC)
- **Purpose**: Query user applications by date

### 3. Clinician Credentialed Insurances
- **Fields**: `insuranceId` (ASC), `clinicianId` (ASC)
- **Purpose**: Match clinicians by insurance

### 4. Referrals
- **Fields**: `patientId` (ASC), `createdAt` (DESC)
- **Purpose**: Query patient referrals by date

### 5. Referral Members
- **Fields**: `referralId` (ASC)
- **Purpose**: Query referral members

### 6. Support Chats (User)
- **Fields**: `userId` (ASC), `createdAt` (DESC)
- **Purpose**: Query user support chats

### 7. Support Chats (Status)
- **Fields**: `status` (ASC), `createdAt` (DESC)
- **Purpose**: Query active support chats for support team

### 8. Clinician Availabilities (Clinician)
- **Fields**: `clinicianId` (ASC), `startTime` (ASC)
- **Purpose**: Query clinician availability slots

### 9. Clinician Availabilities (Booking)
- **Fields**: `isBooked` (ASC), `startTime` (ASC)
- **Purpose**: Query available slots for booking

### 10. Appointments (Patient)
- **Fields**: `patientId` (ASC), `startTime` (ASC)
- **Purpose**: Query patient appointments

### 11. Appointments (Clinician)
- **Fields**: `clinicianId` (ASC), `startTime` (ASC)
- **Purpose**: Query clinician appointments

### 12. Questionnaires
- **Fields**: `patientId` (ASC), `completedAt` (DESC)
- **Purpose**: Query patient questionnaire history

### 13. Insurance Coverages
- **Fields**: `patientId` (ASC), `createdAt` (DESC)
- **Purpose**: Query patient insurance coverages

## Security Principles

1. **Least Privilege**: Users can only access data they need
2. **Guardian Access**: Patient data is restricted to guardians only
3. **Admin Override**: Admins have read access to most collections for support purposes
4. **Data Ownership**: Users own their conversations and onboarding applications
5. **Junction Tables**: Read-only for authenticated users, write-only for admins

## Testing

Security rules are tested using `tests/security/firestore.rules.test.js`:
- 32 tests covering all access scenarios
- Tests verify rule structure and logic
- Full testing requires Firebase Emulator setup

Run tests:
```bash
npm run test:security
```

## Deployment

### Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Storage Rules
```bash
firebase deploy --only storage
```

### Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

## Notes

- Rules are versioned using `rules_version = '2'`
- All rules require authentication (except public read-only data)
- Admin role is checked via user document in Firestore
- Patient guardian relationships are stored in patient documents
- Support team can read active chats for queue management

---

**Last Updated**: 2025-01-27
**Rules Version**: 2
**Total Indexes**: 13

