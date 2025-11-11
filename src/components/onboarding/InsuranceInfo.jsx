/**
 * Insurance Information Component
 * Collects insurance details
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOnboarding } from "@/contexts/OnboardingContext"

export function InsuranceInfo() {
  const { formData, updateFormData } = useOnboarding()

  return (
    <Card className="border border-border shadow-lg">
      <CardHeader>
        <CardTitle>Insurance Information</CardTitle>
        <CardDescription>This helps us verify coverage and find in-network clinicians</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="insuranceProvider">
            Insurance Provider <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.insuranceProvider}
            onValueChange={(value) => updateFormData({ insuranceProvider: value })}
          >
            <SelectTrigger id="insuranceProvider">
              <SelectValue placeholder="Select your insurance provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="united">United Healthcare</SelectItem>
              <SelectItem value="aetna">Aetna</SelectItem>
              <SelectItem value="anthem">Anthem Blue Cross</SelectItem>
              <SelectItem value="molina">Molina Healthcare</SelectItem>
              <SelectItem value="cigna">Cigna</SelectItem>
              <SelectItem value="blue-cross">Blue Cross Blue Shield</SelectItem>
              <SelectItem value="medicaid">Medicaid</SelectItem>
              <SelectItem value="medicare">Medicare</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="insuranceMemberId">
            Member ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="insuranceMemberId"
            placeholder="Shown on your insurance card"
            value={formData.insuranceMemberId}
            onChange={(e) => updateFormData({ insuranceMemberId: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="insuranceGroupNumber">Group Number (Optional)</Label>
          <Input
            id="insuranceGroupNumber"
            placeholder="Group number if applicable"
            value={formData.insuranceGroupNumber}
            onChange={(e) => updateFormData({ insuranceGroupNumber: e.target.value })}
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Your insurance information is encrypted and secure. We'll verify your coverage to help find
            in-network clinicians.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

