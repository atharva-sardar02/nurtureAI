/**
 * Clinician Card Component
 * Displays clinician information and available slots
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * ClinicianCard Component
 * @param {Object} props
 * @param {Object} props.clinician - Clinician data
 * @param {boolean} props.selected - Whether this clinician is selected
 * @param {Function} props.onSelect - Callback when clinician is selected
 */
export function ClinicianCard({ clinician, selected, onSelect }) {
  const formatSpecialty = (specialty) => {
    if (Array.isArray(specialty)) {
      return specialty.join(', ');
    }
    return specialty || 'General Practice';
  };

  const formatName = (name) => {
    if (!name) return 'Clinician';
    // Handle various name formats from CSV data
    if (typeof name === 'object') {
      return name.firstName && name.lastName 
        ? `${name.firstName} ${name.lastName}`
        : name.displayName || 'Clinician';
    }
    return name;
  };

  return (
    <Card
      className={cn(
        "border transition-all cursor-pointer hover:shadow-lg",
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-lg"
          : "border-border"
      )}
      onClick={() => onSelect(clinician.id)}
    >
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-semibold text-primary">
              {formatName(clinician.name || clinician.displayName || clinician.profileData?.name)?.[0] || 'C'}
            </span>
          </div>
          <h3 className="font-semibold text-lg">
            {formatName(clinician.name || clinician.displayName || clinician.profileData?.name)}
          </h3>
          <p className="text-sm text-primary font-medium">
            {clinician.title || clinician.credentials?.[0] || 'Licensed Therapist'}
          </p>
          {clinician.specialties && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatSpecialty(clinician.specialties)}
            </p>
          )}
        </div>

        {clinician.bio && (
          <p className="text-sm text-muted-foreground mb-4 text-center">{clinician.bio}</p>
        )}

        {clinician.rating && (
          <div className="flex items-center justify-center gap-2 mb-4 text-sm">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="font-semibold">{clinician.rating}</span>
            <span className="text-muted-foreground">rating</span>
          </div>
        )}

        {clinician.acceptedInsurances && clinician.acceptedInsurances.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Accepted Insurance:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {clinician.acceptedInsurances.slice(0, 3).map((insurance, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {insurance}
                </Badge>
              ))}
              {clinician.acceptedInsurances.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{clinician.acceptedInsurances.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {clinician.availableSlotCount !== undefined && (
          <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{clinician.availableSlotCount} available slots</span>
          </div>
        )}

        {clinician.fitScore !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Match Score</span>
              <span className="font-semibold">{clinician.fitScore}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${clinician.fitScore}%` }}
              />
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          variant={selected ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(clinician.id);
          }}
        >
          {selected ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Selected
            </>
          ) : (
            "Select Clinician"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}


