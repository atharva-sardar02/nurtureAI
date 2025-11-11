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
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
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

/**
 * Conversation Storage Functions
 */

/**
 * Save a conversation to Firestore
 * @param {string} userId - User ID
 * @param {Array} messages - Array of message objects
 * @param {Object} assessmentData - Assessment data
 * @param {string} onboardingApplicationId - Optional onboarding application ID
 * @returns {Promise<{success: boolean, conversationId?: string, error?: string}>}
 */
export async function saveConversation(userId, messages, assessmentData = null, onboardingApplicationId = null) {
  try {
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      userId,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp instanceof Date 
          ? Timestamp.fromDate(msg.timestamp) 
          : Timestamp.now(),
      })),
      assessmentData,
      onboardingApplicationId,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)), // 90 days from now
    });

    console.log('✅ Conversation saved:', conversationRef.id);
    return { success: true, conversationId: conversationRef.id };
  } catch (error) {
    console.error('❌ Error saving conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get conversations for a user
 * @param {string} userId - User ID
 * @param {number} limitCount - Maximum number of conversations to retrieve
 * @returns {Promise<{success: boolean, conversations?: Array, error?: string}>}
 */
export async function getUserConversations(userId, limitCount = 10) {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, conversations };
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteConversation(conversationId) {
  try {
    await deleteDoc(doc(db, 'conversations', conversationId));
    console.log('✅ Conversation deleted:', conversationId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete all conversations for a user (data deletion request)
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, deletedCount?: number, error?: string}>}
 */
export async function deleteAllUserConversations(userId) {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log('✅ All conversations deleted for user:', userId);
    return { success: true, deletedCount: querySnapshot.docs.length };
  } catch (error) {
    console.error('❌ Error deleting user conversations:', error);
    return { success: false, error: error.message };
  }
}

export default {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateLastLogin,
  saveConversation,
  getUserConversations,
  deleteConversation,
  deleteAllUserConversations,
};

