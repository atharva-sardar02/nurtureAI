/**
 * Onboarding Context
 * Manages onboarding form state and persistence
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { 
  createOnboardingApplication, 
  updateOnboardingApplication,
  getOnboardingApplication,
  getUserConversations,
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
  CONSENT: 'consent', // Combined kinship and consent
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
   * Determine current step based on filled data
   */
  const determineStepFromData = useCallback((app) => {
    // If status is complete, go to review
    if (app.status === ONBOARDING_STATUS.COMPLETE) {
      return ONBOARDING_STEPS.REVIEW;
    }
    
    // Check what data is filled to determine step
    const demo = app.demographicData;
    const hasDemographics = demo && demo.childName && demo.childAge && demo.childGender;
    const hasContact = demo && demo.parentName && demo.parentEmail && demo.parentPhone;
    const hasConsent = app.kinship && app.dataRetentionConsent && app.treatmentConsent && app.signature;
    const hasInsurance = app.insuranceData && (app.insuranceData.provider || app.insuranceData.memberId);
    
    // If no data at all, start at welcome
    if (!hasDemographics && !hasContact && !hasConsent && !hasInsurance) {
      return ONBOARDING_STEPS.WELCOME;
    }
    
    // Determine step based on what's completed
    if (!hasDemographics) {
      return ONBOARDING_STEPS.DEMOGRAPHICS;
    } else if (!hasContact) {
      return ONBOARDING_STEPS.CONTACT;
    } else if (!hasConsent) {
      return ONBOARDING_STEPS.CONSENT;
    } else if (!hasInsurance) {
      return ONBOARDING_STEPS.INSURANCE;
    } else {
      // All required data filled, go to review
      return ONBOARDING_STEPS.REVIEW;
    }
  }, []);

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
            // Restore consent data
            dataRetentionConsent: app.dataRetentionConsent || false,
            treatmentConsent: app.treatmentConsent || false,
            signature: app.signature || '',
            signatureDate: app.signatureDate || null,
          }));
        }
        
        // If status is not assessment_complete but user has completed assessment, update it
        // This handles the case where user completes assessment then accesses onboarding
        if (app.status !== ONBOARDING_STATUS.ASSESSMENT_COMPLETE && 
            app.status !== ONBOARDING_STATUS.INSURANCE_SUBMITTED && 
            app.status !== ONBOARDING_STATUS.SCHEDULED && 
            app.status !== ONBOARDING_STATUS.COMPLETE) {
          // Check if assessment is complete by checking for conversation with assessmentData
          try {
            const convResult = await getUserConversations(user.uid, 1);
            if (convResult.success && convResult.conversations && convResult.conversations.length > 0) {
              const latestConversation = convResult.conversations[0];
              if (latestConversation.assessmentData) {
                // Update status to assessment_complete
                await updateOnboardingApplication(app.id, {
                  status: ONBOARDING_STATUS.ASSESSMENT_COMPLETE,
                });
              }
            }
          } catch (err) {
            console.error('Error checking assessment status:', err);
            // Continue anyway - don't block onboarding
          }
        }
        
        // Restore current step - first check if stored, otherwise determine from data
        if (app.currentStep && Object.values(ONBOARDING_STEPS).includes(app.currentStep)) {
          setCurrentStep(app.currentStep);
        } else {
          // Determine current step based on what data is filled
          const determinedStep = determineStepFromData(app);
          setCurrentStep(determinedStep);
        }
      }
    } catch (err) {
      console.error('Error loading onboarding application:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, determineStepFromData]);

  /**
   * Auto-save form data to Firestore
   */
  const autoSave = useCallback(async (currentFormData) => {
    if (!user) return { success: false, error: 'No user' };

    try {
      const dataToSave = currentFormData || formData;

      if (applicationId) {
        // Update existing application
        const result = await updateOnboardingApplication(applicationId, {
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
          // Include consent data in auto-save
          dataRetentionConsent: dataToSave.dataRetentionConsent,
          treatmentConsent: dataToSave.treatmentConsent,
          signature: dataToSave.signature,
          signatureDate: dataToSave.signatureDate,
          // Store current step for restoration
          currentStep: currentStep,
        });
        return result;
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
          // Include consent data in auto-save
          dataRetentionConsent: dataToSave.dataRetentionConsent,
          treatmentConsent: dataToSave.treatmentConsent,
          signature: dataToSave.signature,
          signatureDate: dataToSave.signatureDate,
          // Store current step for restoration
          currentStep: currentStep,
          status: ONBOARDING_STATUS.STARTED,
        });
        
        if (result.success) {
          setApplicationId(result.applicationId);
        }
        return result;
      }
    } catch (err) {
      console.error('Error auto-saving:', err);
      return { success: false, error: err.message };
    }
  }, [user, applicationId, formData, currentStep]);

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  /**
   * Update form data and auto-save (debounced)
   */
  const updateFormData = useCallback((updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Debounce auto-save (will be called after user stops typing)
      debounceTimerRef.current = setTimeout(() => {
        autoSave(newData);
        debounceTimerRef.current = null;
      }, 1000);
      
      return newData;
    });
  }, [autoSave]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
   * Save current step data before transitioning
   */
  const saveCurrentStep = useCallback(async () => {
    if (!user) return { success: false, error: 'No user' };

    try {
      // Cancel any pending debounced saves
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Save immediately
      setLoading(true);
      const result = await autoSave(formData);
      setLoading(false);
      return result;
    } catch (err) {
      console.error('Error saving current step:', err);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, [user, formData, autoSave]);

  /**
   * Validate current step
   */
  const validateStep = useCallback((step) => {
    const errors = {};

    switch (step) {
      case ONBOARDING_STEPS.DEMOGRAPHICS:
        if (!formData.childName?.trim()) {
          errors.childName = 'Child\'s name is required';
        }
        if (!formData.childAge || formData.childAge === '') {
          errors.childAge = 'Child\'s age is required';
        }
        if (!formData.childGender) {
          errors.childGender = 'Gender is required';
        }
        break;

      case ONBOARDING_STEPS.CONTACT:
        if (!formData.parentName?.trim()) {
          errors.parentName = 'Your name is required';
        }
        if (!formData.parentEmail?.trim()) {
          errors.parentEmail = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
          errors.parentEmail = 'Please enter a valid email address';
        }
        if (!formData.parentPhone?.trim()) {
          errors.parentPhone = 'Phone number is required';
        }
        break;

      case ONBOARDING_STEPS.CONSENT:
        if (!formData.kinship) {
          errors.kinship = 'Relationship to child is required';
        }
        if (!formData.dataRetentionConsent) {
          errors.dataRetentionConsent = 'Data retention consent is required';
        }
        if (!formData.treatmentConsent) {
          errors.treatmentConsent = 'Treatment consent is required';
        }
        if (!formData.signature?.trim()) {
          errors.signature = 'Electronic signature is required';
        }
        break;

      default:
        // Other steps are optional or don't require validation
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [formData]);

  /**
   * Navigate to next step (with save and validation)
   */
  const nextStep = useCallback(async () => {
    const steps = Object.values(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      // Validate current step before proceeding
      const validation = validateStep(currentStep);
      if (!validation.isValid) {
        setError('Please complete all required fields before continuing.');
        return { success: false, errors: validation.errors };
      }

      // Save current step data before transitioning
      const saveResult = await saveCurrentStep();
      if (!saveResult.success) {
        setError(saveResult.error || 'Failed to save data. Please try again.');
        return { success: false, error: saveResult.error };
      }

      // Proceed to next step
      const nextStepValue = steps[currentIndex + 1];
      setCurrentStep(nextStepValue);
      
      // Save the new current step to Firestore
      if (applicationId) {
        await updateOnboardingApplication(applicationId, {
          currentStep: nextStepValue,
        });
      }
      
      setError(null); // Clear any previous errors
      return { success: true };
    }
    
    return { success: false, error: 'Already on last step' };
  }, [currentStep, validateStep, saveCurrentStep, applicationId]);

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
    saveCurrentStep,
    validateStep,
    
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

