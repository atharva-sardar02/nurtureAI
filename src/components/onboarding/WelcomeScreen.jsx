/**
 * Welcome Screen Component
 * First step of onboarding - shows welcome message and referral info
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useOnboarding } from "@/contexts/OnboardingContext"
import { ReferralInfo } from "@/components/referrals/ReferralInfo"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getOnboardingApplication } from "@/services/firebase/firestore"
import { getPatientReferral } from "@/services/referrals/ReferralTracker"

export function WelcomeScreen() {
  const { nextStep, formData, applicationId, updateFormData } = useOnboarding()
  const { user } = useAuth()
  const [referral, setReferral] = useState(null)
  const [loadingReferral, setLoadingReferral] = useState(true)

  useEffect(() => {
    async function loadReferral() {
      if (!user) {
        setLoadingReferral(false)
        return
      }

      try {
        // Get patientId from onboarding application
        const appResult = await getOnboardingApplication(user.uid)
        if (appResult.success && appResult.data?.patientId) {
          const patientId = appResult.data.patientId
          
          // Get referral information
          const referralResult = await getPatientReferral(patientId)
          if (referralResult.success && referralResult.referral) {
            const referralData = referralResult.referral
            
            // Format referral info for storage
            const formattedReferral = {
              referralId: referralData.id,
              sourceName: referralData.sourceName || referralData.referralData?.sourceName,
              sourceType: referralData.source || referralData.referralData?.source,
              organizationId: referralData.organizationId || referralData.referralData?.organizationId,
              displayInOnboarding: referralData.displayInOnboarding !== false,
            }
            
            setReferral(referralData)
            
            // Save to onboarding form data if not already set
            if (!formData.referralInfo) {
              updateFormData({ referralInfo: formattedReferral })
            }
          }
        }
      } catch (error) {
        console.error('Error loading referral:', error)
      } finally {
        setLoadingReferral(false)
      }
    }

    loadReferral()
  }, [user, applicationId, formData.referralInfo, updateFormData])

  // Get referral source name for welcome message
  const referralSourceName = referral 
    ? (referral.sourceName || referral.referralData?.sourceName || null)
    : (formData.referralInfo?.sourceName || formData.referralInfo?.organizationName || null)

  return (
    <Card className="border border-border shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl">Welcome to NurtureAI</CardTitle>
          <CardDescription className="text-base pt-2">
            {referralSourceName
              ? `You've been referred by ${referralSourceName}. Let's get started with your onboarding.`
              : "We're here to help you find the right mental health support for your child. Let's complete your profile to get started."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show referral info if available */}
        {referral && !loadingReferral && (
          <ReferralInfo referral={referral} compact={true} />
        )}

        <div className="bg-secondary/20 p-6 rounded-lg border border-secondary/30">
          <h4 className="font-semibold text-secondary mb-2">What's Next</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-secondary">1.</span>
              <span>Tell us about your child</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-secondary">2.</span>
              <span>Share your contact information</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-secondary">3.</span>
              <span>Confirm your relationship to the child</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-secondary">4.</span>
              <span>Add your insurance details</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-secondary">5.</span>
              <span>Review and confirm your information</span>
            </li>
          </ul>
        </div>
        <Button onClick={nextStep} className="w-full">
          Get Started
        </Button>
      </CardContent>
    </Card>
  )
}

