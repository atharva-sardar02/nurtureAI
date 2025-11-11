/**
 * Contact Information Component
 * Collects parent/guardian contact details
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useOnboarding } from "@/contexts/OnboardingContext"

export function ContactInfo() {
  const { formData, updateFormData, validateStep, ONBOARDING_STEPS } = useOnboarding()
  
  // Get validation errors for this step
  const validation = validateStep(ONBOARDING_STEPS.CONTACT)
  const errors = validation.errors || {}

  const handleAddressChange = (field, value) => {
    updateFormData({
      address: {
        ...formData.address,
        [field]: value,
      },
    })
  }

  return (
    <Card className="border border-border shadow-lg">
      <CardHeader>
        <CardTitle>Your Contact Information</CardTitle>
        <CardDescription>We'll use this to send appointment reminders and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="parentName">
            Your Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="parentName"
            placeholder="Enter your name"
            value={formData.parentName}
            onChange={(e) => updateFormData({ parentName: e.target.value })}
            required
            aria-invalid={errors.parentName ? 'true' : 'false'}
            className={errors.parentName ? 'border-destructive' : ''}
          />
          {errors.parentName && (
            <p className="text-sm text-destructive" role="alert">{errors.parentName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentEmail">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="parentEmail"
            type="email"
            placeholder="your@email.com"
            value={formData.parentEmail}
            onChange={(e) => updateFormData({ parentEmail: e.target.value })}
            required
            aria-invalid={errors.parentEmail ? 'true' : 'false'}
            className={errors.parentEmail ? 'border-destructive' : ''}
          />
          {errors.parentEmail && (
            <p className="text-sm text-destructive" role="alert">{errors.parentEmail}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentPhone">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="parentPhone"
            type="tel"
            placeholder="(555) 123-4567"
            value={formData.parentPhone}
            onChange={(e) => updateFormData({ parentPhone: e.target.value })}
            required
            aria-invalid={errors.parentPhone ? 'true' : 'false'}
            className={errors.parentPhone ? 'border-destructive' : ''}
          />
          {errors.parentPhone && (
            <p className="text-sm text-destructive" role="alert">{errors.parentPhone}</p>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Address (Optional)</h4>
          
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              placeholder="123 Main St"
              value={formData.address?.street || ""}
              onChange={(e) => handleAddressChange("street", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={formData.address?.city || ""}
                onChange={(e) => handleAddressChange("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="State"
                value={formData.address?.state || ""}
                onChange={(e) => handleAddressChange("state", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              placeholder="12345"
              value={formData.address?.zipCode || ""}
              onChange={(e) => handleAddressChange("zipCode", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

