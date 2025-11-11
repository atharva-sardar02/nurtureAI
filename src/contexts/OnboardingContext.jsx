/**
 * Onboarding Context
 * Manages onboarding form state and persistence
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  createOnboardingApplication, 
  updateOnboardingApplication,
  getOnboardingApplication,
} from '@/services/firebase/firestore';

const OnboardingContext = createContext(null);

/**
 * Onboarding status values
 */
export const ONBOARDING_STATUS = {
  STARTED: 'started',
  ASSESSMENT_COMPLETE: 'assessment_complete',
  INSURANCE_SUBMITTED: 'insurance_submitted',
  SCHEDULED: 'scheduled',
  COMPLETE: 'complete',
};

/**
 * Onboarding steps
 */
export const ONBOARDING_STEPS = {
  WELCOME: 'welcome',
  DEMOGRAPHICS: 'demographics',
  CONTACT: 'contact',
  KINSHIP: 'kinship',
  CONSENT: 'consent',
  INSURANCE: 'insurance',
  QUESTIONNAIRE_HISTORY: 'questionnaire_history', // Optional - doesn't block if no history
  REVIEW: 'review',
};

export function OnboardingProvider({ children }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(ONBOARDING_STEPS.WELCOME);
  const [applicationId, setApplicationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Demographics
    childName: '',
    childAge: '',
    childGender: '',
    childDateOfBirth: '',
    
    // Parent/Guardian
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    
    // Kinship
    kinship: null, // {code, label, consentEligible}
    guardianProof: null, // "provided" | "not_provided" | null
    
    // Insurance
    insuranceProvider: '',
    insuranceMemberId: '',
    insuranceGroupNumber: '',
    
    // Consent
    dataRetentionConsent: false,
    treatmentConsent: false,
    signature: '',
    signatureDate: null,
    
    // Referral
    referralInfo: null,
  });

  /**
   * Load existing onboarding application from Firestore
   */
  const loadApplication = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const result = await getOnboardingApplication(user.uid);
      
      if (result.success && result.data) {
        const app = result.data;
        setApplicationId(app.id);
        
        // Restore form data
        if (app.demographicData) {
          setFormData(prev => ({
            ...prev,
            ...app.demographicData,
            kinship: app.kinship || null,
            guardianProof: app.guardianProof || null,
            insuranceData: app.insuranceData || {},
            referralInfo: app.referralInfo || null,
          }));
        }
        
        // Determine current step based on status
        if (app.status === ONBOARDING_STATUS.COMPLETE) {
          setCurrentStep(ONBOARDING_STEPS.REVIEW);
        } else if (app.status === ONBOARDING_STATUS.INSURANCE_SUBMITTED) {
          setCurrentStep(ONBOARDING_STEPS.REVIEW);
        } else if (app.status === ONBOARDING_STATUS.ASSESSMENT_COMPLETE) {
          setCurrentStep(ONBOARDING_STEPS.DEMOGRAPHICS);
        }
      }
    } catch (err) {
      console.error('Error loading onboarding application:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Auto-save form data to Firestore
   */
  const autoSave = useCallback(async (currentFormData) => {
    if (!user) return;

    try {
      const dataToSave = currentFormData || formData;

      if (applicationId) {
        // Update existing application
        await updateOnboardingApplication(applicationId, {
          demographicData: {
            childName: dataToSave.childName,
            childAge: dataToSave.childAge,
            childGender: dataToSave.childGender,
            childDateOfBirth: dataToSave.childDateOfBirth,
            parentName: dataToSave.parentName,
            parentEmail: dataToSave.parentEmail,
            parentPhone: dataToSave.parentPhone,
            address: dataToSave.address,
          },
          kinship: dataToSave.kinship,
          guardianProof: dataToSave.guardianProof,
          insuranceData: {
            provider: dataToSave.insuranceProvider,
            memberId: dataToSave.insuranceMemberId,
            groupNumber: dataToSave.insuranceGroupNumber,
          },
          referralInfo: dataToSave.referralInfo,
        });
      } else {
        // Create new application
        const result = await createOnboardingApplication(user.uid, {
          demographicData: {
            childName: dataToSave.childName,
            childAge: dataToSave.childAge,
            childGender: dataToSave.childGender,
            childDateOfBirth: dataToSave.childDateOfBirth,
            parentName: dataToSave.parentName,
            parentEmail: dataToSave.parentEmail,
            parentPhone: dataToSave.parentPhone,
            address: dataToSave.address,
          },
          kinship: dataToSave.kinship,
          guardianProof: dataToSave.guardianProof,
          insuranceData: {
            provider: dataToSave.insuranceProvider,
            memberId: dataToSave.insuranceMemberId,
            groupNumber: dataToSave.insuranceGroupNumber,
          },
          referralInfo: dataToSave.referralInfo,
          status: ONBOARDING_STATUS.STARTED,
        });
        
        if (result.success) {
          setApplicationId(result.applicationId);
        }
      }
    } catch (err) {
      console.error('Error auto-saving:', err);
      // Don't show error to user for auto-save failures
    }
  }, [user, applicationId, formData]);

  /**
   * Update form data and auto-save
   */
  const updateFormData = useCallback((updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      // Debounce auto-save (will be called after user stops typing)
      setTimeout(() => {
        autoSave(newData);
      }, 1000);
      return newData;
    });
  }, [autoSave]);

  /**
   * Submit onboarding application
   */
  const submitApplication = useCallback(async () => {
    if (!user || !applicationId) {
      throw new Error('No application to submit');
    }

    try {
      setLoading(true);
      const result = await updateOnboardingApplication(applicationId, {
        status: ONBOARDING_STATUS.COMPLETE,
        dataRetentionConsent: formData.dataRetentionConsent,
        treatmentConsent: formData.treatmentConsent,
        signature: formData.signature,
        signatureDate: formData.signatureDate || new Date(),
      });

      if (result.success) {
        setCurrentStep(ONBOARDING_STEPS.REVIEW);
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user, applicationId, formData]);

  /**
   * Calculate completion progress
   */
  const getProgress = useCallback(() => {
    const steps = Object.values(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  }, [currentStep]);

  /**
   * Navigate to next step
   */
  const nextStep = useCallback(() => {
    const steps = Object.values(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  }, [currentStep]);

  /**
   * Navigate to previous step
   */
  const prevStep = useCallback(() => {
    const steps = Object.values(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep]);

  /**
   * Load application on mount
   */
  useEffect(() => {
    if (user) {
      loadApplication();
    }
  }, [user, loadApplication]);

  const value = {
    // State
    currentStep,
    formData,
    applicationId,
    loading,
    error,
    
    // Actions
    setCurrentStep,
    updateFormData,
    nextStep,
    prevStep,
    submitApplication,
    getProgress,
    autoSave,
    
    // Constants
    ONBOARDING_STEPS,
    ONBOARDING_STATUS,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

