/**
 * Assessment Page
 * Displays assessment summary after chat completion
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"
import { AssessmentSummary } from "@/components/assessment/AssessmentSummary"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { useAuth } from "@/contexts/AuthContext"
import { getUserConversations, getOnboardingApplication, createOnboardingApplication, updateOnboardingApplication } from "@/services/firebase/firestore"
import { ONBOARDING_STATUS } from "@/contexts/OnboardingContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, MessageSquare, ArrowRight } from "lucide-react"

export function AssessmentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assessmentData, setAssessmentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasAssessment, setHasAssessment] = useState(false)

  useEffect(() => {
    const loadAssessmentData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Try to get the most recent conversation with assessment data
        const result = await getUserConversations(user.uid, 1)
        
        if (result.success && result.conversations && result.conversations.length > 0) {
          const latestConversation = result.conversations[0]
          if (latestConversation.assessmentData) {
            setAssessmentData(latestConversation.assessmentData)
            setHasAssessment(true)
          } else {
            setHasAssessment(false)
          }
        } else {
          setHasAssessment(false)
        }
      } catch (error) {
        console.error('Error loading assessment data:', error)
        setHasAssessment(false)
      } finally {
        setLoading(false)
      }
    }

    loadAssessmentData()
  }, [user])

  const handleContinue = async () => {
    // Ensure onboarding application exists with assessment_complete status
    if (user && assessmentData) {
      try {
        const appResult = await getOnboardingApplication(user.uid);
        
        if (appResult.success && appResult.data) {
          // Update existing application to assessment_complete if not already
          if (appResult.data.status !== ONBOARDING_STATUS.ASSESSMENT_COMPLETE &&
              appResult.data.status !== ONBOARDING_STATUS.INSURANCE_SUBMITTED &&
              appResult.data.status !== ONBOARDING_STATUS.SCHEDULED &&
              appResult.data.status !== ONBOARDING_STATUS.COMPLETE) {
            await updateOnboardingApplication(appResult.data.id, {
              status: ONBOARDING_STATUS.ASSESSMENT_COMPLETE,
            });
          }
        } else {
          // Create new onboarding application with assessment_complete status
          await createOnboardingApplication(user.uid, {
            status: ONBOARDING_STATUS.ASSESSMENT_COMPLETE,
          });
        }
      } catch (error) {
        console.error('Error updating onboarding application status:', error);
        // Continue anyway - don't block navigation
      }
    }
    
    navigate("/onboarding")
  }

  const handleStartAssessment = () => {
    navigate("/chat")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading assessment summary..." />
        </main>
        <Footer />
      </div>
    )
  }

  // Show message if no assessment has been completed
  if (!hasAssessment || !assessmentData) {
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
                  Complete the assessment chat to view your summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You haven't completed the assessment yet. Please start a conversation with our AI assistant to begin the assessment process.
                  </AlertDescription>
                </Alert>

                <div className="pt-4">
                  <Button onClick={handleStartAssessment} className="w-full" size="lg">
                    Start Assessment Chat
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <AssessmentSummary
          assessmentData={assessmentData}
          onContinue={handleContinue}
        />
      </main>
      <Footer />
    </div>
  )
}

