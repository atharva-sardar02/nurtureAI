/**
 * Review Step Component
 * Displays all entered information for review before submission
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOnboarding } from "@/contexts/OnboardingContext"

export function ReviewStep() {
  const { formData, submitApplication, loading } = useOnboarding()

  const formatKinshipLabel = (label) => {
    if (!label) return "Not specified"
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const handleSubmit = async () => {
    const result = await submitApplication()
    if (result.success) {
      // Navigate to success page or next step
      console.log('Application submitted successfully')
    }
  }

  return (
    <Card className="border border-border shadow-lg">
      <CardHeader>
        <CardTitle>Review Your Information</CardTitle>
        <CardDescription>Please review before submitting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Child Information</p>
            <p className="font-semibold">
              {formData.childName || "Not provided"}, Age {formData.childAge || "N/A"}
            </p>
            {formData.childGender && (
              <p className="text-sm text-muted-foreground">Gender: {formData.childGender}</p>
            )}
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Parent/Guardian Information</p>
            <p className="font-semibold">{formData.parentName || "Not provided"}</p>
            <p className="text-sm text-muted-foreground">{formData.parentEmail || "Not provided"}</p>
            <p className="text-sm text-muted-foreground">{formData.parentPhone || "Not provided"}</p>
            {formData.address?.street && (
              <p className="text-sm text-muted-foreground mt-2">
                {formData.address.street}
                {formData.address.city && `, ${formData.address.city}`}
                {formData.address.state && `, ${formData.address.state}`}
                {formData.address.zipCode && ` ${formData.address.zipCode}`}
              </p>
            )}
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Relationship</p>
            <p className="font-semibold">{formatKinshipLabel(formData.kinship?.label)}</p>
            {formData.guardianProof && (
              <p className="text-sm text-muted-foreground">
                Guardian Proof: {formData.guardianProof === "provided" ? "Provided" : "Not Provided"}
              </p>
            )}
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Insurance</p>
            <p className="font-semibold">{formData.insuranceProvider || "Not provided"}</p>
            {formData.insuranceMemberId && (
              <p className="text-sm text-muted-foreground">Member ID: {formData.insuranceMemberId}</p>
            )}
            {formData.insuranceGroupNumber && (
              <p className="text-sm text-muted-foreground">Group: {formData.insuranceGroupNumber}</p>
            )}
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Consent</p>
            <p className="text-sm">
              Data Retention: {formData.dataRetentionConsent ? "✓ Consented" : "✗ Not consented"}
            </p>
            <p className="text-sm">
              Treatment: {formData.treatmentConsent ? "✓ Consented" : "✗ Not consented"}
            </p>
            {formData.signature && (
              <p className="text-sm text-muted-foreground mt-2">
                Signature: {formData.signature}
              </p>
            )}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-900 dark:text-green-100">
            ✓ All information looks good. Click submit to complete onboarding.
          </p>
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={loading || !formData.dataRetentionConsent || !formData.treatmentConsent || !formData.signature}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </CardContent>
    </Card>
  )
}

