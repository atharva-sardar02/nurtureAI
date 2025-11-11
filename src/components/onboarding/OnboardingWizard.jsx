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

export function OnboardingWizard() {
  const { 
    currentStep, 
    nextStep, 
    prevStep, 
    getProgress,
    loading,
    updateFormData
  } = useOnboarding()

  const progress = getProgress()
  const stepIndex = Object.values(ONBOARDING_STEPS).indexOf(currentStep)
  const totalSteps = Object.keys(ONBOARDING_STEPS).length

  const canGoNext = () => {
    // Add validation logic here if needed
    return true
  }

  const canGoBack = () => {
    return stepIndex > 0
  }

  const handleNext = () => {
    if (canGoNext()) {
      nextStep()
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
      case ONBOARDING_STEPS.KINSHIP:
      case ONBOARDING_STEPS.CONSENT:
        return <ConsentForm />
      case ONBOARDING_STEPS.INSURANCE:
        return <InsuranceVerification 
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
      <div className="bg-muted/30 py-6 px-4 sm:px-6 lg:px-8 border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Complete Your Profile</h2>
            <span className="text-sm text-muted-foreground">
              {stepIndex + 1} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {renderStep()}

          {/* Navigation Buttons */}
          {currentStep !== ONBOARDING_STEPS.WELCOME && currentStep !== ONBOARDING_STEPS.REVIEW && (
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={!canGoBack() || loading}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

