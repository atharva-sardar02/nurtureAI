/**
 * Onboarding Page
 * Wraps OnboardingWizard with OnboardingProvider
 */

import { OnboardingProvider } from "@/contexts/OnboardingContext"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { Header } from "@/components/common/Header"

export function OnboardingPage() {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <OnboardingWizard />
        </main>
      </div>
    </OnboardingProvider>
  )
}

