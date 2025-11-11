/**
 * Questionnaire History Summary Component
 * Displays past questionnaire responses if available
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/services/firebase/config"

/**
 * Calculate trend from scores
 * @param {Array} scores - Array of score objects with value and date
 * @returns {string} Trend direction
 */
function calculateTrend(scores) {
  if (scores.length < 2) return "stable"
  
  const recent = scores.slice(-2)
  const diff = recent[1].value - recent[0].value
  
  if (diff > 0) return "increasing"
  if (diff < 0) return "decreasing"
  return "stable"
}

/**
 * Format questionnaire type label
 */
function formatTypeLabel(type) {
  if (!type) return "Unknown"
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase())
}

export function QuestionnaireHistorySummary() {
  const { user } = useAuth()
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
        // Query questionnaires for this user
        // Note: In real implementation, we'd query by patientId linked to user
        // For now, we'll query by userId if that field exists
        const q = query(
          collection(db, 'questionnaires'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5) // Get last 5 questionnaires
        )

        const querySnapshot = await getDocs(q)
        const questionnaireData = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          questionnaireData.push({
            id: doc.id,
            type: data.type || data.typeLabel || 'Unknown',
            typeLabel: data.typeLabel || formatTypeLabel(data.type),
            score: data.score || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            typeMetadata: data.typeMetadata || {},
          })
        })

        setQuestionnaires(questionnaireData)
      } catch (err) {
        console.error('Error loading questionnaires:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadQuestionnaires()
  }, [user])

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
  const trend = calculateTrend(questionnaires.map(q => ({ value: q.score || 0, date: q.createdAt })))
  
  // Get trend icon
  const TrendIcon = trend === "increasing" ? TrendingUp : trend === "decreasing" ? TrendingDown : Minus
  const trendColor = trend === "increasing" ? "text-destructive" : trend === "decreasing" ? "text-green-600" : "text-muted-foreground"

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
                <p className="font-semibold text-lg">{mostRecent.score}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {mostRecent.createdAt.toLocaleDateString()}
          </p>
        </div>

        {questionnaires.length > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className={trendColor}>
              {trend === "increasing" && "Scores trending upward"}
              {trend === "decreasing" && "Scores trending downward"}
              {trend === "stable" && "Scores stable"}
            </span>
          </div>
        )}

        {questionnaires.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Recent History</p>
            <div className="space-y-1">
              {questionnaires.slice(1, 4).map((q) => (
                <div key={q.id} className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded">
                  <span>{q.typeLabel}</span>
                  <div className="flex items-center gap-2">
                    {q.score !== null && <span className="font-medium">{q.score}</span>}
                    <span className="text-xs text-muted-foreground">
                      {q.createdAt.toLocaleDateString()}
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

