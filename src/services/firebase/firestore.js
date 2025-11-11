/**
 * Firestore Service
 * Provides functions for Firestore database operations
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config.js';

/**
 * Create user profile document in Firestore
 * @param {string} userId - Firebase Auth user ID
 * @param {Object} userData - User data to store
 * @param {string} authProvider - Authentication provider ('email' or 'google.com')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createUserProfile(userId, userData = {}, authProvider = 'email') {
  try {
    const userRef = doc(db, 'users', userId);
    
    const profileData = {
      email: userData.email || '',
      displayName: userData.displayName || userData.name || '',
      photoURL: userData.photoURL || '',
      authProvider,
      role: 'parent', // Default role for onboarding users
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Data retention settings
      dataRetentionConsent: false, // User will be asked during onboarding
      conversationRetentionDays: 90, // Default 90-day retention
      // Profile completion status
      onboardingCompleted: false,
      // Metadata
      lastLoginAt: serverTimestamp(),
      ...userData,
    };

    await setDoc(userRef, profileData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user profile from Firestore
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user profile in Firestore
 * @param {string} userId - Firebase Auth user ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateUserProfile(userId, updates) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update last login timestamp
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateLastLogin(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating last login:', error);
    return { success: false, error: error.message };
  }
}

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateLastLogin,
};

