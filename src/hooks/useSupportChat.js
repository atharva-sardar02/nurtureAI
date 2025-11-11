/**
 * useSupportChat Hook
 * Manages support chat state and interactions
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  createSupportChat,
  getSupportChat,
  sendSupportMessage,
  subscribeToSupportChat,
} from '@/services/support/SupportChatService';

export function useSupportChat(chatId = null) {
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const unsubscribeRef = useRef(null);

  /**
   * Load or create a support chat
   */
  const loadChat = useCallback(async (initialMessage = null) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (chatId) {
        // Load existing chat
        const result = await getSupportChat(chatId);
        if (result.success && result.chat) {
          setChat(result.chat);
          setMessages(result.chat.messages || []);
        } else {
          setError(result.error || 'Failed to load chat');
        }
      } else if (initialMessage) {
        // Create new chat with initial message
        const result = await createSupportChat(user.uid, initialMessage);
        if (result.success && result.chatId) {
          // Load the newly created chat
          const chatResult = await getSupportChat(result.chatId);
          if (chatResult.success && chatResult.chat) {
            setChat(chatResult.chat);
            setMessages(chatResult.chat.messages || []);
          }
        } else {
          setError(result.error || 'Failed to create chat');
        }
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, chatId]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (content) => {
    if (!chat || !content.trim()) {
      return { success: false, error: 'Invalid message or chat' };
    }

    try {
      setSending(true);
      setError(null);

      const result = await sendSupportMessage(chat.id, 'user', content);
      if (result.success) {
        // Message will be added via real-time listener
        return { success: true };
      } else {
        setError(result.error || 'Failed to send message');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSending(false);
    }
  }, [chat]);

  /**
   * Set up real-time listener
   */
  useEffect(() => {
    if (!chat?.id) {
      return;
    }

    // Subscribe to real-time updates
    unsubscribeRef.current = subscribeToSupportChat(chat.id, (updatedChat) => {
      if (updatedChat) {
        setChat(updatedChat);
        setMessages(updatedChat.messages || []);
      }
    });

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [chat?.id]);

  /**
   * Load chat on mount or when chatId changes
   */
  useEffect(() => {
    if (chatId || user) {
      loadChat();
    }
  }, [chatId, user, loadChat]);

  return {
    chat,
    messages,
    loading,
    error,
    sending,
    sendMessage,
    loadChat,
    refreshChat: () => loadChat(),
  };
}

