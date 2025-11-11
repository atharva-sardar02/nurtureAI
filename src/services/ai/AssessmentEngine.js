/**
 * Assessment Engine
 * Manages conversation flow and assessment logic for mental health screening
 */

import { createChatCompletion, createStreamingChatCompletion } from "./openai.js"

/**
 * System prompt for mental health assessment
 */
const SYSTEM_PROMPT = `You are a compassionate and professional AI assistant helping parents understand their child's mental health needs. Your role is to:

1. Conduct a supportive, non-judgmental conversation
2. Gather information about the child's symptoms, behaviors, and concerns
3. Assess whether the child might benefit from mental health services
4. Provide empathetic responses while maintaining professional boundaries
5. Identify any crisis situations that require immediate attention
6. Guide parents toward appropriate resources

Important guidelines:
- This is NOT a diagnosis - you are screening, not diagnosing
- Always be empathetic and supportive
- If you detect crisis indicators (self-harm, suicide, violence), acknowledge the concern and recommend immediate professional help
- If the child doesn't seem to be a fit for services, suggest alternative resources
- Keep responses concise but warm
- Ask follow-up questions to understand the situation better
- Use age-appropriate language when discussing children/adolescents

Start by asking about what concerns the parent has noticed.`

/**
 * Assessment Engine Class
 */
export class AssessmentEngine {
  constructor() {
    this.messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
    ]
    this.assessmentData = {
      concerns: [],
      symptoms: [],
      severity: null,
      suitability: null,
      crisisDetected: false,
      alternativeResources: [],
    }
  }

  /**
   * Add a user message and get AI response
   * @param {string} userMessage - User's message
   * @param {Function} onStreamChunk - Optional callback for streaming chunks
   * @returns {Promise<Object>} Response object with AI message and assessment updates
   */
  async processMessage(userMessage, onStreamChunk = null) {
    // Add user message to conversation
    this.messages.push({
      role: "user",
      content: userMessage,
    })

    // Get AI response
    let result
    if (onStreamChunk) {
      let fullResponse = ""
      result = await createStreamingChatCompletion(
        this.messages,
        (chunk) => {
          fullResponse += chunk
          onStreamChunk(chunk)
        },
        {
          temperature: 0.7,
          max_tokens: 500,
        }
      )
      if (result.success) {
        result.content = fullResponse
      }
    } else {
      result = await createChatCompletion(this.messages, {
        temperature: 0.7,
        max_tokens: 500,
      })
    }

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      }
    }

    // Add assistant response to conversation
    const assistantMessage = {
      role: "assistant",
      content: result.content,
    }
    this.messages.push(assistantMessage)

    // Update assessment data based on conversation
    this.updateAssessmentData(userMessage, result.content)

    return {
      success: true,
      message: assistantMessage.content,
      assessmentData: { ...this.assessmentData },
    }
  }

  /**
   * Update assessment data based on conversation
   * @param {string} userMessage - User's message
   * @param {string} aiResponse - AI's response
   */
  updateAssessmentData(userMessage, aiResponse) {
    // Simple keyword-based assessment (can be enhanced with NLP)
    const lowerUserMessage = userMessage.toLowerCase()
    const lowerAiResponse = aiResponse.toLowerCase()

    // Check for crisis indicators
    const crisisKeywords = [
      "suicide",
      "self-harm",
      "hurting myself",
      "kill myself",
      "end my life",
      "violence",
      "hurting others",
    ]
    if (crisisKeywords.some((keyword) => lowerUserMessage.includes(keyword))) {
      this.assessmentData.crisisDetected = true
    }

    // Extract concerns (simple pattern matching)
    if (lowerUserMessage.includes("concern") || lowerUserMessage.includes("worried")) {
      // Extract concern context (simplified)
      this.assessmentData.concerns.push(userMessage)
    }

    // Determine suitability (simplified logic)
    if (
      lowerAiResponse.includes("not a fit") ||
      lowerAiResponse.includes("alternative resources")
    ) {
      this.assessmentData.suitability = "not_suitable"
    } else if (
      lowerAiResponse.includes("benefit") ||
      lowerAiResponse.includes("helpful")
    ) {
      this.assessmentData.suitability = "suitable"
    }
  }

  /**
   * Get current assessment summary
   * @returns {Object} Assessment summary
   */
  getAssessmentSummary() {
    return {
      ...this.assessmentData,
      messageCount: this.messages.length - 1, // Exclude system message
      conversationLength: this.messages
        .slice(1)
        .reduce((acc, msg) => acc + msg.content.length, 0),
    }
  }

  /**
   * Reset the assessment engine
   */
  reset() {
    this.messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
    ]
    this.assessmentData = {
      concerns: [],
      symptoms: [],
      severity: null,
      suitability: null,
      crisisDetected: false,
      alternativeResources: [],
    }
  }

  /**
   * Get conversation history
   * @returns {Array} Array of messages
   */
  getConversationHistory() {
    return this.messages.slice(1) // Exclude system message
  }
}

export default AssessmentEngine

