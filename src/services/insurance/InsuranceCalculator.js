/**
 * Insurance Calculator Service
 * Calculates estimated out-of-pocket costs based on insurance coverage
 */

/**
 * Calculate cost per session
 * @param {Object} coverage - Insurance coverage data
 * @param {number} sessionCost - Base cost per session (default: $150)
 * @returns {Object} Cost breakdown
 */
export function calculateSessionCost(coverage, sessionCost = 150) {
  if (!coverage) {
    return {
      sessionCost,
      outOfPocket: sessionCost,
      insurancePays: 0,
      copay: 0,
      deductibleRemaining: 0,
      message: 'No coverage information available',
    };
  }

  const copay = coverage.copay || coverage.copayAmount || 0;
  const deductible = coverage.deductible || 0;
  const coveragePercent = coverage.coverage || coverage.coveragePercent || 0;
  const outOfPocketMax = coverage.outOfPocketMax || coverage.outOfPocketMaximum || 0;
  const deductibleUsed = coverage.deductibleUsed || 0;
  const deductibleRemaining = Math.max(0, deductible - deductibleUsed);

  let outOfPocket = 0;
  let insurancePays = 0;
  let message = '';

  // If copay is specified, use copay model
  if (copay > 0) {
    outOfPocket = copay;
    insurancePays = sessionCost - copay;
    message = `You pay $${copay} copay per session`;
  }
  // If deductible not met, patient pays full cost until deductible is met
  else if (deductibleRemaining > 0) {
    const amountTowardDeductible = Math.min(sessionCost, deductibleRemaining);
    outOfPocket = amountTowardDeductible;
    insurancePays = 0;
    message = `Deductible not met. You pay full cost until $${deductible} deductible is met`;
  }
  // After deductible, apply coverage percentage
  else if (coveragePercent > 0) {
    insurancePays = (sessionCost * coveragePercent) / 100;
    outOfPocket = sessionCost - insurancePays;
    message = `Insurance covers ${coveragePercent}% after deductible`;
  }
  // No coverage specified
  else {
    outOfPocket = sessionCost;
    insurancePays = 0;
    message = 'Coverage details not available';
  }

  // Apply out-of-pocket maximum if applicable
  if (outOfPocketMax > 0) {
    const outOfPocketUsed = coverage.outOfPocketUsed || 0;
    const remainingOOP = outOfPocketMax - outOfPocketUsed;
    
    if (remainingOOP <= 0) {
      outOfPocket = 0;
      insurancePays = sessionCost;
      message = 'Out-of-pocket maximum reached. Insurance covers 100%';
    } else if (outOfPocket > remainingOOP) {
      outOfPocket = remainingOOP;
      insurancePays = sessionCost - remainingOOP;
      message = `Out-of-pocket maximum nearly reached. You pay $${remainingOOP} this session`;
    }
  }

  return {
    sessionCost,
    outOfPocket: Math.round(outOfPocket * 100) / 100,
    insurancePays: Math.round(insurancePays * 100) / 100,
    copay,
    deductibleRemaining,
    outOfPocketMax,
    message,
  };
}

/**
 * Calculate annual cost estimate
 * @param {Object} coverage - Insurance coverage data
 * @param {number} sessionsPerYear - Number of sessions per year (default: 12)
 * @param {number} sessionCost - Base cost per session (default: $150)
 * @returns {Object} Annual cost breakdown
 */
export function calculateAnnualCost(coverage, sessionsPerYear = 12, sessionCost = 150) {
  const sessionBreakdown = calculateSessionCost(coverage, sessionCost);
  
  // Calculate for first session (may hit deductible)
  const firstSession = calculateSessionCost(coverage, sessionCost);
  
  // Calculate for subsequent sessions (after deductible)
  const subsequentCoverage = {
    ...coverage,
    deductibleUsed: coverage.deductible || 0, // Assume deductible met after first session
  };
  const subsequentSession = calculateSessionCost(subsequentCoverage, sessionCost);
  
  // Total annual cost
  const totalCost = sessionsPerYear * sessionCost;
  const totalOutOfPocket = firstSession.outOfPocket + (subsequentSession.outOfPocket * (sessionsPerYear - 1));
  const totalInsurancePays = totalCost - totalOutOfPocket;

  return {
    sessionsPerYear,
    totalCost,
    totalOutOfPocket: Math.round(totalOutOfPocket * 100) / 100,
    totalInsurancePays: Math.round(totalInsurancePays * 100) / 100,
    averagePerSession: Math.round((totalOutOfPocket / sessionsPerYear) * 100) / 100,
    firstSession,
    subsequentSession,
  };
}

/**
 * Format currency value
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default {
  calculateSessionCost,
  calculateAnnualCost,
  formatCurrency,
};

