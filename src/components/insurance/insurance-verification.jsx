import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Upload, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function InsuranceVerification() {
  const [activeTab, setActiveTab] = useState("manual")
  const [formData, setFormData] = useState({
    provider: "",
    planName: "",
    groupNumber: "",
    memberId: "",
  })
  const [showMemberId, setShowMemberId] = useState(false)
  const [verified, setVerified] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleVerify = () => {
    if (formData.provider && formData.memberId) {
      setSelectedPlan({
        provider: formData.provider,
        planType: "Individual Health Plan",
        copay: 40,
        deductible: 1500,
        outOfPocketMax: 8000,
        coverage: 85,
        inNetwork: true,
      })
      setVerified(true)
    }
  }

  const mockUploadHandler = () => {
    setFormData({
      ...formData,
      provider: "United Healthcare",
      groupNumber: "GRP-12345",
      memberId: "MEM-987654321",
    })
    setSelectedPlan({
      provider: "United Healthcare",
      planType: "Premier Plus HMO",
      copay: 35,
      deductible: 1000,
      outOfPocketMax: 7500,
      coverage: 90,
      inNetwork: true,
    })
    setVerified(true)
  }

  return (
    <div className="space-y-6">
      {/* Tab Selection */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("manual")}
          className={cn(
            "px-4 py-3 font-medium text-sm border-b-2 transition-colors",
            activeTab === "manual"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={cn(
            "px-4 py-3 font-medium text-sm border-b-2 transition-colors",
            activeTab === "upload"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          Upload Card
        </button>
      </div>

      {/* Manual Entry Tab */}
      {activeTab === "manual" && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Enter Insurance Details</CardTitle>
            <CardDescription>Provide your insurance information manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="provider">Insurance Provider</Label>
              <select
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select your insurance provider</option>
                <option value="united">United Healthcare</option>
                <option value="anthem">Anthem Blue Cross</option>
                <option value="aetna">Aetna</option>
                <option value="molina">Molina Healthcare</option>
                <option value="cigna">Cigna</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupNumber">Group Number</Label>
                <Input
                  id="groupNumber"
                  placeholder="e.g., GRP-12345"
                  value={formData.groupNumber}
                  onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberId">Member ID</Label>
                <div className="relative">
                  <Input
                    id="memberId"
                    type={showMemberId ? "text" : "password"}
                    placeholder="Shown on your card"
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  />
                  <button
                    onClick={() => setShowMemberId(!showMemberId)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showMemberId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={!formData.provider || !formData.memberId}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Verify Insurance
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Upload Insurance Card</CardTitle>
            <CardDescription>Take a photo of your insurance card for quick verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground mb-1">Drop your insurance card here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <Button variant="outline" size="sm">
                Browse Files
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Tips for best results:</p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Capture front side with clear numbers</li>
                <li>• Ensure good lighting and no glare</li>
                <li>• Include full card in frame</li>
              </ul>
            </div>

            <Button onClick={mockUploadHandler} className="w-full bg-primary hover:bg-primary/90">
              Simulate Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Verification Result */}
      {verified && selectedPlan && (
        <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Insurance Verified</h3>
                <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                  Great! Your {selectedPlan.provider} coverage is verified.
                </p>
                <div className="bg-white dark:bg-slate-900 rounded p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Plan Type</span>
                    <span className="text-sm font-semibold">{selectedPlan.planType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Co-pay</span>
                    <span className="text-sm font-semibold">${selectedPlan.copay}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Coverage</span>
                    <span className="text-sm font-semibold text-primary">{selectedPlan.coverage}%</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">In-Network Status</span>
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                      {selectedPlan.inNetwork ? "In-Network" : "Out-of-Network"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

