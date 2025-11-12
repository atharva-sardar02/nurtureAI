# Structured Assessment Implementation

## Overview

The assessment system has been completely redesigned from a simple LLM wrapper to a **structured, agentic flow** with specific questions based on validated mental health screening tools (PHQ-A, GAD-7, PSC-17).

## Key Changes

### 1. Structured Assessment Engine (`StructuredAssessmentEngine.js`)

**Replaces:** Simple LLM chat wrapper  
**New Features:**
- **Phased Assessment Flow**: 6 distinct phases with specific questions
- **Automatic Progress Tracking**: Calculates completion percentage (0-100%)
- **Structured Data Extraction**: Extracts answers from natural language responses
- **Automatic Completion**: Triggers completion when all questions are answered
- **Crisis Detection**: Immediate handling of crisis situations
- **Score Calculation**: Calculates PHQ-A and GAD-7 scores automatically

### 2. Assessment Phases

1. **Introduction**: Child's age
2. **Initial Concerns**: What brought them here
3. **Symptom Screening**: 7 structured questions (PHQ-A and GAD-7 based)
4. **Functional Impact**: How symptoms affect daily life
5. **Duration/Frequency**: How long and how often
6. **Crisis Assessment**: Safety screening questions
7. **Completion**: Automatic when all questions answered

### 3. Question Structure

Each question includes:
- **Question text**: Specific, validated screening question
- **Field name**: For structured data storage
- **Required flag**: Whether answer is mandatory
- **Tool reference**: Which validated tool it's based on (PHQ-A, GAD-7, etc.)
- **Critical flag**: For crisis-related questions

### 4. Automatic Features

#### Progress Calculation
- Tracks answered vs. total questions
- Updates in real-time (0-100%)
- Displayed in UI with progress bar

#### Answer Extraction
- Parses natural language responses
- Extracts structured answers (e.g., "Not at all" → 0, "Several days" → 1)
- Handles multiple choice, yes/no, and open-ended questions
- Falls back to raw text for open-ended questions

#### Score Calculation
- **PHQ-A Score**: 0-27 (depression screening)
- **GAD-7 Score**: 0-21 (anxiety screening)
- **Severity Level**: Minimal, Mild, Moderate, Severe
- **Suitability**: Determines if child is suitable for services

#### Automatic Completion
- Triggers when all required questions are answered
- Calculates final scores and severity
- Determines suitability for services
- Shows completion message and "Continue to Onboarding" button

### 5. UI Enhancements

#### Progress Bar
- Shows assessment progress (0-100%)
- Updates in real-time as questions are answered
- Hidden when assessment is complete

#### Completion State
- Disables input when assessment is complete
- Shows completion message with checkmark
- Provides "Continue to Onboarding" button
- Automatically navigates to assessment summary page

#### Crisis Handling
- Immediate detection of crisis indicators
- Shows crisis alert with resources
- Flags assessment for immediate review
- Provides emergency contact information

## Technical Implementation

### Files Modified/Created

1. **`src/services/ai/StructuredAssessmentEngine.js`** (NEW)
   - Core structured assessment engine
   - Phased question flow
   - Answer extraction and scoring
   - Automatic completion logic

2. **`src/hooks/useChat.js`** (MODIFIED)
   - Updated to use `StructuredAssessmentEngine`
   - Added progress, phase, and completion state
   - Enhanced auto-save logic

3. **`src/components/chat/ChatInterface.jsx`** (MODIFIED)
   - Added progress bar display
   - Added completion state handling
   - Added "Continue to Onboarding" button
   - Disabled input when complete

## Assessment Questions

### Phase 1: Introduction
- Child's age

### Phase 2: Initial Concerns
- What concerns prompted seeking help
- When concerns were first noticed

### Phase 3: Symptom Screening (7 questions)
1. Interest/pleasure in activities (PHQ-A)
2. Feeling down/depressed/hopeless (PHQ-A)
3. Sleep problems (PHQ-A)
4. Tiredness/low energy (PHQ-A)
5. Nervous/anxious/on edge (GAD-7)
6. Unable to stop/control worrying (GAD-7)
7. Difficulty concentrating (GAD-7)

### Phase 4: Functional Impact (3 questions)
1. Impact on schoolwork/social interactions
2. Changes in home behavior
3. School staff concerns (optional)

### Phase 5: Duration/Frequency (2 questions)
1. How long have concerns been present
2. How often do symptoms occur

### Phase 6: Crisis Assessment (3 questions)
1. Thoughts of self-harm
2. Self-harming behaviors
3. Suicidal thoughts

## Scoring System

### PHQ-A Score (0-27)
- Based on 4 PHQ-A questions
- Scoring: Not at all (0), Several days (1), More than half the days (2), Nearly every day (3)
- Interpretation:
  - 0-4: Minimal
  - 5-9: Mild
  - 10-14: Moderate
  - 15-27: Severe

### GAD-7 Score (0-21)
- Based on 3 GAD-7 questions
- Same scoring as PHQ-A
- Interpretation:
  - 0-4: Minimal
  - 5-9: Mild
  - 10-14: Moderate
  - 15-21: Severe

### Combined Severity
- Total score = PHQ-A + GAD-7
- Severity levels based on combined score

### Suitability Determination
- **Crisis**: Immediate flag for crisis situations
- **Suitable**: High scores, functional impact, or long duration
- **Not Suitable**: Low scores and minimal impact

## User Experience Flow

1. **Start Assessment**: User clicks "Take Assessment"
2. **Progress Through Questions**: System asks specific questions in order
3. **Real-time Progress**: Progress bar updates as questions are answered
4. **Natural Responses**: User can answer naturally; system extracts structured data
5. **Automatic Completion**: When all questions answered, assessment completes automatically
6. **Continue to Onboarding**: Button appears to proceed to next step

## Benefits Over Previous System

### Before (LLM Wrapper)
- ❌ No structured questions
- ❌ No progress tracking
- ❌ No automatic completion
- ❌ Inconsistent data collection
- ❌ No scoring system
- ❌ Manual completion required

### After (Structured Agentic Flow)
- ✅ Specific, validated questions
- ✅ Real-time progress tracking
- ✅ Automatic completion
- ✅ Structured data extraction
- ✅ Automatic scoring (PHQ-A, GAD-7)
- ✅ Automatic suitability determination
- ✅ Crisis detection and handling
- ✅ Consistent assessment experience

## Next Steps

1. **Test the complete flow** from start to finish
2. **Verify scoring accuracy** with known test cases
3. **Test crisis detection** with various scenarios
4. **Validate data extraction** with different response formats
5. **Monitor user experience** and gather feedback

## Notes

- The system still uses LLM for generating empathetic, contextual responses between questions
- All questions are based on validated mental health screening tools
- The assessment is a **screening tool, not a diagnosis**
- All data is stored in Firestore for clinical review
- Crisis situations are flagged for immediate attention

