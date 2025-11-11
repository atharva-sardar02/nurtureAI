/**
 * Kinship Selector Component
 * Selects parent/guardian relationship with consent eligibility
 */

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { getAllKinshipMappings, getKinshipMapping } from "@/utils/kinshipMapping"

/**
 * KinshipSelector Component
 * @param {Object} props
 * @param {Object} props.value - Current kinship value {code, label, consentEligible}
 * @param {Function} props.onChange - Callback when kinship changes
 * @param {string} props.error - Error message to display
 */
export function KinshipSelector({ value, onChange, error }) {
  const kinshipMappings = getAllKinshipMappings()

  const handleChange = (codeStr) => {
    const code = parseInt(codeStr, 10)
    const mapping = getKinshipMapping(code)
    onChange({
      code,
      label: mapping.label,
      consentEligible: mapping.consentEligible,
    })
  }

  // Format label for display
  const formatLabel = (label) => {
    // Convert camelCase to Title Case
    return label
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="kinship">
        Your Relationship to the Child <span className="text-destructive">*</span>
      </Label>
      <Select
        value={value?.code?.toString() || ""}
        onValueChange={handleChange}
      >
        <SelectTrigger id="kinship" className={error ? "border-destructive" : ""}>
          <SelectValue placeholder="Select relationship..." />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(kinshipMappings).map(([code, mapping]) => (
            <SelectItem key={code} value={code}>
              {formatLabel(mapping.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {value && !value.consentEligible && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This relationship may require additional documentation to provide consent for treatment.
            You may be asked to provide proof of legal guardianship.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

