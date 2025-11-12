/**
 * Chat Interface Component
 * Main chat UI with message history and input
 */

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Send, Loader2, CheckCircle2 } from "lucide-react"
import { MessageBubble } from "./MessageBubble"
import { CrisisDetection } from "./CrisisDetection"
import { useChat } from "@/hooks/useChat"

export function ChatInterface() {
  const navigate = useNavigate()
  const {
    messages,
    isLoading,
    error,
    crisisDetected,
    progress,
    currentPhase,
    isComplete,
    sendMessage,
  } = useChat()
  const [input, setInput] = useState("")
  const [showCrisisAlert, setShowCrisisAlert] = useState(false)
  const messagesEndRef = useRef(null)

  // Show crisis alert when detected
  useEffect(() => {
    if (crisisDetected && !showCrisisAlert) {
      setShowCrisisAlert(true)
    }
  }, [crisisDetected, showCrisisAlert])

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || isComplete) return

    const message = input.trim()
    setInput("")
    await sendMessage(message, { stream: false })
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleContinueToOnboarding = () => {
    navigate("/assessment")
  }

  return (
    <div className="flex flex-col h-full bg-background" role="main" aria-label="Chat interface">
      {/* Progress Bar */}
      {progress > 0 && !isComplete && (
        <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Assessment Progress
            </span>
            <span className="text-xs font-semibold text-primary">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Crisis Detection Alert */}
      {showCrisisAlert && (
        <div className="p-3 sm:p-4 border-b border-destructive/20" role="alert" aria-live="assertive">
          <CrisisDetection
            onDismiss={() => setShowCrisisAlert(false)}
          />
        </div>
      )}

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <p className="text-muted-foreground text-sm sm:text-base">
              Start a conversation by typing a message below. I&apos;m here to help you understand your child&apos;s mental health needs.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.role === "user"}
            />
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in-50 duration-300">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
              <span className="text-xs font-semibold text-primary">AI</span>
            </div>
            <div className="bg-muted text-muted-foreground px-3 py-2 sm:px-4 sm:py-3 rounded-2xl rounded-bl-none max-w-[85%] sm:max-w-[75%]">
              <div className="flex gap-2 items-center">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-3 sm:gap-4 justify-start" role="alert" aria-live="assertive">
            <div className="bg-destructive/10 text-destructive px-3 py-2 sm:px-4 sm:py-3 rounded-2xl rounded-bl-none max-w-[85%] sm:max-w-[75%]">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 sm:p-6 bg-muted/30 flex-shrink-0">
        {isComplete ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary mb-1">
                  Assessment Complete
                </p>
                <p className="text-xs text-muted-foreground">
                  Thank you for completing the assessment. Your responses have been saved and will be reviewed by our clinical team.
                </p>
              </div>
            </div>
            <Button
              onClick={handleContinueToOnboarding}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              Continue to Onboarding
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Share your thoughts here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isComplete}
                className="text-sm min-h-[44px] sm:min-h-[40px]"
                aria-label="Message input"
                aria-describedby="chat-input-help"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading || isComplete}
                className="bg-primary hover:bg-primary/90 min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] transition-all duration-200"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="w-4 h-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            <p id="chat-input-help" className="text-xs text-muted-foreground mt-2">
              This conversation is confidential and will be reviewed by our clinical
              team.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

