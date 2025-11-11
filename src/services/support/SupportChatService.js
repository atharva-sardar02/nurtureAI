/**
 * Support Chat Service
 * Manages support chat operations with Firestore
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';

/**
 * Create a new support chat
 * @param {string} userId - User ID
 * @param {string} initialMessage - Initial message from user
 * @returns {Promise<{success: boolean, chatId?: string, error?: string}>}
 */
export async function createSupportChat(userId, initialMessage) {
  try {
    const chatRef = await addDoc(collection(db, 'supportChats'), {
      userId,
      messages: [
        {
          role: 'user',
          content: initialMessage,
          timestamp: serverTimestamp(),
        },
      ],
      status: 'active',
      assignedTo: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, chatId: chatRef.id };
  } catch (error) {
    console.error('Error creating support chat:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a support chat by ID
 * @param {string} chatId - Chat ID
 * @returns {Promise<{success: boolean, chat?: Object, error?: string}>}
 */
export async function getSupportChat(chatId) {
  try {
    const chatDoc = await getDoc(doc(db, 'supportChats', chatId));

    if (!chatDoc.exists()) {
      return { success: false, error: 'Chat not found' };
    }

    const chatData = chatDoc.data();
    return {
      success: true,
      chat: {
        id: chatDoc.id,
        ...chatData,
        messages: chatData.messages?.map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
        })) || [],
      },
    };
  } catch (error) {
    console.error('Error getting support chat:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all support chats for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, chats?: Array, error?: string}>}
 */
export async function getUserSupportChats(userId) {
  try {
    const q = query(
      collection(db, 'supportChats'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const chats = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      chats.push({
        id: doc.id,
        ...data,
        messages: data.messages?.map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
        })) || [],
      });
    });

    return { success: true, chats };
  } catch (error) {
    console.error('Error getting user support chats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all active support chats (for support team)
 * @returns {Promise<{success: boolean, chats?: Array, error?: string}>}
 */
export async function getActiveSupportChats() {
  try {
    const q = query(
      collection(db, 'supportChats'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const chats = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      chats.push({
        id: doc.id,
        ...data,
        messages: data.messages?.map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
        })) || [],
      });
    });

    return { success: true, chats };
  } catch (error) {
    console.error('Error getting active support chats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a message in a support chat
 * @param {string} chatId - Chat ID
 * @param {string} role - Message role ('user' | 'support')
 * @param {string} content - Message content
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendSupportMessage(chatId, role, content) {
  try {
    const chatRef = doc(db, 'supportChats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      return { success: false, error: 'Chat not found' };
    }

    const currentMessages = chatDoc.data().messages || [];
    const newMessage = {
      role,
      content,
      timestamp: serverTimestamp(),
    };

    await updateDoc(chatRef, {
      messages: [...currentMessages, newMessage],
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending support message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Assign a support chat to a support team member
 * @param {string} chatId - Chat ID
 * @param {string} supportMemberId - Support team member ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function assignSupportChat(chatId, supportMemberId) {
  try {
    const chatRef = doc(db, 'supportChats', chatId);
    await updateDoc(chatRef, {
      assignedTo: supportMemberId,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error assigning support chat:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Resolve a support chat
 * @param {string} chatId - Chat ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function resolveSupportChat(chatId) {
  try {
    const chatRef = doc(db, 'supportChats', chatId);
    await updateDoc(chatRef, {
      status: 'resolved',
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error resolving support chat:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to real-time updates for a support chat
 * @param {string} chatId - Chat ID
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToSupportChat(chatId, callback) {
  const chatRef = doc(db, 'supportChats', chatId);

  return onSnapshot(chatRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        id: snapshot.id,
        ...data,
        messages: data.messages?.map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
        })) || [],
      });
    } else {
      callback(null);
    }
  });
}

/**
 * Subscribe to real-time updates for all active support chats (for support team)
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToActiveSupportChats(callback) {
  const q = query(
    collection(db, 'supportChats'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      chats.push({
        id: doc.id,
        ...data,
        messages: data.messages?.map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
        })) || [],
      });
    });
    callback(chats);
  });
}

export default {
  createSupportChat,
  getSupportChat,
  getUserSupportChats,
  getActiveSupportChats,
  sendSupportMessage,
  assignSupportChat,
  resolveSupportChat,
  subscribeToSupportChat,
  subscribeToActiveSupportChats,
};

