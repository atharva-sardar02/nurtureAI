import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function AssessmentChat() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm here to help you understand your child's mental health needs. This conversation is completely confidential and non-judgmental. Let's start by getting to know a bit about what's bringing you here today. What concerns have you noticed in your child recently?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content:
        "Thank you for sharing that. I appreciate your openness. Can you tell me a bit more about how this has been affecting your child's daily life—at school, with friends, or at home?",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4 animate-in fade-in-50 duration-300",
              message.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-semibold text-primary">AI</span>
              </div>
            )}
            <div
              className={cn(
                "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-muted-foreground rounded-bl-none",
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <span className="text-xs opacity-70 mt-2 block">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-semibold text-accent">YOU</span>
              </div>
            )}
          </div>
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-6 bg-muted/30">
        <div className="flex gap-2">
          <Input
            placeholder="Share your thoughts here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
            className="text-sm"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This conversation is confidential and will be reviewed by our clinical team.
        </p>
      </div>
    </div>
  )
}

