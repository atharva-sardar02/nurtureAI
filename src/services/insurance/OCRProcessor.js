/**
 * OCR Processor Service
 * Client-side wrapper for OCR processing via Firebase Functions
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebase/config';

/**
 * Process insurance card image with OCR
 * @param {string} imageUrl - URL of the uploaded insurance card image
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function processInsuranceCardOCR(imageUrl) {
  try {
    // Call Firebase Function for OCR processing
    const processCard = httpsCallable(functions, 'processInsuranceCard');
    
    const result = await processCard({ imageUrl });
    
    if (result.data.success) {
      return {
        success: true,
        data: {
          ...result.data.data,
          imageUrl, // Include original image URL
        },
      };
    } else {
      return {
        success: false,
        error: result.data.error || 'OCR processing failed',
      };
    }
  } catch (error) {
    console.error('Error calling OCR function:', error);
    return {
      success: false,
      error: error.message || 'Failed to process insurance card',
    };
  }
}

export default {
  processInsuranceCardOCR,
};

