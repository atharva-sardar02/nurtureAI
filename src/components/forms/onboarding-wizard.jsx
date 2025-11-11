import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react"

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState("welcome")
  const [formData, setFormData] = useState({
    childName: "",
    childAge: "",
    childGender: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    insuranceProvider: "",
    insuranceMemberId: "",
  })

  const steps = ["welcome", "child-info", "parent-info", "insurance", "review"]
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="bg-muted/30 py-6 px-4 sm:px-6 lg:px-8 border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Complete Your Profile</h2>
            <span className="text-sm text-muted-foreground">
              {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Step */}
          {currentStep === "welcome" && (
            <Card className="border border-border shadow-lg">
              <CardHeader className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
                  <CardDescription className="text-base pt-2">
                    We have a good understanding of your child's needs. Now let's complete your profile.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary/20 p-6 rounded-lg border border-secondary/30">
                  <h4 className="font-semibold text-secondary mb-2">What's Next</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="font-bold text-secondary">1.</span>
                      <span>Tell us about your child</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-secondary">2.</span>
                      <span>Share your contact information</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-secondary">3.</span>
                      <span>Add your insurance details</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-secondary">4.</span>
                      <span>Review and confirm your information</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Child Info Step */}
          {currentStep === "child-info" && (
            <Card className="border border-border shadow-lg">
              <CardHeader>
                <CardTitle>Tell Us About Your Child</CardTitle>
                <CardDescription>This helps us match the right clinician for your child's needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child's Full Name</Label>
                  <Input
                    id="childName"
                    placeholder="Enter your child's name"
                    value={formData.childName}
                    onChange={(e) => handleInputChange("childName", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childAge">Age</Label>
                    <Input
                      id="childAge"
                      type="number"
                      placeholder="e.g., 14"
                      min="5"
                      max="18"
                      value={formData.childAge}
                      onChange={(e) => handleInputChange("childAge", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childGender">Gender</Label>
                    <select className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                  <p className="text-sm text-foreground">
                    <strong>Note:</strong> This information helps our clinicians provide the best support for your
                    child's specific age and developmental stage.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parent Info Step */}
          {currentStep === "parent-info" && (
            <Card className="border border-border shadow-lg">
              <CardHeader>
                <CardTitle>Your Contact Information</CardTitle>
                <CardDescription>We'll use this to send appointment reminders and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Your Full Name</Label>
                  <Input
                    id="parentName"
                    placeholder="Enter your name"
                    value={formData.parentName}
                    onChange={(e) => handleInputChange("parentName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Email Address</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.parentEmail}
                    onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Phone Number</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.parentPhone}
                    onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insurance Step */}
          {currentStep === "insurance" && (
            <Card className="border border-border shadow-lg">
              <CardHeader>
                <CardTitle>Insurance Information</CardTitle>
                <CardDescription>This helps us verify coverage and find in-network clinicians</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <select className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Select your insurance provider</option>
                    <option value="united">United Healthcare</option>
                    <option value="aetna">Aetna</option>
                    <option value="anthem">Anthem Blue Cross</option>
                    <option value="molina">Molina Healthcare</option>
                    <option value="cigna">Cigna</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceMemberId">Member ID</Label>
                  <Input
                    id="insuranceMemberId"
                    placeholder="Shown on your insurance card"
                    value={formData.insuranceMemberId}
                    onChange={(e) => handleInputChange("insuranceMemberId", e.target.value)}
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
          )}

          {/* Review Step */}
          {currentStep === "review" && (
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
                      {formData.childName}, Age {formData.childAge}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Parent Information</p>
                    <p className="font-semibold">{formData.parentName}</p>
                    <p className="text-sm text-muted-foreground">{formData.parentEmail}</p>
                    <p className="text-sm text-muted-foreground">{formData.parentPhone}</p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Insurance</p>
                    <p className="font-semibold">{formData.insuranceProvider}</p>
                    <p className="text-sm text-muted-foreground">ID: {formData.insuranceMemberId}</p>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    ✓ All information looks good. Click submit to complete onboarding.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
            >
              {currentStepIndex === steps.length - 1 ? "Complete" : "Continue"}
              {currentStepIndex < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

