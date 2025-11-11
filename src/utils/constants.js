/**
 * Application Constants
 * Centralized constants used throughout the application
 */

/**
 * Questionnaire Types
 */
export const QUESTIONNAIRE_TYPES = {
  PHQ_A: "PHQ_A",
  GAD_7: "GAD_7",
  PSC_17: "PSC_17",
  SDQ: "SDQ",
  OTHER: "OTHER",
}

/**
 * Questionnaire Type Labels
 */
export const QUESTIONNAIRE_TYPE_LABELS = {
  [QUESTIONNAIRE_TYPES.PHQ_A]: "PHQ-A",
  [QUESTIONNAIRE_TYPES.GAD_7]: "GAD-7",
  [QUESTIONNAIRE_TYPES.PSC_17]: "PSC-17",
  [QUESTIONNAIRE_TYPES.SDQ]: "SDQ",
  [QUESTIONNAIRE_TYPES.OTHER]: "Other",
}

/**
 * Kinship Types
 */
export const KINSHIP_TYPES = {
  MOTHER: "mother",
  FATHER: "father",
  LEGAL_GUARDIAN: "legalGuardian",
  OTHER_CAREGIVER: "otherCaregiver",
  OTHER: "other",
  GUARDIAN: "guardian", // Legacy
}

/**
 * Kinship Type Labels
 */
export const KINSHIP_TYPE_LABELS = {
  [KINSHIP_TYPES.MOTHER]: "Mother",
  [KINSHIP_TYPES.FATHER]: "Father",
  [KINSHIP_TYPES.LEGAL_GUARDIAN]: "Legal Guardian",
  [KINSHIP_TYPES.OTHER_CAREGIVER]: "Other Caregiver",
  [KINSHIP_TYPES.OTHER]: "Other",
  [KINSHIP_TYPES.GUARDIAN]: "Guardian",
}

/**
 * Application Status
 */
export const APPLICATION_STATUS = {
  STARTED: "started",
  ASSESSMENT_COMPLETE: "assessment_complete",
  INSURANCE_SUBMITTED: "insurance_submitted",
  SCHEDULED: "scheduled",
  COMPLETE: "complete",
}

/**
 * Appointment Status
 */
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
}

/**
 * Severity Levels
 */
export const SEVERITY_LEVELS = {
  MINIMAL: "minimal",
  MILD: "mild",
  MODERATE: "moderate",
  SEVERE: "severe",
}

/**
 * Trend Indicators
 */
export const TREND_INDICATORS = {
  IMPROVING: "improving",
  STABLE: "stable",
  WORSENING: "worsening",
}

/**
 * User Roles
 */
export const USER_ROLES = {
  PARENT: "parent",
  ADMIN: "admin",
  CLINICIAN: "clinician",
}

/**
 * Data Retention
 */
export const DATA_RETENTION_DAYS = 90

/**
 * Crisis Resources
 */
export const CRISIS_RESOURCES = {
  CRISIS_TEXT_LINE: {
    name: "Crisis Text Line",
    phone: "741741",
    text: "Text HOME to 741741",
    url: "https://www.crisistextline.org/",
  },
  SUICIDE_LIFELINE: {
    name: "988 Suicide & Crisis Lifeline",
    phone: "988",
    text: "Call or text 988",
    url: "https://988lifeline.org/",
  },
  EMERGENCY: {
    name: "Emergency Services",
    phone: "911",
    text: "Call 911",
  },
}

/**
 * API Endpoints (if needed for future backend)
 */
export const API_ENDPOINTS = {
  // Placeholder for future API endpoints
  ASSESSMENT: "/api/assessment",
  CONVERSATION: "/api/conversation",
  APPOINTMENT: "/api/appointment",
}

/**
 * Firestore Collections
 */
export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  PATIENTS: "patients",
  CLINICIANS: "clinicians",
  ORGANIZATIONS: "organizations",
  CONTRACTS: "contracts",
  ORG_CONTRACTS: "orgContracts",
  CREDENTIALED_INSURANCES: "credentialedInsurances",
  CLINICIAN_CREDENTIALED_INSURANCES: "clinicianCredentialedInsurances",
  CLINICIAN_AVAILABILITIES: "clinicianAvailabilities",
  DOCUMENTS: "documents",
  INSURANCE_COVERAGES: "insuranceCoverages",
  KINSHIPS: "kinships",
  MEMBERSHIPS: "memberships",
  QUESTIONNAIRES: "questionnaires",
  REFERRALS: "referrals",
  REFERRAL_MEMBERS: "referralMembers",
  PATIENT_AVAILABILITIES: "patientAvailabilities",
  ONBOARDING_APPLICATIONS: "onboardingApplications",
  CONVERSATIONS: "conversations",
  APPOINTMENTS: "appointments",
  KNOWLEDGE_BASE: "knowledgeBase",
}

/**
 * Route Paths
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",
  ASSESSMENT: "/assessment",
  SCHEDULING: "/scheduling",
  INSURANCE: "/insurance",
  HELP: "/help",
  PRIVACY: "/privacy",
  TERMS: "/terms",
}

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  EMAIL: {
    required: true,
    email: true,
  },
  PASSWORD: {
    required: true,
    minLength: 6,
  },
  PHONE: {
    required: false,
    phone: true,
  },
  ZIP_CODE: {
    required: false,
    zipCode: true,
  },
}

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  SHORT: "MM/DD/YYYY",
  LONG: "MMMM DD, YYYY",
  DATETIME: "MMMM DD, YYYY, h:mm A",
  TIME: "h:mm A",
}

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_PREFERENCES: "user_preferences",
  ONBOARDING_PROGRESS: "onboarding_progress",
}

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  FIREBASE_AUTH: "Authentication failed. Please check your credentials.",
  FIREBASE_FIRESTORE: "Database error. Please try again later.",
}

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  SIGN_UP: "Account created successfully!",
  SIGN_IN: "Signed in successfully!",
  PASSWORD_RESET: "Password reset email sent!",
  PROFILE_UPDATE: "Profile updated successfully!",
  APPOINTMENT_BOOKED: "Appointment booked successfully!",
}

