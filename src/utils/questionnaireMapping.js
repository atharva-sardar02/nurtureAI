/**
 * Questionnaire Type Mapping Utility
 * Maps numeric questionnaire type codes to standardized questionnaire types
 * 
 * Mapping:
 * - 1: PHQ-A (adolescent PHQ-9)
 * - 2: GAD-7
 * - 3: PSC-17
 * - 4: SDQ
 * - Other: OTHER
 */

const QUESTIONNAIRE_TYPE_MAP = {
  1: {
    code: "PHQ_A",
    label: "PHQ-A",
    scored: true,
    riskScreen: true,
  },
  2: {
    code: "GAD_7",
    label: "GAD-7",
    scored: true,
    riskScreen: true,
  },
  3: {
    code: "PSC_17",
    label: "PSC-17",
    scored: true,
    riskScreen: true,
  },
  4: {
    code: "SDQ",
    label: "SDQ",
    scored: true,
    riskScreen: true,
  },
  OTHER: {
    code: "OTHER",
    label: "Other (read-only)",
    scored: false,
    riskScreen: false,
  },
};

/**
 * Convert questionnaire type code to standardized type object
 * @param {number|string} code - The questionnaire type code (1, 2, 3, 4, or string)
 * @returns {Object} The questionnaire type object with code, label, scored, and riskScreen
 */
export function getQuestionnaireType(code) {
  // Handle string codes
  const codeNum = typeof code === 'string' ? parseInt(code, 10) : code;
  
  // Check if it's a valid numeric code
  if (!isNaN(codeNum) && QUESTIONNAIRE_TYPE_MAP[codeNum]) {
    return QUESTIONNAIRE_TYPE_MAP[codeNum];
  }
  
  // Check if it's already a valid code string (e.g., "PHQ_A", "GAD_7")
  const codeStr = String(code).toUpperCase();
  const found = Object.values(QUESTIONNAIRE_TYPE_MAP).find(
    type => type.code === codeStr || type.label === codeStr
  );
  
  if (found) {
    return found;
  }
  
  // Return OTHER for unrecognized codes
  return QUESTIONNAIRE_TYPE_MAP.OTHER;
}

/**
 * Get questionnaire type code from label or code string
 * @param {string} labelOrCode - The questionnaire label (e.g., "PHQ-A") or code (e.g., "PHQ_A")
 * @returns {number|null} The numeric code, or null if not found
 */
export function getQuestionnaireCode(labelOrCode) {
  const normalized = String(labelOrCode).toUpperCase();
  
  // Check direct code match
  for (const [key, value] of Object.entries(QUESTIONNAIRE_TYPE_MAP)) {
    if (value.code === normalized || value.label === normalized) {
      return key === 'OTHER' ? null : parseInt(key, 10);
    }
  }
  
  return null;
}

/**
 * Get all questionnaire type mappings
 * @returns {Object} All questionnaire type mappings
 */
export function getAllQuestionnaireMappings() {
  return QUESTIONNAIRE_TYPE_MAP;
}

/**
 * Transform questionnaire data with code-to-type mapping
 * @param {Object} questionnaireData - Raw questionnaire data from CSV
 * @returns {Object} Transformed questionnaire data with type object
 */
export function transformQuestionnaireData(questionnaireData) {
  const result = { ...questionnaireData };
  
  // Transform type field if it exists
  if (questionnaireData.type !== undefined && questionnaireData.type !== null) {
    const typeObj = getQuestionnaireType(questionnaireData.type);
    
    // Store both the original code and the transformed type object
    result.typeCode = typeof questionnaireData.type === 'string' 
      ? parseInt(questionnaireData.type, 10) 
      : questionnaireData.type;
    result.type = typeObj.code; // Store standardized code
    result.typeLabel = typeObj.label; // Store human-readable label
    result.typeMetadata = {
      scored: typeObj.scored,
      riskScreen: typeObj.riskScreen,
    };
    
    // Backward compatibility: keep original type if it was already a string
    if (typeof questionnaireData.type === 'string' && 
        ['PHQ-A', 'GAD-7', 'PSC-17', 'SDQ', 'PHQ_A', 'GAD_7', 'PSC_17', 'SDQ'].includes(questionnaireData.type)) {
      // Already a valid string, keep it
    }
  }
  
  return result;
}

