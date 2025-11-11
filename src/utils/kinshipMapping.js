/**
 * Kinship Code Mapping Utility
 * Maps numeric kinship codes to human-readable labels with consent eligibility
 * 
 * Updated mapping with consent rules:
 * - 1: "mother" (consentEligible: true)
 * - 2: "father" (consentEligible: true)
 * - 3: "legalGuardian" (consentEligible: true) - important for school referrals
 * - 4: "otherCaregiver" (consentEligible: false by default)
 * - 12: "other" (legacy, maps to otherCaregiver)
 * - 2051: "guardian" (legacy, maps to legalGuardian)
 */

const KINSHIP_CODE_MAP = {
  1: {
    label: "mother",
    consentEligible: true,
  },
  2: {
    label: "father",
    consentEligible: true,
  },
  3: {
    label: "legalGuardian",
    consentEligible: true,
  },
  4: {
    label: "otherCaregiver",
    consentEligible: false, // Can be overridden if legal guardianship is provided
  },
  // Legacy codes for backward compatibility
  12: {
    label: "other",
    consentEligible: false,
  },
  2051: {
    label: "guardian",
    consentEligible: true, // Legacy guardian code treated as legal guardian
  },
};

/**
 * Convert kinship code to human-readable label
 * @param {number|string} code - The kinship code
 * @returns {string} The human-readable label
 */
export function getKinshipLabel(code) {
  const codeNum = typeof code === 'string' ? parseInt(code, 10) : code;
  const mapping = KINSHIP_CODE_MAP[codeNum];
  return mapping ? mapping.label : "unknown";
}

/**
 * Get full kinship mapping with consent eligibility
 * @param {number|string} code - The kinship code
 * @returns {Object|null} The kinship mapping object with label and consentEligible, or null if not found
 */
export function getKinshipMapping(code) {
  const codeNum = typeof code === 'string' ? parseInt(code, 10) : code;
  const mapping = KINSHIP_CODE_MAP[codeNum];
  if (!mapping) {
    return {
      label: "unknown",
      consentEligible: false,
    };
  }
  return { ...mapping };
}

/**
 * Convert kinship label to code
 * @param {string} label - The human-readable label
 * @returns {number|null} The kinship code, or null if not found
 */
export function getKinshipCode(label) {
  const normalizedLabel = label.toLowerCase();
  const entry = Object.entries(KINSHIP_CODE_MAP).find(
    ([_, value]) => value.label.toLowerCase() === normalizedLabel
  );
  return entry ? parseInt(entry[0], 10) : null;
}

/**
 * Get all kinship mappings
 * @returns {Object} Object mapping codes to mapping objects
 */
export function getAllKinshipMappings() {
  return { ...KINSHIP_CODE_MAP };
}

/**
 * Get all kinship mappings as simple label map (for backward compatibility)
 * @returns {Object} Simple code-to-label mapping
 */
export function getAllKinshipLabels() {
  const result = {};
  for (const [code, mapping] of Object.entries(KINSHIP_CODE_MAP)) {
    result[code] = mapping.label;
  }
  return result;
}

/**
 * Transform kinship data with code-to-label mapping and consent eligibility
 * @param {Object} kinshipData - Raw kinship data from CSV (headers converted to camelCase)
 * @returns {Object} Transformed kinship data with kinship objects including consent eligibility
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
      const mapping = getKinshipMapping(code);
      result.user0Kinship = {
        code,
        label: mapping.label,
        consentEligible: mapping.consentEligible,
      };
      // Backward compatibility
      result.user_0_kinship = result.user0Kinship;
    }
  }
  
  if (user1Label !== undefined && user1Label !== null && user1Label !== '') {
    const code = parseInt(user1Label, 10);
    if (!isNaN(code)) {
      const mapping = getKinshipMapping(code);
      result.user1Kinship = {
        code,
        label: mapping.label,
        consentEligible: mapping.consentEligible,
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

