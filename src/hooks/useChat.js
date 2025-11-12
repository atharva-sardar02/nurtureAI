/**
 * useChat Hook
 * Manages chat state and interactions
 */

import { useState, useRef, useEffect, useCallback } from "react"
import { StructuredAssessmentEngine, ASSESSMENT_PHASES } from "@/services/ai/StructuredAssessmentEngine"
import { useAuth } from "@/contexts/AuthContext"
import { saveConversation } from "@/services/firebase/firestore"

export function useChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [crisisDetected, setCrisisDetected] = useState(false)
  const [assessmentData, setAssessmentData] = useState(null)
  const [progress, setProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const engineRef = useRef(null)
  const savedConversationRef = useRef(false) // Track if conversation has been saved

  // Initialize structured assessment engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new StructuredAssessmentEngine()
      
      // Get first question from structured engine
      const firstQuestion = engineRef.current.getCurrentQuestion()
      const initialMessage = {
        id: "1",
        role: "assistant",
        content: firstQuestion ? firstQuestion.question : "Hello! I'm here to help you understand your child's mental health needs. This conversation is completely confidential and non-judgmental.",
        timestamp: new Date(),
      }
      setMessages([initialMessage])
      setCurrentPhase(ASSESSMENT_PHASES.QUESTION_1_AGE)
      setProgress(0)
    }
  }, [])

  /**
   * Send a message and get AI response using structured assessment flow
   */
  const sendMessage = useCallback(
    async (userMessage, options = {}) => {
      if (!userMessage.trim() || isLoading || isComplete) return

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

        // Process response using structured assessment engine
        const result = await engineRef.current.processResponse(
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

        // Update assessment data and progress
        if (result.assessmentData) {
          setAssessmentData(result.assessmentData)
          setProgress(result.progress || 0)
          setCurrentPhase(result.currentPhase)
          setIsComplete(result.isComplete || false)
          
          if (result.assessmentData.crisisDetected || result.crisisDetected) {
            setCrisisDetected(true)
          }
          
          // Auto-save conversation when assessment is complete
          const updatedMessages = [...messages, userMsg]
          if (!options.stream) {
            updatedMessages.push({
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: result.message,
              timestamp: new Date(),
            })
          }
          
          // Auto-save if assessment is complete or we have enough progress
          const shouldAutoSave = 
            !savedConversationRef.current && 
            user && 
            (result.isComplete || result.progress >= 50 || result.assessmentData.completed)
          
          if (shouldAutoSave && user) {
            // Save conversation asynchronously (don't block UI)
            setTimeout(async () => {
              try {
                const assessmentSummary = engineRef.current.getAssessmentSummary()
                const saveResult = await saveConversation(
                  user.uid,
                  updatedMessages,
                  assessmentSummary,
                  null
                )
                if (saveResult.success) {
                  savedConversationRef.current = true
                  console.log('✅ Conversation auto-saved:', saveResult.conversationId)
                }
              } catch (err) {
                console.error('Error auto-saving conversation:', err)
              }
            }, 1500) // Small delay to ensure state is updated
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
    [isLoading, isComplete, messages, user]
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
    setProgress(0)
    setCurrentPhase(null)
    setIsComplete(false)
    setIsLoading(false)
    savedConversationRef.current = false
    
    // Re-initialize with first question
    const firstQuestion = engineRef.current.getCurrentQuestion()
    if (firstQuestion) {
      const initialMessage = {
        id: "1",
        role: "assistant",
        content: firstQuestion.question,
        timestamp: new Date(),
      }
      setMessages([initialMessage])
      setCurrentPhase(ASSESSMENT_PHASES.QUESTION_1_AGE)
    }
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

      if (result.success) {
        savedConversationRef.current = true
      }

      return result
    },
    [user, messages]
  )

  // Auto-save conversation when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Save conversation on unmount if not already saved and we have enough messages
      if (!savedConversationRef.current && user && engineRef.current && messages.length > 2) {
        const userMessageCount = messages.filter(m => m.role === "user").length
        if (userMessageCount >= 2) {
          const assessmentSummary = engineRef.current.getAssessmentSummary()
          saveConversation(
            user.uid,
            messages,
            assessmentSummary,
            null
          ).catch(err => {
            console.error('Error saving conversation on unmount:', err)
          })
        }
      }
    }
  }, [user, messages])

  return {
    messages,
    isLoading,
    error,
    crisisDetected,
    assessmentData,
    progress,
    currentPhase,
    isComplete,
    sendMessage,
    resetChat,
    getAssessmentSummary,
    saveConversationToFirestore,
  }
}

