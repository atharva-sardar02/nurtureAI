/**
 * Referral Tracker Service
 * Manages referral data lookup and tracking
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
 * Get referral information for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<{success: boolean, referral?: Object, error?: string}>}
 */
export async function getPatientReferral(patientId) {
  try {
    if (!patientId) {
      return { success: false, error: 'Patient ID is required' };
    }

    const referralQuery = query(
      collection(db, 'referrals'),
      where('patientId', '==', patientId)
    );

    const snapshot = await getDocs(referralQuery);

    if (snapshot.empty) {
      return { success: true, referral: null };
    }

    // Get the most recent referral
    const referralDoc = snapshot.docs[0];
    const referralData = referralDoc.data();

    // Get referral members if available
    const membersQuery = query(
      collection(db, 'referralMembers'),
      where('referralId', '==', referralDoc.id)
    );

    const membersSnapshot = await getDocs(membersQuery);
    const members = [];
    membersSnapshot.forEach((doc) => {
      members.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      referral: {
        id: referralDoc.id,
        ...referralData,
        members: members,
      },
    };
  } catch (error) {
    console.error('Error getting patient referral:', error);
    return {
      success: false,
      error: error.message || 'Failed to get referral information',
    };
  }
}

/**
 * Get organization information by ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<{success: boolean, organization?: Object, error?: string}>}
 */
export async function getOrganization(organizationId) {
  try {
    if (!organizationId) {
      return { success: false, error: 'Organization ID is required' };
    }

    const orgDoc = await getDoc(doc(db, 'organizations', organizationId));

    if (!orgDoc.exists()) {
      return { success: false, error: 'Organization not found' };
    }

    return {
      success: true,
      organization: {
        id: orgDoc.id,
        ...orgDoc.data(),
      },
    };
  } catch (error) {
    console.error('Error getting organization:', error);
    return {
      success: false,
      error: error.message || 'Failed to get organization information',
    };
  }
}

/**
 * Get referral source display name
 * @param {Object} referral - Referral data object
 * @returns {string} Display name for referral source
 */
export function getReferralSourceName(referral) {
  if (!referral) {
    return null;
  }

  // Check for sourceName field
  if (referral.sourceName) {
    return referral.sourceName;
  }

  // Check referralData object
  if (referral.referralData?.sourceName) {
    return referral.referralData.sourceName;
  }

  // Check source field and format
  if (referral.source) {
    const sourceMap = {
      school: 'School',
      provider: 'Healthcare Provider',
      self: 'Self-Referral',
      other: 'Other',
    };
    return sourceMap[referral.source] || referral.source;
  }

  return null;
}

/**
 * Format referral information for display
 * @param {Object} referral - Referral data object
 * @returns {Object} Formatted referral info with displayName and sourceType
 */
export function formatReferralInfo(referral) {
  if (!referral) {
    return null;
  }

  const sourceName = getReferralSourceName(referral);
  const sourceType = referral.source || referral.referralData?.source || 'unknown';

  return {
    sourceName: sourceName,
    sourceType: sourceType,
    referralId: referral.id,
    displayInOnboarding: referral.displayInOnboarding !== false, // Default to true
    organizationId: referral.organizationId || referral.referralData?.organizationId,
    members: referral.members || [],
  };
}

export default {
  getPatientReferral,
  getOrganization,
  getReferralSourceName,
  formatReferralInfo,
};

