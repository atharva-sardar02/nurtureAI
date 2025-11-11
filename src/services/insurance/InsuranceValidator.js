/**
 * Insurance Validator Service
 * Validates insurance information and checks coverage status
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';

/**
 * Validate member ID format
 * @param {string} memberId - Member ID to validate
 * @returns {Object} {valid: boolean, error?: string}
 */
export function validateMemberId(memberId) {
  if (!memberId || typeof memberId !== 'string') {
    return { valid: false, error: 'Member ID is required' };
  }

  const trimmed = memberId.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Member ID must be at least 3 characters' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Member ID must be less than 50 characters' };
  }

  // Allow alphanumeric, hyphens, and spaces
  const memberIdPattern = /^[A-Za-z0-9\s\-]+$/;
  if (!memberIdPattern.test(trimmed)) {
    return { valid: false, error: 'Member ID contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate group number format
 * @param {string} groupNumber - Group number to validate (optional)
 * @returns {Object} {valid: boolean, error?: string}
 */
export function validateGroupNumber(groupNumber) {
  if (!groupNumber) {
    return { valid: true }; // Group number is optional
  }

  if (typeof groupNumber !== 'string') {
    return { valid: false, error: 'Group number must be a string' };
  }

  const trimmed = groupNumber.trim();
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Group number must be less than 50 characters' };
  }

  // Allow alphanumeric, hyphens, and spaces
  const groupNumberPattern = /^[A-Za-z0-9\s\-]+$/;
  if (!groupNumberPattern.test(trimmed)) {
    return { valid: false, error: 'Group number contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Lookup insurance plan in database
 * @param {string} provider - Insurance provider name
 * @param {string} memberId - Member ID
 * @param {string} groupNumber - Group number (optional)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function lookupInsurancePlan(provider, memberId, groupNumber = null) {
  try {
    // First, find the insurance provider in credentialedInsurances
    const insuranceQuery = query(
      collection(db, 'credentialedInsurances')
    );
    
    const insuranceSnapshot = await getDocs(insuranceQuery);
    let insuranceId = null;
    let insuranceName = null;
    
    // Find insurance ID by matching provider name
    insuranceSnapshot.forEach((doc) => {
      const data = doc.data();
      const name = data.name || data.provider || data.insuranceName || '';
      if (name.toLowerCase().includes(provider.toLowerCase()) ||
          provider.toLowerCase().includes(name.toLowerCase())) {
        insuranceId = doc.id;
        insuranceName = name;
      }
    });
    
    if (!insuranceId) {
      return {
        success: false,
        error: `Insurance provider "${provider}" not found in our system`,
      };
    }
    
    // Look up coverage in insuranceCoverages collection
    const coverageQuery = query(
      collection(db, 'insuranceCoverages'),
      where('memberId', '==', memberId)
    );
    
    const coverageSnapshot = await getDocs(coverageQuery);
    const coverages = [];
    
    coverageSnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if this coverage matches the insurance provider
      const coverageInsuranceId = data.insuranceId || data.credentialedInsuranceId;
      if (coverageInsuranceId === insuranceId) {
        coverages.push({
          id: doc.id,
          ...data,
          insuranceProvider: insuranceName,
        });
      }
    });
    
    // If group number provided, filter by group number
    let matchingCoverage = null;
    if (groupNumber) {
      matchingCoverage = coverages.find(c => 
        c.groupNumber && c.groupNumber.toLowerCase() === groupNumber.toLowerCase()
      );
    } else {
      // If no group number, return first match
      matchingCoverage = coverages[0] || null;
    }
    
    if (!matchingCoverage) {
      return {
        success: false,
        error: 'No coverage found for this member ID and insurance provider',
      };
    }
    
    return {
      success: true,
      data: {
        ...matchingCoverage,
        insuranceId,
        insuranceName,
        verified: true,
      },
    };
  } catch (error) {
    console.error('Error looking up insurance plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify insurance',
    };
  }
}

/**
 * Check coverage status
 * @param {Object} coverage - Coverage data from lookupInsurancePlan
 * @returns {Object} {active: boolean, status: string, message?: string}
 */
export function checkCoverageStatus(coverage) {
  if (!coverage) {
    return {
      active: false,
      status: 'not_found',
      message: 'Coverage not found',
    };
  }
  
  // Check if coverage is active
  const isActive = coverage.isActive !== false; // Default to true if not specified
  
  // Check verification status
  const verificationStatus = coverage.verificationStatus || 'pending';
  
  if (!isActive) {
    return {
      active: false,
      status: 'inactive',
      message: 'This coverage is not active',
    };
  }
  
  if (verificationStatus === 'verified') {
    return {
      active: true,
      status: 'verified',
      message: 'Coverage verified and active',
    };
  }
  
  if (verificationStatus === 'pending') {
    return {
      active: true,
      status: 'pending',
      message: 'Coverage verification pending',
    };
  }
  
  if (verificationStatus === 'rejected') {
    return {
      active: false,
      status: 'rejected',
      message: 'Coverage verification was rejected',
    };
  }
  
  return {
    active: isActive,
    status: verificationStatus,
    message: 'Coverage status unknown',
  };
}

/**
 * Validate complete insurance information
 * @param {Object} insuranceData - Insurance data object
 * @returns {Object} {valid: boolean, errors: Object}
 */
export function validateInsuranceData(insuranceData) {
  const errors = {};
  
  if (!insuranceData.provider || !insuranceData.provider.trim()) {
    errors.provider = 'Insurance provider is required';
  }
  
  const memberIdValidation = validateMemberId(insuranceData.memberId);
  if (!memberIdValidation.valid) {
    errors.memberId = memberIdValidation.error;
  }
  
  if (insuranceData.groupNumber) {
    const groupNumberValidation = validateGroupNumber(insuranceData.groupNumber);
    if (!groupNumberValidation.valid) {
      errors.groupNumber = groupNumberValidation.error;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export default {
  validateMemberId,
  validateGroupNumber,
  lookupInsurancePlan,
  checkCoverageStatus,
  validateInsuranceData,
};

