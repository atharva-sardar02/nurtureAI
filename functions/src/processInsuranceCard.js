/**
 * Firebase Function: Process Insurance Card OCR
 * Uses Google Cloud Vision API to extract text from insurance card images
 */

const { onCall } = require('firebase-functions/v2/https');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

// Initialize Vision client lazily to avoid timeout during module load
let vision = null;
function getVisionClient() {
  if (!vision) {
    vision = new ImageAnnotatorClient();
  }
  return vision;
}

/**
 * Extract insurance information from OCR text
 * @param {string} text - Full text from OCR
 * @returns {Object} Extracted insurance data
 */
function extractInsuranceData(text) {
  const data = {
    memberId: null,
    groupNumber: null,
    provider: null,
    planName: null,
  };

  // Normalize text for easier parsing
  const normalizedText = text.toUpperCase().replace(/\s+/g, ' ');

  // Extract Member ID patterns
  // Common patterns: "MEMBER ID:", "ID:", "MEMBER #", "SUBSCRIBER ID"
  const memberIdPatterns = [
    /MEMBER\s*ID[:\s]*([A-Z0-9-]+)/i,
    /ID[:\s]*([A-Z0-9-]{6,})/i,
    /MEMBER\s*#?[:\s]*([A-Z0-9-]+)/i,
    /SUBSCRIBER\s*ID[:\s]*([A-Z0-9-]+)/i,
  ];

  for (const pattern of memberIdPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.memberId = match[1].trim();
      break;
    }
  }

  // Extract Group Number patterns
  // Common patterns: "GROUP:", "GROUP #", "GRP:", "POLICY GROUP"
  const groupNumberPatterns = [
    /GROUP\s*#?[:\s]*([A-Z0-9-]+)/i,
    /GRP[:\s]*([A-Z0-9-]+)/i,
    /POLICY\s*GROUP[:\s]*([A-Z0-9-]+)/i,
  ];

  for (const pattern of groupNumberPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.groupNumber = match[1].trim();
      break;
    }
  }

  // Extract Insurance Provider
  // Common providers: Aetna, United Healthcare, Blue Cross, Cigna, etc.
  const providerPatterns = [
    /(AETNA)/i,
    /(UNITED\s*HEALTHCARE)/i,
    /(BLUE\s*CROSS)/i,
    /(CIGNA)/i,
    /(ANTHEM)/i,
    /(MOLINA)/i,
    /(MEDICARE)/i,
    /(MEDICAID)/i,
  ];

  for (const pattern of providerPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.provider = match[1].trim();
      break;
    }
  }

  // Extract Plan Name (usually after "PLAN:", "PLAN NAME:", etc.)
  const planNamePatterns = [
    /PLAN\s*NAME[:\s]*([A-Z0-9\s-]+)/i,
    /PLAN[:\s]*([A-Z0-9\s-]+)/i,
  ];

  for (const pattern of planNamePatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      data.planName = match[1].trim();
      break;
    }
  }

  return data;
}

/**
 * Process insurance card image with Google Cloud Vision API
 */
exports.processInsuranceCard = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      const { imageUrl } = request.data;

      if (!imageUrl) {
        return {
          success: false,
          error: 'Image URL is required',
        };
      }

      // Download image from Firebase Storage URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to download image');
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      // Perform OCR using Google Cloud Vision API
      const visionClient = getVisionClient();
      const [result] = await visionClient.documentTextDetection(
        Buffer.from(imageBuffer)
      );

      if (!result.textAnnotations || result.textAnnotations.length === 0) {
        return {
          success: false,
          error: 'No text detected in image',
        };
      }

      // Get full text from first annotation (contains all detected text)
      const fullText = result.textAnnotations[0].description || '';

      // Extract structured data from OCR text
      const extractedData = extractInsuranceData(fullText);

      // Calculate confidence (simplified - based on how much data we extracted)
      const extractedFields = Object.values(extractedData).filter(v => v !== null).length;
      const confidence = extractedFields > 0 ? Math.min(0.9, 0.5 + (extractedFields * 0.1)) : 0.3;

      return {
        success: true,
        data: {
          ...extractedData,
          fullText, // Include full text for debugging
          confidence,
          rawOCR: result.textAnnotations[0],
        },
      };
    } catch (error) {
      console.error('Error processing insurance card:', error);
      return {
        success: false,
        error: error.message || 'Failed to process insurance card',
      };
    }
  }
);
