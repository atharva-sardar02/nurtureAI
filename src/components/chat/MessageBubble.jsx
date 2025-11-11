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
        "flex gap-2 sm:gap-4 animate-in fade-in-50 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
      role="article"
      aria-label={isUser ? "Your message" : "Assistant message"}
    >
      {!isUser && (
        <div 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1"
          aria-hidden="true"
        >
          <span className="text-xs font-semibold text-primary">AI</span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-3 rounded-2xl transition-all duration-200",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-muted text-muted-foreground rounded-bl-none"
        )}
      >
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <time
          className={cn(
            "text-xs mt-2 block",
            isUser ? "opacity-80" : "opacity-70"
          )}
          dateTime={message.timestamp instanceof Date 
            ? message.timestamp.toISOString() 
            : new Date(message.timestamp).toISOString()}
        >
          {formatTime(message.timestamp)}
        </time>
      </div>
      {isUser && (
        <div 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1"
          aria-hidden="true"
        >
          <span className="text-xs font-semibold text-accent">YOU</span>
        </div>
      )}
    </div>
  )
}

