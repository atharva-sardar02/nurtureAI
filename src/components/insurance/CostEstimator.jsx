/**
 * Cost Estimator Component
 * Main component for displaying cost estimates
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CostBreakdown } from "./CostBreakdown"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

/**
 * CostEstimator Component
 * @param {Object} props
 * @param {Object} props.coverage - Insurance coverage data
 */
export function CostEstimator({ coverage }) {
  const [sessionCost, setSessionCost] = useState(150);
  const [sessionsPerYear, setSessionsPerYear] = useState(12);

  if (!coverage) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please verify your insurance coverage first to see cost estimates.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cost Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Estimation Settings</CardTitle>
          <CardDescription>
            Adjust these values to customize your cost estimate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionCost">Cost Per Session ($)</Label>
              <Input
                id="sessionCost"
                type="number"
                min="0"
                step="1"
                value={sessionCost}
                onChange={(e) => setSessionCost(Number(e.target.value) || 150)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionsPerYear">Sessions Per Year</Label>
              <Input
                id="sessionsPerYear"
                type="number"
                min="1"
                step="1"
                value={sessionsPerYear}
                onChange={(e) => setSessionsPerYear(Number(e.target.value) || 12)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <CostBreakdown
        coverage={coverage}
        sessionCost={sessionCost}
        sessionsPerYear={sessionsPerYear}
      />
    </div>
  );
}

