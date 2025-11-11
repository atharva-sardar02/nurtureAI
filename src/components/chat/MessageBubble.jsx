/**
 * Message Bubble Component
 * Displays individual chat messages
 */

import { cn } from "@/lib/utils"
import { formatTime } from "@/utils/dateHelpers"

export function MessageBubble({ message, isUser }) {
  return (
    <div
      className={cn(
        "flex gap-4 animate-in fade-in-50 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xs font-semibold text-primary">AI</span>
        </div>
      )}
      <div
        className={cn(
          "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-muted text-muted-foreground rounded-bl-none"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <span
          className={cn(
            "text-xs mt-2 block",
            isUser ? "opacity-80" : "opacity-70"
          )}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xs font-semibold text-accent">YOU</span>
        </div>
      )}
    </div>
  )
}

