/**
 * Firebase Storage Service
 * Handles file uploads and deletions
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';
import { auth } from './config';

/**
 * Upload image to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} folder - Folder path in storage (e.g., 'insurance-cards')
 * @param {string} userId - User ID (required)
 * @returns {Promise<string>} Download URL of uploaded file
 */
export async function uploadImage(file, folder = 'uploads', userId = null) {
  try {
    // Get current user if userId not provided
    if (!userId) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated to upload files');
      }
      userId = currentUser.uid;
    }

    // Create storage reference
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${userId}/${fileName}`);

    // Upload file
    await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('✅ Image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete image from Firebase Storage
 * @param {string} imageUrl - Full URL or path of image to delete
 * @returns {Promise<void>}
 */
export async function deleteImage(imageUrl) {
  try {
    // Extract path from URL if full URL provided
    let imagePath = imageUrl;
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
      // Extract path from Firebase Storage URL
      const urlParts = imageUrl.split('/o/');
      if (urlParts.length > 1) {
        imagePath = decodeURIComponent(urlParts[1].split('?')[0]);
      }
    }

    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    
    console.log('✅ Image deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    // Don't throw - deletion is not critical
  }
}

/**
 * Get download URL for a storage path
 * @param {string} path - Storage path
 * @returns {Promise<string>} Download URL
 */
export async function getImageUrl(path) {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('❌ Error getting image URL:', error);
    throw error;
  }
}

export default {
  uploadImage,
  deleteImage,
  getImageUrl,
};

