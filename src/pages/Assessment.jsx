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

export function AssessmentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assessmentData, setAssessmentData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, this would fetch the assessment data
    // from Firestore or from the chat context
    // For now, we'll use a placeholder
    setTimeout(() => {
      setAssessmentData({
        suitability: "suitable",
        concerns: [],
        messageCount: 0,
      })
      setLoading(false)
    }, 500)
  }, [])

  const handleContinue = () => {
    navigate("/onboarding")
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

