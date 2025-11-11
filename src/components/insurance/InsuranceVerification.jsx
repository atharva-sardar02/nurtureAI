/**
 * Insurance Verification Component
 * Main component for insurance verification and coverage display
 */

import { useState } from "react"
import { InsuranceForm } from "./InsuranceForm"
import { InsuranceCardUpload } from "./InsuranceCardUpload"
import { CoverageDisplay } from "./CoverageDisplay"
import { CostEstimator } from "./CostEstimator"
import { NetworkStatus } from "./NetworkStatus"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { lookupInsurancePlan, checkCoverageStatus } from "@/services/insurance/InsuranceValidator"
import { getInsuranceProviderName, matchProviderNameToId } from "@/services/insurance/InsuranceMatcher"
import { CheckCircle2, AlertCircle, Loader2, Upload, FileText } from "lucide-react"

/**
 * InsuranceVerification Component
 * @param {Object} props
 * @param {Object} props.initialInsuranceData - Initial insurance data
 * @param {Function} props.onVerificationComplete - Callback when verification completes
 */
export function InsuranceVerification({ 
  initialInsuranceData = null,
  onVerificationComplete 
}) {
  const [insuranceData, setInsuranceData] = useState(initialInsuranceData);
  const [coverage, setCoverage] = useState(null);
  const [insuranceProviderName, setInsuranceProviderName] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [activeTab, setActiveTab] = useState("manual");

  const handleFormChange = (formData) => {
    setInsuranceData(formData);
    setError(null);
    setVerified(false);
    setCoverage(null);
  };

  const handleFormSubmit = async (formData) => {
    setVerifying(true);
    setError(null);
    setVerified(false);

    try {
      // Get insurance provider name
      const providerName = await getInsuranceProviderName(formData.provider);
      setInsuranceProviderName(providerName || formData.provider);

      // Lookup insurance plan
      const result = await lookupInsurancePlan(
        providerName || formData.provider,
        formData.memberId,
        formData.groupNumber
      );

      if (!result.success) {
        setError(result.error || 'Failed to verify insurance');
        return;
      }

      // Check coverage status
      const status = checkCoverageStatus(result.data);
      
      setCoverage({
        ...result.data,
        status: status.status,
        active: status.active,
      });
      
      setVerified(true);
      setInsuranceData(formData);

      // Notify parent
      if (onVerificationComplete) {
        onVerificationComplete({
          ...formData,
          coverage: result.data,
          status: status.status,
          active: status.active,
        });
      }
    } catch (err) {
      console.error('Error verifying insurance:', err);
      setError(err.message || 'An error occurred during verification');
    } finally {
      setVerifying(false);
    }
  };

  const handleManualVerification = async () => {
    if (!insuranceData) {
      setError('Please enter insurance information first');
      return;
    }

    await handleFormSubmit(insuranceData);
  };

  const handleOCRComplete = async (data) => {
    setOcrData(data);
    
    // Try to match provider name to provider ID
    let providerId = null;
    if (data.provider) {
      providerId = await matchProviderNameToId(data.provider);
    }
    
    setInsuranceData(prev => ({
      ...prev,
      memberId: data.memberId || prev?.memberId,
      groupNumber: data.groupNumber || prev?.groupNumber,
      provider: providerId || prev?.provider,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Tab Selection: OCR Upload vs Manual Entry */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Card
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          {/* Insurance Form */}
          <InsuranceForm
            initialData={insuranceData}
            ocrData={ocrData}
            onSubmit={handleFormSubmit}
            onChange={handleFormChange}
            loading={verifying}
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          {/* Insurance Card Upload */}
          <InsuranceCardUpload
            onOCRComplete={handleOCRComplete}
            onError={(err) => setError(err.message)}
          />
          
          {/* Show form after OCR for editing */}
          {ocrData && (
            <InsuranceForm
              initialData={insuranceData}
              ocrData={ocrData}
              onSubmit={handleFormSubmit}
              onChange={handleFormChange}
              loading={verifying}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Verification Status */}
      {verifying && (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verifying insurance coverage...</p>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && !verifying && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          {insuranceData && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleManualVerification}
            >
              Try Again
            </Button>
          )}
        </Alert>
      )}

      {/* Success Display */}
      {verified && coverage && (
        <div className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Insurance coverage verified successfully!
            </AlertDescription>
          </Alert>

          {/* Coverage Display */}
          <CoverageDisplay
            coverage={coverage}
            inNetwork={true} // This would be determined by clinician matching
            insuranceProvider={insuranceProviderName}
          />

          {/* Cost Estimator */}
          <CostEstimator coverage={coverage} />
        </div>
      )}
    </div>
  );
}

