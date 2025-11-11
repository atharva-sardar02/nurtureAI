/**
 * Organization Link Component
 * Displays organization relationship if applicable
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { getOrganization } from "@/services/referrals/ReferralTracker"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"

/**
 * OrganizationLink Component
 * @param {Object} props
 * @param {string} props.organizationId - Organization ID
 * @param {Object} props.referral - Referral data (optional, for context)
 */
export function OrganizationLink({ organizationId, referral }) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOrganization() {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        const result = await getOrganization(organizationId);
        if (result.success && result.organization) {
          setOrganization(result.organization);
        } else {
          setError(result.error || 'Organization not found');
        }
      } catch (err) {
        console.error('Error loading organization:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrganization();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoadingSpinner size="sm" />
        <span>Loading organization information...</span>
      </div>
    );
  }

  if (error || !organization) {
    return null; // Don't show anything if organization not found
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Organization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="font-semibold">{organization.name || organization.organizationName || 'Organization'}</p>
            {organization.type && (
              <Badge variant="outline" className="mt-1 text-xs">
                {organization.type}
              </Badge>
            )}
          </div>
          {organization.website && (
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Visit Website
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

