/**
 * Chat Interface Component
 * Main chat UI with message history and input
 */

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { MessageBubble } from "./MessageBubble"
import { CrisisDetection } from "./CrisisDetection"
import { useChat } from "@/hooks/useChat"
import { cn } from "@/lib/utils"

export function ChatInterface({ onAssessmentComplete }) {
  const {
    messages,
    isLoading,
    error,
    crisisDetected,
    sendMessage,
    getAssessmentSummary,
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
    if (!input.trim() || isLoading) return

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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Crisis Detection Alert */}
      {showCrisisAlert && (
        <div className="p-4 border-b border-destructive/20">
          <CrisisDetection
            onDismiss={() => setShowCrisisAlert(false)}
          />
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isUser={message.role === "user"}
          />
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start animate-in fade-in-50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
              <span className="text-xs font-semibold text-primary">AI</span>
            </div>
            <div className="bg-muted text-muted-foreground px-4 py-3 rounded-2xl rounded-bl-none">
              <div className="flex gap-2 items-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-4 justify-start">
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-2xl rounded-bl-none">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-6 bg-muted/30">
        <div className="flex gap-2">
          <Input
            placeholder="Share your thoughts here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="text-sm"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This conversation is confidential and will be reviewed by our clinical
          team.
        </p>
      </div>
    </div>
  )
}

