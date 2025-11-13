/**
 * Membership Service
 * Handles querying and extracting insurance data from memberships collection
 */

import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { matchProviderNameToId } from './InsuranceMatcher';

/**
 * Get all memberships for a patient
 * @param {string} patientId - Patient ID (user_id in memberships)
 * @returns {Promise<{success: boolean, memberships?: Array, error?: string}>}
 */
export async function getPatientMemberships(patientId) {
  try {
    if (!patientId) {
      return { success: true, memberships: [] };
    }

    // Query memberships by user_id (which is the patientId)
    // Field name may be userId (camelCase) or user_id (snake_case)
    const membershipsQuery = query(
      collection(db, 'memberships'),
      where('userId', '==', patientId)
    );

    const snapshot = await getDocs(membershipsQuery);
    const memberships = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Skip deleted memberships
      if (data.fivetranDeleted === true || data.fivetranDeleted === 'true' || 
          data._fivetran_deleted === true || data._fivetran_deleted === 'true') {
        return;
      }

      memberships.push({
        id: doc.id,
        ...data,
      });
    });

    return { success: true, memberships };
  } catch (error) {
    console.error('Error getting patient memberships:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get insurance coverage for a membership
 * @param {string} membershipId - Membership ID
 * @returns {Promise<{success: boolean, coverage?: Object, error?: string}>}
 */
export async function getMembershipCoverage(membershipId) {
  try {
    if (!membershipId) {
      return { success: false, error: 'Membership ID is required' };
    }

    // Query insuranceCoverages by membershipId
    const coverageQuery = query(
      collection(db, 'insuranceCoverages'),
      where('membershipId', '==', membershipId)
    );

    const snapshot = await getDocs(coverageQuery);
    
    if (snapshot.empty) {
      return { success: false, error: 'No coverage found for this membership' };
    }

    // Get the first (most recent) coverage
    const coverageDoc = snapshot.docs[0];
    const coverage = {
      id: coverageDoc.id,
      ...coverageDoc.data(),
    };

    return { success: true, coverage };
  } catch (error) {
    console.error('Error getting membership coverage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Extract insurance form data from membership and coverage
 * @param {Object} membership - Membership document
 * @param {Object} coverage - Insurance coverage document
 * @returns {Promise<{provider: string, memberId: string, groupNumber: string|null}>}
 */
export async function extractInsuranceDataFromMembership(membership, coverage) {
  try {
    // Extract member ID from coverage (handle both camelCase and snake_case)
    const memberId = coverage.memberId || coverage.member_id || '';
    
    // Extract group number from coverage (handle various field name variations)
    const groupNumber = coverage.groupNumber || 
                        coverage.group_id || 
                        coverage.groupId || 
                        coverage.groupNumber || 
                        null;

    // Extract insurance provider name from coverage (handle various field name variations)
    const insuranceProviderName = coverage.insuranceCompanyName || 
                                  coverage.insurance_company_name || 
                                  coverage.insuranceProvider ||
                                  coverage.provider ||
                                  coverage.openpmInsuranceOrganizationName ||
                                  '';

    if (!insuranceProviderName || !memberId) {
      // Need at least provider name and member ID
      return null;
    }

    // Map provider name to provider ID
    const providerId = await matchProviderNameToId(insuranceProviderName);

    return {
      provider: providerId || insuranceProviderName, // Fallback to name if ID not found
      memberId,
      groupNumber: groupNumber || null, // Ensure null instead of empty string
      insuranceProviderName, // Keep original name for display
    };
  } catch (error) {
    console.error('Error extracting insurance data from membership:', error);
    return null;
  }
}

/**
 * Get insurance data for pre-filling form from patient memberships
 * @param {string} patientId - Patient ID
 * @returns {Promise<{success: boolean, insuranceData?: Object, error?: string}>}
 */
export async function getInsuranceDataFromMemberships(patientId) {
  try {
    if (!patientId) {
      return { success: true, insuranceData: null };
    }

    // Get all memberships for patient
    const membershipsResult = await getPatientMemberships(patientId);
    
    if (!membershipsResult.success || !membershipsResult.memberships || membershipsResult.memberships.length === 0) {
      return { success: true, insuranceData: null };
    }

    // Try to get coverage for each membership until we find one with insurance data
    for (const membership of membershipsResult.memberships) {
      const coverageResult = await getMembershipCoverage(membership.id);
      
      if (coverageResult.success && coverageResult.coverage) {
        const insuranceData = await extractInsuranceDataFromMembership(membership, coverageResult.coverage);
        
        if (insuranceData && insuranceData.memberId) {
          return { success: true, insuranceData };
        }
      }
    }

    // No valid insurance data found
    return { success: true, insuranceData: null };
  } catch (error) {
    console.error('Error getting insurance data from memberships:', error);
    // Don't fail the form - just return null so user can enter manually
    return { success: true, insuranceData: null };
  }
}

export default {
  getPatientMemberships,
  getMembershipCoverage,
  extractInsuranceDataFromMembership,
  getInsuranceDataFromMemberships,
};

