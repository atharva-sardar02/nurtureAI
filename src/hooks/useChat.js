/**
 * useChat Hook
 * Manages chat state and interactions
 */

import { useState, useRef, useEffect, useCallback } from "react"
import { AssessmentEngine } from "@/services/ai/AssessmentEngine"
import { useAuth } from "@/contexts/AuthContext"
import { saveConversation } from "@/services/firebase/firestore"

export function useChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [crisisDetected, setCrisisDetected] = useState(false)
  const [assessmentData, setAssessmentData] = useState(null)
  const engineRef = useRef(null)

  // Initialize assessment engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new AssessmentEngine()
      
      // Add initial greeting message
      const initialMessage = {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm here to help you understand your child's mental health needs. This conversation is completely confidential and non-judgmental. Let's start by getting to know a bit about what's bringing you here today. What concerns have you noticed in your child recently?",
        timestamp: new Date(),
      }
      setMessages([initialMessage])
    }
  }, [])

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(
    async (userMessage, options = {}) => {
      if (!userMessage.trim() || isLoading) return

      setError(null)
      setIsLoading(true)

      // Add user message
      const userMsg = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])

      try {
        let assistantContent = ""
        let fullResponse = ""

        // Process message with streaming if requested
        const result = await engineRef.current.processMessage(
          userMessage,
          options.stream
            ? (chunk) => {
                fullResponse += chunk
                assistantContent = fullResponse
                // Update streaming message
                setMessages((prev) => {
                  const newMessages = [...prev]
                  const lastMsg = newMessages[newMessages.length - 1]
                  if (lastMsg && lastMsg.role === "assistant") {
                    lastMsg.content = assistantContent
                  } else {
                    newMessages.push({
                      id: (Date.now() + 1).toString(),
                      role: "assistant",
                      content: assistantContent,
                      timestamp: new Date(),
                    })
                  }
                  return newMessages
                })
              }
            : null
        )

        if (!result.success) {
          throw new Error(result.error || "Failed to get response")
        }

        // Add assistant message (if not streaming)
        if (!options.stream) {
          const assistantMsg = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: result.message,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, assistantMsg])
        }

        // Update assessment data
        if (result.assessmentData) {
          setAssessmentData(result.assessmentData)
          if (result.assessmentData.crisisDetected) {
            setCrisisDetected(true)
          }
        }
      } catch (err) {
        console.error("Chat error:", err)
        setError(err.message || "Failed to send message")
        
        // Add error message
        const errorMsg = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
          timestamp: new Date(),
          error: true,
        }
        setMessages((prev) => [...prev, errorMsg])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading]
  )

  /**
   * Reset the chat
   */
  const resetChat = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset()
    }
    setMessages([])
    setError(null)
    setCrisisDetected(false)
    setAssessmentData(null)
    setIsLoading(false)
  }, [])

  /**
   * Get assessment summary
   */
  const getAssessmentSummary = useCallback(() => {
    if (engineRef.current) {
      return engineRef.current.getAssessmentSummary()
    }
    return null
  }, [])

  /**
   * Save conversation to Firestore
   */
  const saveConversationToFirestore = useCallback(
    async (onboardingApplicationId = null) => {
      if (!user || !engineRef.current) {
        return { success: false, error: "User not authenticated" }
      }

      const assessmentSummary = engineRef.current.getAssessmentSummary()
      const result = await saveConversation(
        user.uid,
        messages,
        assessmentSummary,
        onboardingApplicationId
      )

      return result
    },
    [user, messages]
  )

  return {
    messages,
    isLoading,
    error,
    crisisDetected,
    assessmentData,
    sendMessage,
    resetChat,
    getAssessmentSummary,
    saveConversationToFirestore,
  }
}

