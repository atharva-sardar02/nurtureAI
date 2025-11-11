/**
 * Insurance Matcher Service
 * Matches patient insurance with clinician acceptance and determines network status
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
 * Check if a clinician accepts a specific insurance
 * @param {string} clinicianId - Clinician ID
 * @param {string} insuranceId - Insurance ID
 * @returns {Promise<boolean>} True if clinician accepts this insurance
 */
export async function clinicianAcceptsInsurance(clinicianId, insuranceId) {
  try {
    const junctionQuery = query(
      collection(db, 'clinicianCredentialedInsurances'),
      where('careProviderProfileId', '==', clinicianId),
      where('insuranceId', '==', insuranceId)
    );
    
    const snapshot = await getDocs(junctionQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking clinician insurance acceptance:', error);
    return false;
  }
}

/**
 * Get all insurances accepted by a clinician
 * @param {string} clinicianId - Clinician ID
 * @returns {Promise<Array>} Array of insurance IDs
 */
export async function getClinicianAcceptedInsurances(clinicianId) {
  try {
    const junctionQuery = query(
      collection(db, 'clinicianCredentialedInsurances'),
      where('careProviderProfileId', '==', clinicianId)
    );
    
    const snapshot = await getDocs(junctionQuery);
    const insuranceIds = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.insuranceId) {
        insuranceIds.push(data.insuranceId);
      }
    });
    
    return insuranceIds;
  } catch (error) {
    console.error('Error getting clinician accepted insurances:', error);
    return [];
  }
}

/**
 * Determine network status (in-network vs out-of-network)
 * @param {string} patientInsuranceId - Patient's insurance ID
 * @param {string} clinicianId - Clinician ID
 * @returns {Promise<{inNetwork: boolean, status: string}>}
 */
export async function determineNetworkStatus(patientInsuranceId, clinicianId) {
  try {
    const accepts = await clinicianAcceptsInsurance(clinicianId, patientInsuranceId);
    
    return {
      inNetwork: accepts,
      status: accepts ? 'in-network' : 'out-of-network',
    };
  } catch (error) {
    console.error('Error determining network status:', error);
    return {
      inNetwork: false,
      status: 'unknown',
    };
  }
}

/**
 * Filter clinicians by insurance acceptance
 * @param {Array} clinicianIds - Array of clinician IDs
 * @param {string} insuranceId - Insurance ID to match
 * @returns {Promise<Array>} Array of clinician IDs that accept this insurance
 */
export async function filterCliniciansByInsurance(clinicianIds, insuranceId) {
  try {
    if (!clinicianIds || clinicianIds.length === 0) {
      return [];
    }
    
    const matchingClinicianIds = [];
    
    // Check each clinician
    for (const clinicianId of clinicianIds) {
      const accepts = await clinicianAcceptsInsurance(clinicianId, insuranceId);
      if (accepts) {
        matchingClinicianIds.push(clinicianId);
      }
    }
    
    return matchingClinicianIds;
  } catch (error) {
    console.error('Error filtering clinicians by insurance:', error);
    return [];
  }
}

/**
 * Get insurance provider name by ID
 * @param {string} insuranceId - Insurance ID
 * @returns {Promise<string|null>} Insurance provider name or null
 */
export async function getInsuranceProviderName(insuranceId) {
  try {
    const insuranceDoc = await getDoc(doc(db, 'credentialedInsurances', insuranceId));
    
    if (!insuranceDoc.exists()) {
      return null;
    }
    
    const data = insuranceDoc.data();
    return data.name || data.provider || data.insuranceName || null;
  } catch (error) {
    console.error('Error getting insurance provider name:', error);
    return null;
  }
}

/**
 * Get all available insurance providers
 * @returns {Promise<Array>} Array of insurance providers with id and name
 */
export async function getAllInsuranceProviders() {
  try {
    const insuranceQuery = query(collection(db, 'credentialedInsurances'));
    const snapshot = await getDocs(insuranceQuery);
    
    const providers = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      providers.push({
        id: doc.id,
        name: data.name || data.provider || data.insuranceName || 'Unknown',
      });
    });
    
    return providers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting all insurance providers:', error);
    return [];
  }
}

/**
 * Match OCR extracted provider name to insurance provider ID
 * @param {string} providerName - Provider name from OCR (e.g., "AETNA", "UNITED HEALTHCARE")
 * @returns {Promise<string|null>} Insurance provider ID or null if not found
 */
export async function matchProviderNameToId(providerName) {
  try {
    if (!providerName) {
      return null;
    }

    const insuranceQuery = query(collection(db, 'credentialedInsurances'));
    const snapshot = await getDocs(insuranceQuery);
    
    const normalizedOCRName = providerName.toUpperCase().trim();
    
    // Try exact match first
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const insuranceName = (data.name || data.provider || data.insuranceName || '').toUpperCase();
      
      if (insuranceName === normalizedOCRName) {
        return doc.id;
      }
    }
    
    // Try partial match (contains)
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const insuranceName = (data.name || data.provider || data.insuranceName || '').toUpperCase();
      
      // Check if OCR name contains insurance name or vice versa
      if (normalizedOCRName.includes(insuranceName) || insuranceName.includes(normalizedOCRName)) {
        return doc.id;
      }
    }
    
    // Try fuzzy matching for common variations
    const commonMappings = {
      'AETNA': ['AETNA'],
      'UNITED HEALTHCARE': ['UNITED HEALTHCARE', 'UNITEDHEALTHCARE', 'UHC'],
      'BLUE CROSS': ['BLUE CROSS', 'BLUE CROSS BLUE SHIELD', 'BCBS'],
      'CIGNA': ['CIGNA'],
      'ANTHEM': ['ANTHEM', 'ANTHEM BLUE CROSS'],
      'MOLINA': ['MOLINA'],
      'MEDICARE': ['MEDICARE'],
      'MEDICAID': ['MEDICAID'],
    };
    
    for (const [key, variations] of Object.entries(commonMappings)) {
      if (variations.some(v => normalizedOCRName.includes(v))) {
        // Find matching insurance in database
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const insuranceName = (data.name || data.provider || data.insuranceName || '').toUpperCase();
          if (variations.some(v => insuranceName.includes(v))) {
            return doc.id;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error matching provider name to ID:', error);
    return null;
  }
}

export default {
  clinicianAcceptsInsurance,
  getClinicianAcceptedInsurances,
  determineNetworkStatus,
  filterCliniciansByInsurance,
  getInsuranceProviderName,
  getAllInsuranceProviders,
  matchProviderNameToId,
};

