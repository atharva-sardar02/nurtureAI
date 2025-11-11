/**
 * Coverage Display Component
 * Shows insurance coverage details and benefits
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NetworkStatus } from "./NetworkStatus"
import { DollarSign, Shield, AlertCircle, Info } from "lucide-react"
// Currency formatting utility

/**
 * Format currency (fallback if not in dateHelpers)
 */
function formatCurrencyValue(value) {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return value || 'N/A';
}

/**
 * CoverageDisplay Component
 * @param {Object} props
 * @param {Object} props.coverage - Coverage data object
 * @param {boolean} props.inNetwork - Whether coverage is in-network
 * @param {string} props.insuranceProvider - Insurance provider name
 */
export function CoverageDisplay({ coverage, inNetwork = true, insuranceProvider }) {
  if (!coverage) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No coverage information available
        </CardContent>
      </Card>
    );
  }

  const copay = coverage.copay || coverage.copayAmount || null;
  const deductible = coverage.deductible || null;
  const coveragePercent = coverage.coverage || coverage.coveragePercent || null;
  const outOfPocketMax = coverage.outOfPocketMax || coverage.outOfPocketMaximum || null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Coverage Details
            </CardTitle>
            <CardDescription>
              {insuranceProvider || 'Insurance'} Coverage Information
            </CardDescription>
          </div>
          <NetworkStatus inNetwork={inNetwork} status={inNetwork ? 'in-network' : 'out-of-network'} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coverage Summary */}
        <div className="grid grid-cols-2 gap-4">
          {copay !== null && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Copay</span>
              </div>
              <p className="text-lg font-semibold">{formatCurrencyValue(copay)}</p>
            </div>
          )}
          
          {deductible !== null && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Deductible</span>
              </div>
              <p className="text-lg font-semibold">{formatCurrencyValue(deductible)}</p>
            </div>
          )}
          
          {coveragePercent !== null && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Coverage</span>
              </div>
              <p className="text-lg font-semibold">{coveragePercent}%</p>
            </div>
          )}
          
          {outOfPocketMax !== null && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Out-of-Pocket Max</span>
              </div>
              <p className="text-lg font-semibold">{formatCurrencyValue(outOfPocketMax)}</p>
            </div>
          )}
        </div>

        {/* Coverage Status */}
        {coverage.verificationStatus && (
          <div>
            <Badge
              variant={
                coverage.verificationStatus === 'verified' ? 'default' : 'secondary'
              }
            >
              {coverage.verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
            </Badge>
          </div>
        )}

        {/* Disclaimers */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Coverage information is based on the data provided. Actual benefits may vary.
            Please verify with your insurance provider for the most accurate information.
          </AlertDescription>
        </Alert>

        {!inNetwork && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This provider is out-of-network. You may be responsible for higher costs.
              Please check with your insurance provider for out-of-network benefits.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

