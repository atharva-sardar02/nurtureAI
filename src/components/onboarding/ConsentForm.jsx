/**
 * Consent Form Component
 * Displays kinship relationship, data retention notice, and consent checkboxes
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertCircle } from "lucide-react"
import { useOnboarding } from "@/contexts/OnboardingContext"
import { KinshipSelector } from "./KinshipSelector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ConsentForm() {
  const { formData, updateFormData, validateStep, ONBOARDING_STEPS } = useOnboarding()
  
  // Get validation errors for this step
  const validation = validateStep(ONBOARDING_STEPS.CONSENT)
  const errors = validation.errors || {}

  const formatKinshipLabel = (label) => {
    if (!label) return ""
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  return (
    <Card className="border border-border shadow-lg">
      <CardHeader>
        <CardTitle>Consent & Relationship</CardTitle>
        <CardDescription>Please confirm your relationship to the child and provide consent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <KinshipSelector
            value={formData.kinship}
            onChange={(kinship) => updateFormData({ kinship })}
          />
          {errors.kinship && (
            <p className="text-sm text-destructive" role="alert">{errors.kinship}</p>
          )}
        </div>

        {formData.kinship && !formData.kinship.consentEligible && (
          <div className="space-y-2">
            <Label htmlFor="guardianProof">
              Legal Guardianship Proof <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.guardianProof || ""}
              onValueChange={(value) => updateFormData({ guardianProof: value })}
            >
              <SelectTrigger id="guardianProof">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="provided">I have provided proof of legal guardianship</SelectItem>
                <SelectItem value="not_provided">I do not have proof of legal guardianship</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Additional documentation may be required to provide consent for treatment.
            </p>
          </div>
        )}

        {formData.kinship && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You have indicated that you are the child's <strong>{formatKinshipLabel(formData.kinship.label)}</strong>.
              {formData.kinship.consentEligible 
                ? " You are eligible to provide consent for treatment."
                : " You may need to provide additional documentation to provide consent."}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold">Data Retention & Privacy</h4>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Data Retention:</strong> Your conversation data will be retained for 90 days for quality and safety purposes, then automatically deleted. You can request immediate deletion at any time.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="dataRetentionConsent"
                checked={formData.dataRetentionConsent}
                onCheckedChange={(checked) => 
                  updateFormData({ dataRetentionConsent: checked })
                }
                aria-invalid={errors.dataRetentionConsent ? 'true' : 'false'}
              />
              <Label htmlFor="dataRetentionConsent" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I understand and consent to the 90-day data retention policy <span className="text-destructive">*</span>
              </Label>
            </div>
            {errors.dataRetentionConsent && (
              <p className="text-sm text-destructive ml-7" role="alert">{errors.dataRetentionConsent}</p>
            )}

            <div className="flex items-start space-x-3">
              <Checkbox
                id="treatmentConsent"
                checked={formData.treatmentConsent}
                onCheckedChange={(checked) => 
                  updateFormData({ treatmentConsent: checked })
                }
                aria-invalid={errors.treatmentConsent ? 'true' : 'false'}
              />
              <Label htmlFor="treatmentConsent" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I consent to mental health treatment for my child <span className="text-destructive">*</span>
              </Label>
            </div>
            {errors.treatmentConsent && (
              <p className="text-sm text-destructive ml-7" role="alert">{errors.treatmentConsent}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="signature">
            Electronic Signature <span className="text-destructive">*</span>
          </Label>
          <Input
            id="signature"
            placeholder="Type your full name"
            value={formData.signature}
            onChange={(e) => updateFormData({ 
              signature: e.target.value,
              signatureDate: new Date(),
            })}
            required
            aria-invalid={errors.signature ? 'true' : 'false'}
            className={errors.signature ? 'border-destructive' : ''}
          />
          {errors.signature && (
            <p className="text-sm text-destructive" role="alert">{errors.signature}</p>
          )}
          <p className="text-xs text-muted-foreground">
            By typing your name, you are providing your electronic signature and consent.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

