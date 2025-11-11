/**
 * Referral Info Component
 * Displays referral source information
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Building2, Info } from "lucide-react"
import { formatReferralInfo } from "@/services/referrals/ReferralTracker"

/**
 * ReferralInfo Component
 * @param {Object} props
 * @param {Object} props.referral - Referral data object
 * @param {boolean} props.compact - Show compact version (default: false)
 */
export function ReferralInfo({ referral, compact = false }) {
  if (!referral) {
    return null;
  }

  const referralInfo = formatReferralInfo(referral);

  if (!referralInfo || !referralInfo.sourceName) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <UserPlus className="w-4 h-4" />
        <span>Referred by {referralInfo.sourceName}</span>
      </div>
    );
  }

  return (
    <Card className="border border-border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Referral Information
        </CardTitle>
        <CardDescription>
          Information about how you were referred to our services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Referral Source</p>
              <p className="font-semibold text-lg">{referralInfo.sourceName}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {referralInfo.sourceType}
            </Badge>
          </div>
        </div>

        {referralInfo.members && referralInfo.members.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Referral Participants</p>
            <div className="space-y-2">
              {referralInfo.members.map((member, index) => (
                <div key={member.id || index} className="flex items-center gap-2 text-sm p-2 bg-muted/20 rounded">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{member.name || member.memberName || 'Participant'}</span>
                  {member.role && (
                    <Badge variant="outline" className="text-xs ml-auto">
                      {member.role}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This information helps us understand how you found us and ensures we can provide the best support for your needs.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

