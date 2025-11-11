/**
 * Crisis Detection Component
 * Displays crisis resources when crisis indicators are detected
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Phone, MessageSquare } from "lucide-react"
import { CRISIS_RESOURCES } from "@/utils/constants"

// Map constants to match the structure
const CRISIS_MAP = {
  CRISIS_TEXT_LINE: CRISIS_RESOURCES.CRISIS_TEXT_LINE,
  SUICIDE_LIFELINE: CRISIS_RESOURCES.SUICIDE_LIFELINE,
  EMERGENCY: CRISIS_RESOURCES.EMERGENCY,
}

export function CrisisDetection({ onDismiss }) {
  return (
    <Alert variant="destructive" className="mb-4 border-2">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">
        Immediate Support Available
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">
          If you or your child are experiencing a mental health crisis, please
          reach out to these resources immediately:
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
            <Phone className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {CRISIS_MAP.SUICIDE_LIFELINE.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {CRISIS_MAP.SUICIDE_LIFELINE.text}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="text-xs"
            >
              <a href={`tel:${CRISIS_MAP.SUICIDE_LIFELINE.phone}`}>
                Call {CRISIS_MAP.SUICIDE_LIFELINE.phone}
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
            <MessageSquare className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {CRISIS_MAP.CRISIS_TEXT_LINE.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {CRISIS_MAP.CRISIS_TEXT_LINE.text}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="text-xs"
            >
              <a
                href={`sms:${CRISIS_MAP.CRISIS_TEXT_LINE.phone}`}
              >
                Text {CRISIS_MAP.CRISIS_TEXT_LINE.phone}
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {CRISIS_MAP.EMERGENCY.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {CRISIS_MAP.EMERGENCY.text}
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              asChild
              className="text-xs"
            >
              <a href={`tel:${CRISIS_MAP.EMERGENCY.phone}`}>
                Call {CRISIS_MAP.EMERGENCY.phone}
              </a>
            </Button>
          </div>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="mt-2 w-full"
          >
            I understand, continue conversation
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

