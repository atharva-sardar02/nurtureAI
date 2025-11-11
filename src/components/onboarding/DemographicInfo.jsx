/**
 * Demographic Information Component
 * Collects child and parent/guardian demographics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOnboarding } from "@/contexts/OnboardingContext"

export function DemographicInfo() {
  const { formData, updateFormData, validateStep, ONBOARDING_STEPS } = useOnboarding()
  
  // Get validation errors for this step
  const validation = validateStep(ONBOARDING_STEPS.DEMOGRAPHICS)
  const errors = validation.errors || {}

  return (
    <Card className="border border-border shadow-lg">
      <CardHeader>
        <CardTitle>Tell Us About Your Child</CardTitle>
        <CardDescription>This helps us match the right clinician for your child's needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="childName">
            Child's Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="childName"
            placeholder="Enter your child's name"
            value={formData.childName}
            onChange={(e) => updateFormData({ childName: e.target.value })}
            required
            aria-invalid={errors.childName ? 'true' : 'false'}
            className={errors.childName ? 'border-destructive' : ''}
          />
          {errors.childName && (
            <p className="text-sm text-destructive" role="alert">{errors.childName}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="childAge">
              Age <span className="text-destructive">*</span>
            </Label>
            <Input
              id="childAge"
              type="number"
              placeholder="e.g., 14"
              min="5"
              max="18"
              value={formData.childAge}
              onChange={(e) => updateFormData({ childAge: e.target.value })}
              required
              aria-invalid={errors.childAge ? 'true' : 'false'}
              className={errors.childAge ? 'border-destructive' : ''}
            />
            {errors.childAge && (
              <p className="text-sm text-destructive" role="alert">{errors.childAge}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="childGender">
              Gender <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.childGender}
              onValueChange={(value) => updateFormData({ childGender: value })}
            >
              <SelectTrigger 
                id="childGender"
                aria-invalid={errors.childGender ? 'true' : 'false'}
                className={errors.childGender ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {errors.childGender && (
              <p className="text-sm text-destructive" role="alert">{errors.childGender}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="childDateOfBirth">Date of Birth (Optional)</Label>
          <Input
            id="childDateOfBirth"
            type="date"
            value={formData.childDateOfBirth}
            onChange={(e) => updateFormData({ childDateOfBirth: e.target.value })}
          />
        </div>

        <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
          <p className="text-sm text-foreground">
            <strong>Note:</strong> This information helps our clinicians provide the best support for your
            child's specific age and developmental stage.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

