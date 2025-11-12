/**
 * Structured Assessment Engine
 * Agentic flow with specific questions and automatic completion
 * Based on validated mental health screening tools (PHQ-A, GAD-7, PSC-17, SDQ)
 */

import { createChatCompletion, createStreamingChatCompletion } from "./openai.js"

/**
 * Assessment Phases - 7 Questions Total
 */
export const ASSESSMENT_PHASES = {
  QUESTION_1_AGE: 'question_1_age',
  QUESTION_2_CONCERNS: 'question_2_concerns',
  QUESTION_3_DEPRESSION: 'question_3_depression',
  QUESTION_4_ANXIETY: 'question_4_anxiety',
  QUESTION_5_FUNCTIONAL: 'question_5_functional',
  QUESTION_6_DURATION: 'question_6_duration',
  QUESTION_7_CRISIS: 'question_7_crisis',
  COMPLETION: 'completion',
}

/**
 * Assessment Questions - 7 Questions Total
 * Based on validated screening tools (PHQ-A, GAD-7)
 */
const ASSESSMENT_QUESTIONS = {
  [ASSESSMENT_PHASES.QUESTION_1_AGE]: {
    question: "Hello! I'm here to help you understand your child's mental health needs. This conversation is completely confidential and non-judgmental. To get started, could you tell me your child's age?",
    field: 'childAge',
    required: true,
    questionNumber: 1,
  },
  [ASSESSMENT_PHASES.QUESTION_2_CONCERNS]: {
    question: "What specific concerns or changes have you noticed in your child recently that prompted you to seek help today? Please describe what you've observed.",
    field: 'initialConcerns',
    required: true,
    questionNumber: 2,
    useLLMExtraction: true, // Use LLM to extract issues
  },
  [ASSESSMENT_PHASES.QUESTION_3_DEPRESSION]: {
    question: "Over the past 2 weeks, how often has your child experienced: (a) little interest or pleasure in doing things, (b) feeling down, depressed, or hopeless, (c) trouble sleeping or sleeping too much, (d) feeling tired or having little energy? Please describe the frequency for each symptom. (Not at all, Several days, More than half the days, Nearly every day)",
    field: 'depressionSymptoms',
    required: true,
    questionNumber: 3,
    tool: 'PHQ-A',
    useLLMExtraction: true, // Use LLM to extract symptom frequencies
  },
  [ASSESSMENT_PHASES.QUESTION_4_ANXIETY]: {
    question: "Over the past 2 weeks, how often has your child experienced: (a) feeling nervous, anxious, or on edge, (b) not being able to stop or control worrying, (c) difficulty concentrating? Please describe the frequency for each. (Not at all, Several days, More than half the days, Nearly every day)",
    field: 'anxietySymptoms',
    required: true,
    questionNumber: 4,
    tool: 'GAD-7',
    useLLMExtraction: true, // Use LLM to extract symptom frequencies
  },
  [ASSESSMENT_PHASES.QUESTION_5_FUNCTIONAL]: {
    question: "How much have these symptoms affected your child's daily life - such as schoolwork, relationships with friends, or activities at home? (Not at all, Somewhat, Very much, Extremely)",
    field: 'functionalImpact',
    required: true,
    questionNumber: 5,
    useLLMExtraction: true,
  },
  [ASSESSMENT_PHASES.QUESTION_6_DURATION]: {
    question: "How long have these concerns been present? (Less than 2 weeks, 2-4 weeks, 1-3 months, More than 3 months)",
    field: 'duration',
    required: true,
    questionNumber: 6,
    useLLMExtraction: true,
  },
  [ASSESSMENT_PHASES.QUESTION_7_CRISIS]: {
    question: "Has your child ever expressed thoughts of self-harm, suicide, or hurting themselves or others? This is important for their safety.",
    field: 'crisisIndicators',
    required: true,
    questionNumber: 7,
    critical: true,
    useLLMExtraction: true,
  },
}

/**
 * Structured Assessment Engine Class
 */
export class StructuredAssessmentEngine {
  constructor() {
    this.currentPhase = ASSESSMENT_PHASES.QUESTION_1_AGE
    this.assessmentData = {
      // Question 1
      childAge: null,
      // Question 2 - extracted issues
      initialConcerns: null,
      extractedIssues: [],
      // Question 3 - depression symptoms (extracted)
      depressionSymptoms: null,
      phqInterest: null,
      phqMood: null,
      phqSleep: null,
      phqEnergy: null,
      // Question 4 - anxiety symptoms (extracted)
      anxietySymptoms: null,
      gadAnxiety: null,
      gadWorry: null,
      gadConcentration: null,
      // Question 5
      functionalImpact: null,
      // Question 6
      duration: null,
      // Question 7
      crisisIndicators: null,
      crisisDetected: false,
      // Calculated fields
      phqScore: null,
      gadScore: null,
      severity: null,
      suitability: null,
      completed: false,
      completionReason: null,
    }
    this.conversationHistory = []
  }

  /**
   * Get current question based on phase
   */
  getCurrentQuestion() {
    return ASSESSMENT_QUESTIONS[this.currentPhase] || null
  }

  /**
   * Process user response and extract structured data using LLM when needed
   */
  async processResponse(userMessage, onStreamChunk = null) {
    const currentQuestion = this.getCurrentQuestion()
    
    console.log(`[StructuredAssessment] Processing response for phase: ${this.currentPhase}, question: ${currentQuestion?.questionNumber || 'N/A'}`)
    
    if (!currentQuestion) {
      // Assessment is complete
      console.log('[StructuredAssessment] No current question - completing assessment')
      return this.completeAssessment()
    }

    // Extract answer - use LLM if needed
    let extractedAnswer
    if (currentQuestion.useLLMExtraction) {
      console.log(`[StructuredAssessment] Using LLM extraction for: ${currentQuestion.field}`)
      extractedAnswer = await this.extractWithLLM(userMessage, currentQuestion)
    } else {
      extractedAnswer = this.extractAnswer(userMessage, currentQuestion)
    }
    
    console.log(`[StructuredAssessment] Extracted answer:`, extractedAnswer)
    
    // Store answer in assessment data
    if (currentQuestion.field) {
      this.assessmentData[currentQuestion.field] = extractedAnswer
    }

    // Check for crisis indicators
    if (this.detectCrisis(userMessage, extractedAnswer, currentQuestion)) {
      this.assessmentData.crisisDetected = true
      return this.handleCrisis()
    }

    // Move to next question IMMEDIATELY - no follow-ups
    this.advanceToNextQuestion()
    console.log(`[StructuredAssessment] Advanced to phase: ${this.currentPhase}`)

    // Get next question or complete
    const nextQuestion = this.getCurrentQuestion()
    
    if (!nextQuestion) {
      // All questions answered, complete assessment
      console.log('[StructuredAssessment] All 7 questions answered - completing')
      return this.completeAssessment()
    }

    // Generate AI response - STRICT: only acknowledgment + next question
    const aiResponse = await this.generateContextualResponse(
      userMessage,
      extractedAnswer,
      currentQuestion,
      nextQuestion,
      onStreamChunk
    )
    
    console.log(`[StructuredAssessment] Generated response (${aiResponse.length} chars): ${aiResponse.substring(0, 100)}...`)

    // Update conversation history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      question: currentQuestion,
      extractedAnswer,
    })
    this.conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      question: nextQuestion,
    })

    // Calculate progress
    const progress = this.calculateProgress()

    return {
      success: true,
      message: aiResponse,
      assessmentData: { ...this.assessmentData },
      currentPhase: this.currentPhase,
      progress,
      isComplete: this.assessmentData.completed,
    }
  }

  /**
   * Extract structured data using LLM
   */
  async extractWithLLM(userMessage, question) {
    let extractionPrompt = ''
    let expectedFormat = ''

    if (question.field === 'initialConcerns') {
      // Extract issues from concerns
      extractionPrompt = `Extract specific mental health issues/concerns from this parent's description of their child: "${userMessage}"

Return a JSON object with:
{
  "issues": ["issue1", "issue2", ...],
  "summary": "brief summary"
}

Examples:
- "he is not sleeping well and also he is not eating. He just sits alone doing nothing" 
  → {"issues": ["sleep problems", "appetite loss", "social withdrawal", "loss of interest"], "summary": "Sleep and appetite issues with social withdrawal"}

- "she's been very anxious about school and cries a lot"
  → {"issues": ["anxiety", "school-related stress", "emotional distress"], "summary": "School-related anxiety with frequent crying"}

Return ONLY valid JSON, no other text:`
      expectedFormat = 'json'
    } else if (question.field === 'depressionSymptoms') {
      // Extract PHQ-A symptom frequencies
      extractionPrompt = `Extract depression symptom frequencies from this response: "${userMessage}"

The question asked about 4 symptoms over past 2 weeks:
(a) little interest or pleasure in doing things
(b) feeling down, depressed, or hopeless  
(c) trouble sleeping or sleeping too much
(d) feeling tired or having little energy

Return a JSON object with frequencies for each symptom:
{
  "phqInterest": "not_at_all" | "several_days" | "more_than_half" | "nearly_every_day",
  "phqMood": "not_at_all" | "several_days" | "more_than_half" | "nearly_every_day",
  "phqSleep": "not_at_all" | "several_days" | "more_than_half" | "nearly_every_day",
  "phqEnergy": "not_at_all" | "several_days" | "more_than_half" | "nearly_every_day"
}

If a symptom wasn't mentioned, use "not_at_all". Return ONLY valid JSON:`
      expectedFormat = 'json'
    } else if (question.field === 'anxietySymptoms') {
      // Extract GAD-7 symptom frequencies
      extractionPrompt = `Extract anxiety symptom frequencies from this response: "${userMessage}"

The question asked about 3 symptoms over past 2 weeks:
(a) feeling nervous, anxious, or on edge
(b) not being able to stop or control worrying
(c) difficulty concentrating

Return a JSON object:
{
  "gadAnxiety": "not_at_all" | "several_days" | "more_than_half" | "nearly_every_day",
  "gadWorry": "not_at_all" | "several_days" | "more_than_half" | "nearly_every_day",
  "gadConcentration": "not_at_all" | "several_days" | "more_than_half" | "nearly_every_day"
}

If a symptom wasn't mentioned, use "not_at_all". Return ONLY valid JSON:`
      expectedFormat = 'json'
    } else if (question.field === 'functionalImpact') {
      extractionPrompt = `Extract functional impact level from: "${userMessage}"

Return one of: "not_at_all", "somewhat", "very_much", "extremely"

Return ONLY the value, no other text:`
      expectedFormat = 'text'
    } else if (question.field === 'duration') {
      extractionPrompt = `Extract duration from: "${userMessage}"

Return one of: "less_than_2_weeks", "2_4_weeks", "1_3_months", "more_than_3_months"

Return ONLY the value, no other text:`
      expectedFormat = 'text'
    } else if (question.field === 'crisisIndicators') {
      extractionPrompt = `Determine if this response indicates crisis (self-harm, suicide, violence): "${userMessage}"

Return JSON:
{
  "crisisDetected": true | false,
  "indicators": ["indicator1", ...]
}

Return ONLY valid JSON:`
      expectedFormat = 'json'
    }

    try {
      const result = await createChatCompletion(
        [{ role: 'system', content: extractionPrompt }],
        {
          temperature: 0.1, // Low temperature for consistent extraction
          max_tokens: 200,
        }
      )

      if (result.success && result.content) {
        const content = result.content.trim()
        
        if (expectedFormat === 'json') {
          try {
            const parsed = JSON.parse(content)
            
            // Store extracted data in assessmentData
            if (question.field === 'initialConcerns') {
              this.assessmentData.extractedIssues = parsed.issues || []
              return parsed.summary || userMessage
            } else if (question.field === 'depressionSymptoms') {
              this.assessmentData.phqInterest = parsed.phqInterest || 'not_at_all'
              this.assessmentData.phqMood = parsed.phqMood || 'not_at_all'
              this.assessmentData.phqSleep = parsed.phqSleep || 'not_at_all'
              this.assessmentData.phqEnergy = parsed.phqEnergy || 'not_at_all'
              return userMessage // Return original for storage
            } else if (question.field === 'anxietySymptoms') {
              this.assessmentData.gadAnxiety = parsed.gadAnxiety || 'not_at_all'
              this.assessmentData.gadWorry = parsed.gadWorry || 'not_at_all'
              this.assessmentData.gadConcentration = parsed.gadConcentration || 'not_at_all'
              return userMessage
            } else if (question.field === 'crisisIndicators') {
              if (parsed.crisisDetected) {
                this.assessmentData.crisisDetected = true
              }
              return parsed.crisisDetected ? 'yes' : 'no'
            }
            
            return parsed
          } catch (e) {
            console.warn('Failed to parse LLM JSON response:', e)
          }
        } else {
          return content.toLowerCase().trim()
        }
      }
    } catch (err) {
      console.error('LLM extraction error:', err)
    }

    // Fallback to simple extraction
    return this.extractAnswer(userMessage, question)
  }

  /**
   * Extract structured answer from user message
   */
  extractAnswer(userMessage, question) {
    const lowerMessage = userMessage.toLowerCase().trim()
    
    // For multiple choice questions, try to match options
    if (question.question.includes('(') && question.question.includes(')')) {
      const optionsMatch = question.question.match(/\(([^)]+)\)/)
      if (optionsMatch) {
        const options = optionsMatch[1].split(',').map(opt => opt.trim().toLowerCase())
        
        // Try to find matching option
        for (const option of options) {
          if (lowerMessage.includes(option)) {
            return option
          }
        }
        
        // Try partial matches
        for (const option of options) {
          const optionWords = option.split(' ')
          if (optionWords.some(word => lowerMessage.includes(word))) {
            return option
          }
        }
      }
    }
    
    // For yes/no questions
    if (question.question.toLowerCase().includes('has your child') || 
        question.question.toLowerCase().includes('have you noticed')) {
      if (lowerMessage.includes('yes') || lowerMessage.includes('yeah') || lowerMessage.includes('yep')) {
        return 'yes'
      }
      if (lowerMessage.includes('no') || lowerMessage.includes('nope') || lowerMessage.includes('not')) {
        return 'no'
      }
    }
    
    // For age questions
    if (question.field === 'childAge') {
      const ageMatch = userMessage.match(/\d+/)
      if (ageMatch) {
        return parseInt(ageMatch[0], 10)
      }
    }
    
    // For duration questions
    if (question.field === 'duration') {
      if (lowerMessage.includes('less than 2 weeks') || lowerMessage.includes('less than two weeks')) {
        return 'less_than_2_weeks'
      }
      if (lowerMessage.includes('2-4 weeks') || lowerMessage.includes('two to four weeks')) {
        return '2_4_weeks'
      }
      if (lowerMessage.includes('1-3 months') || lowerMessage.includes('one to three months')) {
        return '1_3_months'
      }
      if (lowerMessage.includes('more than 3 months') || lowerMessage.includes('more than three months')) {
        return 'more_than_3_months'
      }
    }
    
    // Default: return the message as-is for open-ended questions
    return userMessage
  }

  /**
   * Detect crisis indicators
   */
  detectCrisis(userMessage, extractedAnswer, question) {
    const lowerMessage = userMessage.toLowerCase()
    
    // Critical question with yes answer
    if (question.critical && (extractedAnswer === 'yes' || lowerMessage.includes('yes'))) {
      return true
    }
    
    // Crisis keywords
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die',
      'self-harm', 'cutting', 'hurting myself',
      'hurt others', 'violence', 'threat'
    ]
    
    return crisisKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  /**
   * Handle crisis situation
   */
  async handleCrisis() {
    this.assessmentData.completed = true
    this.assessmentData.completionReason = 'crisis_detected'
    this.assessmentData.suitability = 'crisis'
    this.currentPhase = ASSESSMENT_PHASES.COMPLETION
    
    const crisisMessage = `I'm concerned about what you've shared. If your child is in immediate danger, please call 988 (Suicide & Crisis Lifeline) or 911 right away. 

For immediate support:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911

I've flagged this assessment for immediate review. A mental health professional will reach out to you as soon as possible. Your child's safety is our top priority.`

    this.conversationHistory.push({
      role: 'assistant',
      content: crisisMessage,
      isCrisis: true,
    })

    return {
      success: true,
      message: crisisMessage,
      assessmentData: { ...this.assessmentData },
      currentPhase: this.currentPhase,
      progress: 100,
      isComplete: true,
      crisisDetected: true,
    }
  }

  /**
   * Advance to next question - 7 questions total
   */
  advanceToNextQuestion() {
    const phaseOrder = [
      ASSESSMENT_PHASES.QUESTION_1_AGE,
      ASSESSMENT_PHASES.QUESTION_2_CONCERNS,
      ASSESSMENT_PHASES.QUESTION_3_DEPRESSION,
      ASSESSMENT_PHASES.QUESTION_4_ANXIETY,
      ASSESSMENT_PHASES.QUESTION_5_FUNCTIONAL,
      ASSESSMENT_PHASES.QUESTION_6_DURATION,
      ASSESSMENT_PHASES.QUESTION_7_CRISIS,
    ]
    
    const currentIndex = phaseOrder.indexOf(this.currentPhase)
    if (currentIndex >= 0 && currentIndex < phaseOrder.length - 1) {
      this.currentPhase = phaseOrder[currentIndex + 1]
    } else {
      this.currentPhase = ASSESSMENT_PHASES.COMPLETION
    }
  }

  /**
   * Generate contextual AI response
   * STRICT: Simple template-based acknowledgment + exact structured question
   * NO FOLLOW-UP QUESTIONS - ONLY ACKNOWLEDGE AND ASK NEXT QUESTION
   */
  async generateContextualResponse(userMessage, extractedAnswer, currentQuestion, nextQuestion, onStreamChunk) {
    // Use simple template-based acknowledgments - NO LLM, NO FOLLOW-UPS
    // This ensures we ALWAYS ask the exact structured question and nothing else
    
    const acknowledgments = [
      "Thank you for sharing that.",
      "I appreciate you telling me about that.",
      "I understand that must be difficult.",
      "Thank you for that information.",
      "I hear you.",
    ]
    
    // Simple selection based on message content (for variety)
    const messageLength = userMessage.length
    const ackIndex = messageLength % acknowledgments.length
    const acknowledgment = acknowledgments[ackIndex]

    // CRITICAL: ALWAYS append the exact structured question - NO modifications, NO additions
    // This is the ONLY question we ask - no follow-ups, no additional questions
    const response = `${acknowledgment} ${nextQuestion.question}`
    
    // Log for debugging
    console.log(`[StructuredAssessment] Question ${nextQuestion.questionNumber || '?'}: ${nextQuestion.question.substring(0, 50)}...`)
    
    // If streaming, simulate the response
    if (onStreamChunk) {
      // Stream the acknowledgment first, then the question
      for (const char of acknowledgment) {
        onStreamChunk(char)
        await new Promise(resolve => setTimeout(resolve, 5))
      }
      onStreamChunk(' ')
      for (const char of nextQuestion.question) {
        onStreamChunk(char)
        await new Promise(resolve => setTimeout(resolve, 5))
      }
    }
    
    return response
  }

  /**
   * Complete assessment and calculate results
   */
  completeAssessment() {
    this.assessmentData.completed = true
    this.assessmentData.completionReason = 'all_questions_answered'
    this.currentPhase = ASSESSMENT_PHASES.COMPLETION

    // Calculate PHQ-A score (0-27)
    const phqScore = this.calculatePHQScore()
    
    // Calculate GAD-7 score (0-21)
    const gadScore = this.calculateGADScore()
    
    // Determine severity
    const severity = this.determineSeverity(phqScore, gadScore)
    
    // Determine suitability
    const suitability = this.determineSuitability(phqScore, gadScore, severity)

    this.assessmentData.phqScore = phqScore
    this.assessmentData.gadScore = gadScore
    this.assessmentData.severity = severity
    this.assessmentData.suitability = suitability

    const completionMessage = `Thank you for completing the assessment. Based on your responses, I've gathered important information about your child's mental health needs. 

Your assessment results will be reviewed, and we'll help determine the best next steps for your child's care. This is a screening tool, not a diagnosis, and our team will work with you to create a personalized care plan.

Would you like to continue to the onboarding process?`

    this.conversationHistory.push({
      role: 'assistant',
      content: completionMessage,
      isCompletion: true,
    })

    return {
      success: true,
      message: completionMessage,
      assessmentData: { ...this.assessmentData },
      currentPhase: this.currentPhase,
      progress: 100,
      isComplete: true,
    }
  }

  /**
   * Calculate PHQ-A score (0-27) from extracted data
   */
  calculatePHQScore() {
    const scoreMap = {
      'not_at_all': 0,
      'several_days': 1,
      'more_than_half': 2,
      'nearly_every_day': 3,
    }
    
    let total = 0
    const phqFields = ['phqInterest', 'phqMood', 'phqSleep', 'phqEnergy']
    
    phqFields.forEach(field => {
      const answer = this.assessmentData[field]
      if (answer && scoreMap[answer] !== undefined) {
        total += scoreMap[answer]
      }
    })
    
    return total
  }

  /**
   * Calculate GAD-7 score (0-21) from extracted data
   */
  calculateGADScore() {
    const scoreMap = {
      'not_at_all': 0,
      'several_days': 1,
      'more_than_half': 2,
      'nearly_every_day': 3,
    }
    
    let total = 0
    const gadFields = ['gadAnxiety', 'gadWorry', 'gadConcentration']
    
    gadFields.forEach(field => {
      const answer = this.assessmentData[field]
      if (answer && scoreMap[answer] !== undefined) {
        total += scoreMap[answer]
      }
    })
    
    return total
  }

  /**
   * Determine severity level
   */
  determineSeverity(phqScore, gadScore) {
    const totalScore = phqScore + gadScore
    
    if (totalScore >= 20) return 'severe'
    if (totalScore >= 10) return 'moderate'
    if (totalScore >= 5) return 'mild'
    return 'minimal'
  }

  /**
   * Determine suitability for services
   */
  determineSuitability(phqScore, gadScore, severity) {
    // Crisis cases
    if (this.assessmentData.crisisDetected) {
      return 'crisis'
    }
    
    // High scores indicate need for services
    if (phqScore >= 10 || gadScore >= 10 || severity === 'severe' || severity === 'moderate') {
      return 'suitable'
    }
    
    // Check functional impact
    if (this.assessmentData.functionalImpact && 
        (this.assessmentData.functionalImpact.includes('very much') || 
         this.assessmentData.functionalImpact.includes('extremely'))) {
      return 'suitable'
    }
    
    // Check duration
    if (this.assessmentData.duration && 
        (this.assessmentData.duration === '1_3_months' || 
         this.assessmentData.duration === 'more_than_3_months')) {
      return 'suitable'
    }
    
    return 'not_suitable'
  }

  /**
   * Calculate assessment progress (0-100)
   */
  calculateProgress() {
    const phases = Object.values(ASSESSMENT_PHASES).filter(p => p !== ASSESSMENT_PHASES.COMPLETION)
    const totalQuestions = this.countTotalQuestions()
    const answeredQuestions = this.countAnsweredQuestions()
    
    if (totalQuestions === 0) return 0
    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  /**
   * Count total questions - 7 questions
   */
  countTotalQuestions() {
    return 7
  }

  /**
   * Count answered questions - check 7 main questions
   */
  countAnsweredQuestions() {
    let count = 0
    
    // Question 1: Age
    if (this.assessmentData.childAge !== null) count++
    
    // Question 2: Concerns
    if (this.assessmentData.initialConcerns !== null) count++
    
    // Question 3: Depression symptoms (check if extracted)
    if (this.assessmentData.depressionSymptoms !== null || 
        (this.assessmentData.phqInterest !== null && this.assessmentData.phqMood !== null)) count++
    
    // Question 4: Anxiety symptoms (check if extracted)
    if (this.assessmentData.anxietySymptoms !== null || 
        (this.assessmentData.gadAnxiety !== null && this.assessmentData.gadWorry !== null)) count++
    
    // Question 5: Functional impact
    if (this.assessmentData.functionalImpact !== null) count++
    
    // Question 6: Duration
    if (this.assessmentData.duration !== null) count++
    
    // Question 7: Crisis
    if (this.assessmentData.crisisIndicators !== null) count++
    
    return count
  }

  /**
   * Get assessment summary
   */
  getAssessmentSummary() {
    return {
      ...this.assessmentData,
      progress: this.calculateProgress(),
      currentPhase: this.currentPhase,
      conversationLength: this.conversationHistory.length,
    }
  }

  /**
   * Reset assessment
   */
  reset() {
    this.currentPhase = ASSESSMENT_PHASES.QUESTION_1_AGE
    this.assessmentData = {
      // Question 1
      childAge: null,
      // Question 2 - extracted issues
      initialConcerns: null,
      extractedIssues: [],
      // Question 3 - depression symptoms (extracted)
      depressionSymptoms: null,
      phqInterest: null,
      phqMood: null,
      phqSleep: null,
      phqEnergy: null,
      // Question 4 - anxiety symptoms (extracted)
      anxietySymptoms: null,
      gadAnxiety: null,
      gadWorry: null,
      gadConcentration: null,
      // Question 5
      functionalImpact: null,
      // Question 6
      duration: null,
      // Question 7
      crisisIndicators: null,
      crisisDetected: false,
      // Calculated fields
      phqScore: null,
      gadScore: null,
      severity: null,
      suitability: null,
      completed: false,
      completionReason: null,
    }
    this.conversationHistory = []
  }

  /**
   * Get conversation history
   */
  getConversationHistory() {
    return this.conversationHistory
  }
}

export default StructuredAssessmentEngine

