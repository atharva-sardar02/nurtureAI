/**
 * Loading Spinner Component
 * Reusable loading indicator component
 */

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingSpinner({ 
  size = "default", 
  className,
  text 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size] || sizeClasses.default)} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

/**
 * Full Page Loading Spinner
 */
export function FullPageSpinner({ text = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

/**
 * Inline Loading Spinner
 */
export function InlineSpinner({ className }) {
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <LoadingSpinner size="sm" />
    </div>
  )
}

