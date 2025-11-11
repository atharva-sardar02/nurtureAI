/**
 * Kinship Code Mapping Utility
 * Maps numeric kinship codes to human-readable labels
 * 
 * Based on PRD Section 13, Q11:
 * - 1: "mother"
 * - 2: "father"
 * - 12: "other"
 * - 2051: "guardian"
 */

const KINSHIP_CODE_MAP = {
  1: "mother",
  2: "father",
  12: "other",
  2051: "guardian",
};

/**
 * Convert kinship code to human-readable label
 * @param {number|string} code - The kinship code (1, 2, 12, or 2051)
 * @returns {string} The human-readable label
 */
export function getKinshipLabel(code) {
  const codeNum = typeof code === 'string' ? parseInt(code, 10) : code;
  return KINSHIP_CODE_MAP[codeNum] || "unknown";
}

/**
 * Convert kinship label to code
 * @param {string} label - The human-readable label
 * @returns {number|null} The kinship code, or null if not found
 */
export function getKinshipCode(label) {
  const entry = Object.entries(KINSHIP_CODE_MAP).find(
    ([_, value]) => value === label.toLowerCase()
  );
  return entry ? parseInt(entry[0], 10) : null;
}

/**
 * Get all kinship mappings
 * @returns {Object} Object mapping codes to labels
 */
export function getAllKinshipMappings() {
  return { ...KINSHIP_CODE_MAP };
}

/**
 * Transform kinship data with code-to-label mapping
 * @param {Object} kinshipData - Raw kinship data from CSV (headers converted to camelCase)
 * @returns {Object} Transformed kinship data with label field
 */
export function transformKinshipData(kinshipData) {
  // Handle both snake_case and camelCase field names
  // After camelCase conversion: user_0_label → user0Label, user_1_label → user1Label
  const user0Label = kinshipData.user0Label ?? kinshipData.user_0_label;
  const user1Label = kinshipData.user1Label ?? kinshipData.user_1_label;
  
  // Create rest object without label fields
  const rest = { ...kinshipData };
  delete rest.user0Label;
  delete rest.user1Label;
  delete rest.user_0_label;
  delete rest.user_1_label;
  
  // Build kinship objects only if labels exist
  const result = { ...rest };
  
  if (user0Label !== undefined && user0Label !== null && user0Label !== '') {
    const code = parseInt(user0Label, 10);
    if (!isNaN(code)) {
      result.user0Kinship = {
        code,
        label: getKinshipLabel(code),
      };
      // Backward compatibility
      result.user_0_kinship = result.user0Kinship;
    }
  }
  
  if (user1Label !== undefined && user1Label !== null && user1Label !== '') {
    const code = parseInt(user1Label, 10);
    if (!isNaN(code)) {
      result.user1Kinship = {
        code,
        label: getKinshipLabel(code),
      };
      // Backward compatibility
      result.user_1_kinship = result.user1Kinship;
    }
  }
  
  return result;
}

export default {
  getKinshipLabel,
  getKinshipCode,
  getAllKinshipMappings,
  transformKinshipData,
};

