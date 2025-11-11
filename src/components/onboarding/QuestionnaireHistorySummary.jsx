/**
 * Questionnaire History Summary Component
 * Displays past questionnaire responses if available
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useOnboarding } from "@/contexts/OnboardingContext"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/services/firebase/config"
import { getOnboardingApplication } from "@/services/firebase/firestore"
import { 
  calculateQuestionnaireTrend, 
  interpretScoreSeverity, 
  getSeverityDisplay,
  formatQuestionnaireType 
} from "@/utils/questionnaireAnalysis"

export function QuestionnaireHistorySummary() {
  const { user } = useAuth()
  const { applicationId } = useOnboarding()
  const [questionnaires, setQuestionnaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadQuestionnaires() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Get patientId from onboarding application
        let patientId = null
        
        // Query for onboarding application to get patientId
        const appResult = await getOnboardingApplication(user.uid)
        if (appResult.success && appResult.data?.patientId) {
          patientId = appResult.data.patientId
        }

        if (!patientId) {
          // No patientId found - user hasn't completed onboarding yet
          setQuestionnaires([])
          setLoading(false)
          return
        }

        // Query questionnaires by patientId
        const q = query(
          collection(db, 'questionnaires'),
          where('patientId', '==', patientId),
          orderBy('completedAt', 'desc'),
          limit(10) // Get last 10 questionnaires
        )

        const querySnapshot = await getDocs(q)
        const questionnaireData = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          const typeCode = data.type || data.typeCode
          const typeLabel = data.typeLabel || formatQuestionnaireType(typeCode)
          const score = data.score !== null && data.score !== undefined ? data.score : null
          const severity = score !== null ? interpretScoreSeverity(typeCode, score) : null
          
          questionnaireData.push({
            id: doc.id,
            type: typeCode,
            typeCode: data.typeCode,
            typeLabel: typeLabel,
            score: score,
            severity: severity,
            completedAt: data.completedAt?.toDate() || data.createdAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            typeMetadata: data.typeMetadata || {},
          })
        })

        // Sort by completedAt date (most recent first)
        questionnaireData.sort((a, b) => {
          const dateA = a.completedAt || a.createdAt
          const dateB = b.completedAt || b.createdAt
          return dateB - dateA
        })

        setQuestionnaires(questionnaireData)
      } catch (err) {
        console.error('Error loading questionnaires:', err)
        // If orderBy fails (no index), try without it
        if (err.code === 'failed-precondition') {
          try {
            const q = query(
              collection(db, 'questionnaires'),
              where('patientId', '==', patientId),
              limit(10)
            )
            const querySnapshot = await getDocs(q)
            const questionnaireData = []
            querySnapshot.forEach((doc) => {
              const data = doc.data()
              const typeCode = data.type || data.typeCode
              const typeLabel = data.typeLabel || formatQuestionnaireType(typeCode)
              const score = data.score !== null && data.score !== undefined ? data.score : null
              const severity = score !== null ? interpretScoreSeverity(typeCode, score) : null
              
              questionnaireData.push({
                id: doc.id,
                type: typeCode,
                typeCode: data.typeCode,
                typeLabel: typeLabel,
                score: score,
                severity: severity,
                completedAt: data.completedAt?.toDate() || data.createdAt?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                typeMetadata: data.typeMetadata || {},
              })
            })
            // Sort manually
            questionnaireData.sort((a, b) => {
              const dateA = a.completedAt || a.createdAt
              const dateB = b.completedAt || b.createdAt
              return dateB - dateA
            })
            setQuestionnaires(questionnaireData)
          } catch (retryErr) {
            setError(retryErr.message)
          }
        } else {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    loadQuestionnaires()
  }, [user, applicationId])

  if (loading) {
    return (
      <Card className="border border-border shadow-lg">
        <CardHeader>
          <CardTitle>Questionnaire History</CardTitle>
          <CardDescription>Loading your assessment history...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border border-border shadow-lg">
        <CardHeader>
          <CardTitle>Questionnaire History</CardTitle>
          <CardDescription>Unable to load history</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (questionnaires.length === 0) {
    return (
      <Card className="border border-border shadow-lg">
        <CardHeader>
          <CardTitle>Questionnaire History</CardTitle>
          <CardDescription>No previous assessments found</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This is your first assessment. Your responses will be saved here for future reference.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Get most recent questionnaire
  const mostRecent = questionnaires[0]
  const trend = calculateQuestionnaireTrend(questionnaires)
  
  // Get trend icon and color
  const TrendIcon = trend === "worsening" ? TrendingUp : trend === "improving" ? TrendingDown : Minus
  const trendColor = trend === "worsening" ? "text-destructive" : trend === "improving" ? "text-green-600" : "text-muted-foreground"
  const trendLabel = trend === "worsening" ? "Scores trending upward" : trend === "improving" ? "Scores trending downward" : "Scores stable"

  return (
    <Card className="border border-border shadow-lg">
      <CardHeader>
        <CardTitle>Questionnaire History</CardTitle>
        <CardDescription>Your recent assessment scores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Most Recent</p>
              <p className="font-semibold text-lg">{mostRecent.typeLabel}</p>
            </div>
            {mostRecent.score !== null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Score</p>
                <div className="flex items-center gap-2 justify-end">
                  <p className="font-semibold text-lg">{mostRecent.score}</p>
                  {mostRecent.severity && (
                    <Badge 
                      variant="outline" 
                      className={getSeverityDisplay(mostRecent.severity).color}
                    >
                      {getSeverityDisplay(mostRecent.severity).label}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {(mostRecent.completedAt || mostRecent.createdAt).toLocaleDateString()}
          </p>
        </div>

        {questionnaires.length > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className={trendColor}>
              {trendLabel}
            </span>
          </div>
        )}

        {questionnaires.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Recent History</p>
            <div className="space-y-1">
              {questionnaires.slice(1, 4).map((q) => (
                <div key={q.id} className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded">
                  <div className="flex items-center gap-2">
                    <span>{q.typeLabel}</span>
                    {q.severity && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSeverityDisplay(q.severity).color}`}
                      >
                        {getSeverityDisplay(q.severity).label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {q.score !== null && <span className="font-medium">{q.score}</span>}
                    <span className="text-xs text-muted-foreground">
                      {(q.completedAt || q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> These scores are for informational purposes only and do not constitute a diagnosis.
            They help track progress over time.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

