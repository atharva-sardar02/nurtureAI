/**
 * Insurance Form Component
 * Standalone insurance information form with validation
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateInsuranceData } from "@/services/insurance/InsuranceValidator"
import { getAllInsuranceProviders } from "@/services/insurance/InsuranceMatcher"
import { AlertCircle, Loader2 } from "lucide-react"

/**
 * InsuranceForm Component
 * @param {Object} props
 * @param {Object} props.initialData - Initial form data
 * @param {Object} props.ocrData - OCR extracted data to auto-populate
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {Function} props.onChange - Callback when form data changes
 * @param {boolean} props.loading - Loading state
 */
export function InsuranceForm({ 
  initialData = {}, 
  ocrData = null,
  onSubmit, 
  onChange,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    provider: initialData?.provider || '',
    memberId: initialData?.memberId || '',
    groupNumber: initialData?.groupNumber || '',
  });
  
  const [providers, setProviders] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Load insurance providers
  useEffect(() => {
    loadProviders();
  }, []);

  // Update form when initialData changes (e.g., from membership pre-fill)
  useEffect(() => {
    if (initialData && (initialData.provider || initialData.memberId || initialData.groupNumber)) {
      setFormData(prev => ({
        provider: initialData.provider || prev.provider,
        memberId: initialData.memberId || prev.memberId,
        groupNumber: initialData.groupNumber || prev.groupNumber,
      }));
    }
  }, [initialData]);

  // Auto-populate from OCR data
  useEffect(() => {
    if (ocrData) {
      setFormData(prev => ({
        ...prev,
        memberId: ocrData.memberId || prev.memberId,
        groupNumber: ocrData.groupNumber || prev.groupNumber,
        // Provider will be matched from OCR provider name
        provider: ocrData.providerId || prev.provider,
      }));
    }
  }, [ocrData]);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const loadProviders = async () => {
    try {
      setLoadingProviders(true);
      const insuranceProviders = await getAllInsuranceProviders();
      setProviders(insuranceProviders);
    } catch (error) {
      console.error('Error loading insurance providers:', error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateInsuranceData(formData);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Information</CardTitle>
        <CardDescription>
          Enter your insurance details to verify coverage and find in-network providers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Insurance Provider */}
          <div className="space-y-2">
            <Label htmlFor="provider">
              Insurance Provider <span className="text-destructive">*</span>
            </Label>
            {loadingProviders ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading providers...
              </div>
            ) : (
              <Select
                value={formData.provider}
                onValueChange={(value) => handleChange('provider', value)}
              >
                <SelectTrigger id="provider" className={errors.provider ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your insurance provider" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.provider && (
              <p className="text-sm text-destructive">{errors.provider}</p>
            )}
          </div>

          {/* Member ID */}
          <div className="space-y-2">
            <Label htmlFor="memberId">
              Member ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="memberId"
              placeholder="Enter your member ID"
              value={formData.memberId}
              onChange={(e) => handleChange('memberId', e.target.value)}
              className={errors.memberId ? 'border-destructive' : ''}
              required
            />
            {errors.memberId && (
              <p className="text-sm text-destructive">{errors.memberId}</p>
            )}
          </div>

          {/* Group Number */}
          <div className="space-y-2">
            <Label htmlFor="groupNumber">
              Group Number (Optional)
              {ocrData?.groupNumber && (
                <span className="text-xs text-muted-foreground ml-2">
                  (from OCR)
                </span>
              )}
            </Label>
            <Input
              id="groupNumber"
              placeholder="Enter group number if applicable"
              value={formData.groupNumber}
              onChange={(e) => handleChange('groupNumber', e.target.value)}
              className={errors.groupNumber ? 'border-destructive' : ''}
            />
            {errors.groupNumber && (
              <p className="text-sm text-destructive">{errors.groupNumber}</p>
            )}
          </div>

          {/* Error Alert */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please correct the errors above before submitting.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          {onSubmit && (
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Insurance'
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

