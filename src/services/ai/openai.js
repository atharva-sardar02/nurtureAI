/**
 * OpenAI API Service
 * Handles communication with OpenAI API for chat completions
 */

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
const DEFAULT_MODEL = "gpt-4-turbo-preview" // Can be changed to gpt-4 or gpt-3.5-turbo

/**
 * Get OpenAI API key from environment variables
 * @returns {string} API key
 */
function getApiKey() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      "OpenAI API key is missing. Please set VITE_OPENAI_API_KEY in your .env file."
    )
  }
  return apiKey
}

/**
 * Create a chat completion with OpenAI API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options (temperature, max_tokens, etc.)
 * @returns {Promise<Object>} API response
 */
export async function createChatCompletion(messages, options = {}) {
  const apiKey = getApiKey()

  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    max_tokens = 1000,
    stream = false,
  } = options

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `OpenAI API error: ${response.statusText}`
      )
    }

    const data = await response.json()
    return {
      success: true,
      content: data.choices[0]?.message?.content || "",
      usage: data.usage,
      model: data.model,
    }
  } catch (error) {
    console.error("OpenAI API error:", error)
    return {
      success: false,
      error: error.message || "Failed to get response from OpenAI",
    }
  }
}

/**
 * Create a streaming chat completion
 * @param {Array} messages - Array of message objects
 * @param {Function} onChunk - Callback function for each chunk
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Final result
 */
export async function createStreamingChatCompletion(
  messages,
  onChunk,
  options = {}
) {
  const apiKey = getApiKey()

  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    max_tokens = 1000,
  } = options

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `OpenAI API error: ${response.statusText}`
      )
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split("\n").filter((line) => line.trim() !== "")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") {
            continue
          }

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices[0]?.delta?.content
            if (delta) {
              fullContent += delta
              onChunk(delta)
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    return {
      success: true,
      content: fullContent,
    }
  } catch (error) {
    console.error("OpenAI streaming error:", error)
    return {
      success: false,
      error: error.message || "Failed to stream response from OpenAI",
    }
  }
}

/**
 * Retry wrapper for API calls with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise} Result of function
 */
export async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      const delay = Math.pow(2, i) * 1000 // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

export default {
  createChatCompletion,
  createStreamingChatCompletion,
  retryWithBackoff,
}

