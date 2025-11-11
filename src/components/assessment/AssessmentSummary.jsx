/**
 * Assessment Summary Component
 * Displays assessment results and next steps
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, ArrowRight, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import PropTypes from "prop-types"

export function AssessmentSummary({ assessmentData, onContinue }) {
  const navigate = useNavigate()

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    } else {
      navigate("/onboarding")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Assessment Summary
          </CardTitle>
          <CardDescription>
            Based on our conversation, here&apos;s what we&apos;ve learned
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Important Disclaimer */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This assessment is not a diagnosis. It
              is a screening tool to help determine if mental health services
              might be beneficial. Only a licensed mental health professional
              can provide a diagnosis.
            </AlertDescription>
          </Alert>

          {/* Suitability Determination */}
          {assessmentData?.suitability && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                {assessmentData.suitability === "suitable" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                )}
                <div>
                  <h3 className="font-semibold mb-1">
                    {assessmentData.suitability === "suitable"
                      ? "Services May Be Helpful"
                      : "Alternative Resources Recommended"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {assessmentData.suitability === "suitable"
                      ? "Based on our conversation, it seems like mental health services could be beneficial for your child. Continue to complete the onboarding process."
                      : "Based on our conversation, there may be other resources that are a better fit. However, you can still continue with onboarding if you&apos;d like."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Concerns Summary */}
          {assessmentData?.concerns && assessmentData.concerns.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Key Concerns Identified</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {assessmentData.concerns.slice(0, 5).map((concern, index) => (
                  <li key={index}>{concern}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Conversation Stats */}
          {assessmentData?.messageCount && (
            <div className="text-sm text-muted-foreground">
              <p>
                Conversation length: {assessmentData.messageCount} messages
              </p>
            </div>
          )}

          {/* Continue Button */}
          <div className="pt-4 border-t">
            <Button onClick={handleContinue} className="w-full" size="lg">
              Continue to Onboarding
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

AssessmentSummary.propTypes = {
  assessmentData: PropTypes.shape({
    suitability: PropTypes.string,
    concerns: PropTypes.arrayOf(PropTypes.string),
    messageCount: PropTypes.number,
  }),
  onContinue: PropTypes.func,
}

