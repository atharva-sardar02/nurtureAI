/**
 * Unit Tests for Questionnaire Trend Analysis
 * Tests trend calculation, score interpretation, and edge cases
 */

import { 
  calculateQuestionnaireTrend, 
  interpretScoreSeverity,
  getSeverityDisplay,
  formatQuestionnaireType
} from '../../src/utils/questionnaireAnalysis.js';

// Simple test framework
function describe(name, fn) {
  console.log(`\n🧪 ${name}`);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
  } catch (error) {
    console.error(`  ❌ ${name}`);
    console.error(`     Error: ${error.message}`);
    throw error;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// Mock questionnaire data
function createQuestionnaire(score, date, type = 'PHQ_A') {
  return {
    score,
    completedAt: { toDate: () => new Date(date) },
    type,
  };
}

describe('Questionnaire Trend Calculation', () => {
  it('should return "stable" for single questionnaire', () => {
    const questionnaires = [createQuestionnaire(10, '2024-01-01')];
    const trend = calculateQuestionnaireTrend(questionnaires);
    assertEqual(trend, 'stable', 'Single questionnaire should be stable');
  });

  it('should return "stable" for no questionnaires', () => {
    const trend = calculateQuestionnaireTrend([]);
    assertEqual(trend, 'stable', 'Empty array should be stable');
  });

  it('should detect improving trend (score decreasing)', () => {
    const questionnaires = [
      createQuestionnaire(15, '2024-01-01'),
      createQuestionnaire(10, '2024-02-01'),
    ];
    const trend = calculateQuestionnaireTrend(questionnaires);
    assertEqual(trend, 'improving', 'Score decreasing should be improving');
  });

  it('should detect worsening trend (score increasing)', () => {
    const questionnaires = [
      createQuestionnaire(10, '2024-01-01'),
      createQuestionnaire(15, '2024-02-01'),
    ];
    const trend = calculateQuestionnaireTrend(questionnaires);
    assertEqual(trend, 'worsening', 'Score increasing should be worsening');
  });

  it('should detect stable trend (score unchanged)', () => {
    const questionnaires = [
      createQuestionnaire(10, '2024-01-01'),
      createQuestionnaire(10, '2024-02-01'),
    ];
    const trend = calculateQuestionnaireTrend(questionnaires);
    assertEqual(trend, 'stable', 'Score unchanged should be stable');
  });

  it('should detect stable trend for small changes (< 2 points)', () => {
    const questionnaires = [
      createQuestionnaire(10, '2024-01-01'),
      createQuestionnaire(11, '2024-02-01'), // Only 1 point difference
    ];
    const trend = calculateQuestionnaireTrend(questionnaires);
    assertEqual(trend, 'stable', 'Small changes should be stable');
  });

  it('should handle multiple questionnaires (use most recent two)', () => {
    const questionnaires = [
      createQuestionnaire(20, '2024-01-01'),
      createQuestionnaire(15, '2024-02-01'),
      createQuestionnaire(10, '2024-03-01'), // Most recent two: 15 -> 10 (improving)
    ];
    const trend = calculateQuestionnaireTrend(questionnaires);
    assertEqual(trend, 'improving', 'Should use most recent two questionnaires');
  });

  it('should handle questionnaires with null scores', () => {
    const questionnaires = [
      { score: null, completedAt: { toDate: () => new Date('2024-01-01') } },
      createQuestionnaire(10, '2024-02-01'),
    ];
    const trend = calculateQuestionnaireTrend(questionnaires);
    assertEqual(trend, 'stable', 'Should handle null scores gracefully');
  });
});

describe('Score Severity Interpretation', () => {
  describe('PHQ-A (PHQ-9)', () => {
    it('should interpret minimal severity (0-4)', () => {
      assertEqual(interpretScoreSeverity('PHQ_A', 0), 'minimal');
      assertEqual(interpretScoreSeverity('PHQ_A', 4), 'minimal');
    });

    it('should interpret mild severity (5-9)', () => {
      assertEqual(interpretScoreSeverity('PHQ_A', 5), 'mild');
      assertEqual(interpretScoreSeverity('PHQ_A', 9), 'mild');
    });

    it('should interpret moderate severity (10-14)', () => {
      assertEqual(interpretScoreSeverity('PHQ_A', 10), 'moderate');
      assertEqual(interpretScoreSeverity('PHQ_A', 14), 'moderate');
    });

    it('should interpret severe severity (20-27)', () => {
      assertEqual(interpretScoreSeverity('PHQ_A', 20), 'severe');
      assertEqual(interpretScoreSeverity('PHQ_A', 27), 'severe');
    });
  });

  describe('GAD-7', () => {
    it('should interpret minimal severity (0-4)', () => {
      assertEqual(interpretScoreSeverity('GAD_7', 0), 'minimal');
      assertEqual(interpretScoreSeverity('GAD_7', 4), 'minimal');
    });

    it('should interpret mild severity (5-9)', () => {
      assertEqual(interpretScoreSeverity('GAD_7', 5), 'mild');
      assertEqual(interpretScoreSeverity('GAD_7', 9), 'mild');
    });

    it('should interpret moderate severity (10-14)', () => {
      assertEqual(interpretScoreSeverity('GAD_7', 10), 'moderate');
      assertEqual(interpretScoreSeverity('GAD_7', 14), 'moderate');
    });

    it('should interpret severe severity (15-21)', () => {
      assertEqual(interpretScoreSeverity('GAD_7', 15), 'severe');
      assertEqual(interpretScoreSeverity('GAD_7', 21), 'severe');
    });
  });

  describe('PSC-17', () => {
    it('should interpret minimal severity (0-14)', () => {
      assertEqual(interpretScoreSeverity('PSC_17', 0), 'minimal');
      assertEqual(interpretScoreSeverity('PSC_17', 14), 'minimal');
    });

    it('should interpret mild severity (15-19)', () => {
      assertEqual(interpretScoreSeverity('PSC_17', 15), 'mild');
      assertEqual(interpretScoreSeverity('PSC_17', 19), 'mild');
    });

    it('should interpret moderate severity (20-24)', () => {
      assertEqual(interpretScoreSeverity('PSC_17', 20), 'moderate');
      assertEqual(interpretScoreSeverity('PSC_17', 24), 'moderate');
    });

    it('should interpret severe severity (25-34)', () => {
      assertEqual(interpretScoreSeverity('PSC_17', 25), 'severe');
      assertEqual(interpretScoreSeverity('PSC_17', 34), 'severe');
    });
  });

  describe('SDQ', () => {
    it('should interpret minimal severity (0-13)', () => {
      assertEqual(interpretScoreSeverity('SDQ', 0), 'minimal');
      assertEqual(interpretScoreSeverity('SDQ', 13), 'minimal');
    });

    it('should interpret mild severity (14-16)', () => {
      assertEqual(interpretScoreSeverity('SDQ', 14), 'mild');
      assertEqual(interpretScoreSeverity('SDQ', 16), 'mild');
    });

    it('should interpret moderate severity (17-19)', () => {
      assertEqual(interpretScoreSeverity('SDQ', 17), 'moderate');
      assertEqual(interpretScoreSeverity('SDQ', 19), 'moderate');
    });

    it('should interpret severe severity (20-40)', () => {
      assertEqual(interpretScoreSeverity('SDQ', 20), 'severe');
      assertEqual(interpretScoreSeverity('SDQ', 40), 'severe');
    });
  });

  it('should handle null/undefined scores', () => {
    assertEqual(interpretScoreSeverity('PHQ_A', null), 'minimal');
    assertEqual(interpretScoreSeverity('PHQ_A', undefined), 'minimal');
  });

  it('should handle unknown questionnaire types', () => {
    assertEqual(interpretScoreSeverity('UNKNOWN', 10), 'minimal');
  });
});

describe('Severity Display', () => {
  it('should return correct display info for minimal', () => {
    const display = getSeverityDisplay('minimal');
    assertEqual(display.label, 'Minimal');
    assert(display.color.includes('green'), 'Minimal should have green color');
  });

  it('should return correct display info for mild', () => {
    const display = getSeverityDisplay('mild');
    assertEqual(display.label, 'Mild');
    assert(display.color.includes('yellow'), 'Mild should have yellow color');
  });

  it('should return correct display info for moderate', () => {
    const display = getSeverityDisplay('moderate');
    assertEqual(display.label, 'Moderate');
    assert(display.color.includes('orange'), 'Moderate should have orange color');
  });

  it('should return correct display info for severe', () => {
    const display = getSeverityDisplay('severe');
    assertEqual(display.label, 'Severe');
    assert(display.color.includes('red'), 'Severe should have red color');
  });

  it('should default to minimal for unknown severity', () => {
    const display = getSeverityDisplay('unknown');
    assertEqual(display.label, 'Minimal');
  });
});

describe('Questionnaire Type Formatting', () => {
  it('should format PHQ_A correctly', () => {
    const formatted = formatQuestionnaireType('PHQ_A');
    assertEqual(formatted, 'PHQ-A');
  });

  it('should format GAD_7 correctly', () => {
    const formatted = formatQuestionnaireType('GAD_7');
    assertEqual(formatted, 'GAD-7');
  });

  it('should format numeric codes', () => {
    const formatted = formatQuestionnaireType(1);
    assertEqual(formatted, 'PHQ-A');
  });
});

console.log('\n==================================================');
console.log('✅ All Questionnaire Trends tests passed!');
console.log('==================================================\n');

