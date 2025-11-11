/**
 * Welcome Screen Component
 * First step of onboarding - shows welcome message and referral info
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useOnboarding } from "@/contexts/OnboardingContext"

export function WelcomeScreen() {
  const { nextStep, formData } = useOnboarding()

  return (
    <Card className="border border-border shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl">Welcome to NurtureAI</CardTitle>
          <CardDescription className="text-base pt-2">
            {formData.referralInfo 
              ? `You've been referred by ${formData.referralInfo.organizationName || 'your organization'}. Let's get started with your onboarding.`
              : "We're here to help you find the right mental health support for your child. Let's complete your profile to get started."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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

