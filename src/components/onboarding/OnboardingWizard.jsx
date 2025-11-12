/**
 * Onboarding Wizard Component
 * Main container for multi-step onboarding form
 */

import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useOnboarding, ONBOARDING_STEPS } from "@/contexts/OnboardingContext"
import { WelcomeScreen } from "./WelcomeScreen"
import { DemographicInfo } from "./DemographicInfo"
import { ContactInfo } from "./ContactInfo"
import { ConsentForm } from "./ConsentForm"
import { InsuranceVerification } from "@/components/insurance/InsuranceVerification"
import { QuestionnaireHistorySummary } from "./QuestionnaireHistorySummary"
import { DataDeletionOption } from "./DataDeletionOption"
import { ReviewStep } from "./ReviewStep"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"

export function OnboardingWizard() {
  const { 
    currentStep, 
    nextStep, 
    prevStep, 
    getProgress,
    loading,
    error,
    formData,
    updateFormData,
    validateStep
  } = useOnboarding()

  const progress = getProgress()
  const stepIndex = Object.values(ONBOARDING_STEPS).indexOf(currentStep)
  const totalSteps = Object.keys(ONBOARDING_STEPS).length

  const canGoNext = () => {
    // Validate current step
    const validation = validateStep(currentStep)
    return validation.isValid && !loading
  }

  const canGoBack = () => {
    return stepIndex > 0 && !loading
  }

  const handleNext = async () => {
    if (canGoNext()) {
      const result = await nextStep()
      // Error handling is done in nextStep, which sets the error state
      if (!result.success && result.errors) {
        // Validation errors are already set in context
        console.log('Validation errors:', result.errors)
      }
    }
  }

  const handleBack = () => {
    if (canGoBack()) {
      prevStep()
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case ONBOARDING_STEPS.WELCOME:
        return <WelcomeScreen />
      case ONBOARDING_STEPS.DEMOGRAPHICS:
        return <DemographicInfo />
      case ONBOARDING_STEPS.CONTACT:
        return <ContactInfo />
      case ONBOARDING_STEPS.CONSENT:
        return <ConsentForm />
      case ONBOARDING_STEPS.INSURANCE:
        return <InsuranceVerification 
          initialInsuranceData={formData.insuranceProvider || formData.insuranceMemberId || formData.insuranceGroupNumber ? {
            provider: formData.insuranceProvider || '',
            memberId: formData.insuranceMemberId || '',
            groupNumber: formData.insuranceGroupNumber || '',
          } : null}
          onVerificationComplete={(data) => {
            // Update onboarding form data with verified insurance info
            updateFormData({
              insuranceProvider: data.provider,
              insuranceMemberId: data.memberId,
              insuranceGroupNumber: data.groupNumber,
            });
          }}
        />
      case ONBOARDING_STEPS.QUESTIONNAIRE_HISTORY:
        return <QuestionnaireHistorySummary />
      case ONBOARDING_STEPS.REVIEW:
        return (
          <div className="space-y-6">
            <ReviewStep />
            <DataDeletionOption />
          </div>
        )
      default:
        return <WelcomeScreen />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="bg-muted/30 py-4 sm:py-6 px-4 sm:px-6 lg:px-8 border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Complete Your Profile</h2>
            <span className="text-xs sm:text-sm text-muted-foreground" aria-label={`Step ${stepIndex + 1} of ${totalSteps}`}>
              {stepIndex + 1} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Onboarding progress">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading..." />
            </div>
          ) : (
            <div className="animate-in fade-in-50 duration-300">
              {renderStep()}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep !== ONBOARDING_STEPS.WELCOME && currentStep !== ONBOARDING_STEPS.REVIEW && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={!canGoBack() || loading}
                className="flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px] transition-all duration-200"
                aria-label="Go to previous step"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canGoNext() || loading}
                className="flex-1 flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px] transition-all duration-200"
                aria-label="Continue to next step"
              >
                {loading ? 'Saving...' : 'Continue'}
                {!loading && <ChevronRight className="w-4 h-4" aria-hidden="true" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

