/**
 * Onboarding Page
 * Wraps OnboardingWizard with OnboardingProvider
 * Requires assessment to be completed before allowing access
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { OnboardingProvider } from "@/contexts/OnboardingContext"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { Header } from "@/components/common/Header"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, MessageSquare, ArrowRight, CheckCircle2, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getUserConversations, getOnboardingApplication } from "@/services/firebase/firestore"
import { ONBOARDING_STATUS } from "@/contexts/OnboardingContext"

export function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [hasAssessment, setHasAssessment] = useState(false)
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Check if user has completed assessment (has conversation with assessmentData)
        const assessmentResult = await getUserConversations(user.uid, 1)
        
        if (assessmentResult.success && assessmentResult.conversations && assessmentResult.conversations.length > 0) {
          const latestConversation = assessmentResult.conversations[0]
          if (latestConversation.assessmentData) {
            setHasAssessment(true)
          } else {
            setHasAssessment(false)
          }
        } else {
          setHasAssessment(false)
        }

        // Check if onboarding is already complete
        const appResult = await getOnboardingApplication(user.uid)
        if (appResult.success && appResult.data) {
          const status = appResult.data.status
          if (status === ONBOARDING_STATUS.COMPLETE || 
              status === ONBOARDING_STATUS.SCHEDULED ||
              status === ONBOARDING_STATUS.INSURANCE_SUBMITTED) {
            setIsOnboardingComplete(true)
          }
        }
      } catch (error) {
        console.error('Error checking status:', error)
        setHasAssessment(false)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [user])

  const handleStartAssessment = () => {
    navigate("/")
  }

  const handleGoToAssessment = () => {
    navigate("/assessment")
  }

  const handleGoToScheduling = () => {
    navigate("/scheduling")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Checking status..." />
        </main>
      </div>
    )
  }

  // Show completion message if onboarding is already complete
  if (isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="max-w-2xl mx-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Onboarding Complete
                </CardTitle>
                <CardDescription>
                  Your onboarding application has been successfully submitted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900 dark:text-green-100">
                    Thank you for completing the onboarding process! Your application has been received and is being reviewed by our team.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 pt-4">
                  <Button onClick={handleGoToScheduling} className="w-full" size="lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Your First Appointment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    onClick={() => navigate("/")} 
                    variant="outline" 
                    className="w-full"
                  >
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Block access if assessment not completed
  if (!hasAssessment) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="max-w-2xl mx-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Assessment Required
                </CardTitle>
                <CardDescription>
                  Complete the mental health assessment before starting onboarding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    According to our process, you need to complete the AI mental health assessment first. 
                    This helps us understand your child's needs and determine if our services are appropriate.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 pt-4">
                  <Button onClick={handleStartAssessment} className="w-full" size="lg">
                    Start Assessment Chat
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    onClick={handleGoToAssessment} 
                    variant="outline" 
                    className="w-full"
                  >
                    View Assessment Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

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

