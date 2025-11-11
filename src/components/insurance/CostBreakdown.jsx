/**
 * Cost Breakdown Component
 * Displays detailed cost breakdown for insurance coverage
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, Info, AlertCircle } from "lucide-react"
import { calculateSessionCost, calculateAnnualCost, formatCurrency } from "@/services/insurance/InsuranceCalculator"

/**
 * CostBreakdown Component
 * @param {Object} props
 * @param {Object} props.coverage - Insurance coverage data
 * @param {number} props.sessionCost - Base cost per session (default: $150)
 * @param {number} props.sessionsPerYear - Number of sessions per year (default: 12)
 */
export function CostBreakdown({ coverage, sessionCost = 150, sessionsPerYear = 12 }) {
  if (!coverage) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No coverage information available for cost calculation
        </CardContent>
      </Card>
    );
  }

  const sessionBreakdown = calculateSessionCost(coverage, sessionCost);
  const annualBreakdown = calculateAnnualCost(coverage, sessionsPerYear, sessionCost);

  return (
    <div className="space-y-4">
      {/* Per Session Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Cost Per Session
          </CardTitle>
          <CardDescription>Estimated out-of-pocket cost for each session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Session Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(sessionBreakdown.sessionCost)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">You Pay</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(sessionBreakdown.outOfPocket)}</p>
            </div>
          </div>

          {sessionBreakdown.insurancePays > 0 && (
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Insurance Covers</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(sessionBreakdown.insurancePays)}
                </span>
              </div>
            </div>
          )}

          {sessionBreakdown.message && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">{sessionBreakdown.message}</AlertDescription>
            </Alert>
          )}

          {sessionBreakdown.deductibleRemaining > 0 && (
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Deductible Remaining</span>
                <Badge variant="secondary">{formatCurrency(sessionBreakdown.deductibleRemaining)}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Annual Estimate */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Estimate</CardTitle>
          <CardDescription>
            Estimated costs for {sessionsPerYear} sessions per year
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Annual Cost</p>
              <p className="text-xl font-bold">{formatCurrency(annualBreakdown.totalCost)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Your Total Out-of-Pocket</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(annualBreakdown.totalOutOfPocket)}</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Average Per Session</span>
              <span className="text-sm font-semibold">{formatCurrency(annualBreakdown.averagePerSession)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Insurance Covers</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(annualBreakdown.totalInsurancePays)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimers */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Important:</strong> These are estimates based on the coverage information provided.
          Actual costs may vary based on your specific plan, network status, and other factors.
          Please verify with your insurance provider for accurate cost information.
        </AlertDescription>
      </Alert>
    </div>
  );
}

