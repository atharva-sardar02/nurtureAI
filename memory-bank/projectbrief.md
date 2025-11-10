# Project Brief
## Daybreak Health Parent Onboarding AI

---

## Project Overview

**Project Name:** NurtureAI - Parent Onboarding System  
**Organization:** Daybreak Health  
**Purpose:** Build an AI-powered onboarding system that helps parents assess mental health needs for their children and complete the onboarding process efficiently.

---

## Core Goals

1. **AI-Powered Mental Health Assessment**
   - Conversational AI screening using OpenAI GPT-4
   - RAG-enhanced responses using validated mental health tools (PHQ-A, GAD-7, PSC-17, SDQ)
   - Crisis detection and alternative resource recommendations
   - 10-15 minute assessment experience

2. **Streamlined Onboarding**
   - Multi-step form collecting demographics and clinical information
   - Insurance information submission (manual or OCR)
   - Smart scheduling with clinician-patient matching
   - Progress tracking and data persistence

3. **Data-Driven Matching**
   - Use real CSV test data (16 files) for clinician availability, insurance, and patient information
   - Match patients with clinicians based on insurance acceptance, availability, and credentials
   - Display cost estimates based on real insurance coverage data

---

## Success Criteria

### Functional Requirements
- ✅ P0 features fully implemented (AI chat, onboarding forms, scheduling)
- ✅ At least 3 of 5 P1 features implemented
- ✅ All 16 CSV files successfully imported into Firestore
- ✅ Clinician-patient matching works with real availability data
- ✅ Insurance verification works with real coverage data

### Technical Requirements
- ✅ Proper error handling throughout
- ✅ Responsive design (mobile and desktop)
- ✅ Secure Firebase rules implemented
- ✅ Code quality and organization
- ✅ 80%+ test coverage

### User Experience Requirements
- ✅ Onboarding flow takes <15 minutes
- ✅ Clear navigation and progress indicators
- ✅ Empathetic AI conversation tone
- ✅ Accessibility considerations (keyboard navigation, contrast)

---

## Project Scope

### In Scope
- Parent-facing onboarding application
- AI mental health assessment with RAG
- Insurance verification and matching
- Appointment scheduling
- Cost estimation
- Questionnaire history display
- Referral tracking

### Out of Scope
- Therapist dashboard
- Payment processing
- Long-term patient tracking
- Video conferencing
- Mobile native apps
- Multi-language support (English only)
- Advanced analytics dashboards
- Automated therapist matching algorithm (manual matching acceptable)
- SMS/Email notifications (system notifications)
- Real insurance verification API calls

---

## Timeline

**Implementation Approach:** 18 Pull Requests organized by feature  
**Current Status:** Project initialization phase  
**Target:** Complete implementation with all P0 features and 3+ P1 features

---

## Key Constraints

1. **Data Privacy:** HIPAA-compliant data handling, 90-day conversation retention
2. **API Costs:** Monitor OpenAI and Pinecone usage carefully
3. **Test Data:** 16 CSV files provided for development and testing
4. **Technology Stack:** React (Frontend), Firebase/Firestore (Backend), OpenAI API, Pinecone (RAG)

---

## Success Metrics

- Functional completeness of P0 and P1 features
- Technical quality (error handling, security, code organization)
- User experience (completion time, navigation clarity, empathetic tone)
- Documentation completeness (README, API docs, deployment guide)

---

**Last Updated:** 2025-11-10  
**Status:** Active Development

