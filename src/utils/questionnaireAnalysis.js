/**
 * Questionnaire Analysis Utilities
 * Functions for analyzing questionnaire scores, trends, and severity
 */

import { getQuestionnaireType } from './questionnaireMapping.js';

/**
 * Interpret score severity based on questionnaire type
 * @param {string} typeCode - Questionnaire type code (PHQ_A, GAD_7, PSC_17, SDQ)
 * @param {number} score - Questionnaire score
 * @returns {string} Severity level: 'minimal' | 'mild' | 'moderate' | 'severe'
 */
export function interpretScoreSeverity(typeCode, score) {
  if (score === null || score === undefined) {
    return 'minimal';
  }

  const type = getQuestionnaireType(typeCode);
  const normalizedType = type.code.toUpperCase();

  // PHQ-A (PHQ-9 for adolescents): 0-27 scale
  // 0-4: minimal, 5-9: mild, 10-14: moderate, 15-19: moderately severe, 20-27: severe
  if (normalizedType === 'PHQ_A') {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    if (score <= 19) return 'moderate'; // Treating moderately severe as moderate
    return 'severe';
  }

  // GAD-7: 0-21 scale
  // 0-4: minimal, 5-9: mild, 10-14: moderate, 15-21: severe
  if (normalizedType === 'GAD_7') {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
  }

  // PSC-17: 0-34 scale (higher = more problems)
  // 0-14: minimal, 15-19: mild, 20-24: moderate, 25-34: severe
  if (normalizedType === 'PSC_17') {
    if (score <= 14) return 'minimal';
    if (score <= 19) return 'mild';
    if (score <= 24) return 'moderate';
    return 'severe';
  }

  // SDQ: 0-40 scale (higher = more problems)
  // 0-13: minimal, 14-16: mild, 17-19: moderate, 20-40: severe
  if (normalizedType === 'SDQ') {
    if (score <= 13) return 'minimal';
    if (score <= 16) return 'mild';
    if (score <= 19) return 'moderate';
    return 'severe';
  }

  // Default: assume lower is better
  return 'minimal';
}

/**
 * Calculate trend from questionnaire scores
 * For most questionnaires, lower scores = better (improving)
 * @param {Array} questionnaires - Array of questionnaire objects with score and completedAt/createdAt
 * @returns {string} Trend: 'improving' | 'stable' | 'worsening'
 */
export function calculateQuestionnaireTrend(questionnaires) {
  if (!questionnaires || questionnaires.length < 2) {
    return 'stable';
  }

  // Sort by date (oldest first)
  const sorted = [...questionnaires]
    .filter(q => q.score !== null && q.score !== undefined)
    .sort((a, b) => {
      const dateA = a.completedAt?.toDate?.() || a.createdAt?.toDate?.() || new Date(a.completedAt || a.createdAt);
      const dateB = b.completedAt?.toDate?.() || b.createdAt?.toDate?.() || new Date(b.completedAt || b.createdAt);
      return dateA - dateB;
    });

  if (sorted.length < 2) {
    return 'stable';
  }

  // Get most recent two scores
  const recent = sorted.slice(-2);
  const olderScore = recent[0].score;
  const newerScore = recent[1].score;

  const diff = newerScore - olderScore;

  // For most questionnaires, lower scores are better
  // So if score decreases, it's improving
  // If score increases, it's worsening
  // If score stays the same, it's stable
  
  // Threshold for "stable" - consider it stable if change is less than 2 points
  if (Math.abs(diff) < 2) {
    return 'stable';
  }

  if (diff < 0) {
    return 'improving'; // Score decreased (better)
  } else {
    return 'worsening'; // Score increased (worse)
  }
}

/**
 * Get severity label with color class
 * @param {string} severity - Severity level
 * @returns {Object} Object with label and color class
 */
export function getSeverityDisplay(severity) {
  const severityMap = {
    minimal: { label: 'Minimal', color: 'text-green-600', bgColor: 'bg-green-50' },
    mild: { label: 'Mild', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    moderate: { label: 'Moderate', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    severe: { label: 'Severe', color: 'text-red-600', bgColor: 'bg-red-50' },
  };

  return severityMap[severity] || severityMap.minimal;
}

/**
 * Format questionnaire type for display
 * @param {string|number} typeCode - Questionnaire type code
 * @returns {string} Formatted label
 */
export function formatQuestionnaireType(typeCode) {
  const type = getQuestionnaireType(typeCode);
  return type.label;
}

