/**
 * Support Team Dashboard Component
 * Admin view for support team to manage active chats
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  getActiveSupportChats,
  assignSupportChat,
  resolveSupportChat,
  subscribeToActiveSupportChats,
  sendSupportMessage,
} from '@/services/support/SupportChatService';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, CheckCircle2, User, Clock, Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * SupportChatCard Component
 */
function SupportChatCard({ chat, onAssign, onResolve, onOpen, currentUserId }) {
  const isAssigned = chat.assignedTo === currentUserId;
  const unreadCount = chat.messages?.filter(
    (msg) => msg.role === 'user' && !msg.read
  ).length || 0;

  return (
    <Card className="border border-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Chat #{chat.id.slice(0, 8)}
          </CardTitle>
          <Badge variant={isAssigned ? 'default' : 'outline'}>
            {isAssigned ? 'Assigned to You' : chat.assignedTo ? 'Assigned' : 'Unassigned'}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          User: {chat.userId?.slice(0, 8)}... | Created:{' '}
          {chat.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <p className="line-clamp-2">
            {chat.messages?.[0]?.content || 'No messages yet'}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {chat.messages?.length || 0} messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {!isAssigned && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAssign(chat.id)}
              >
                Assign to Me
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpen(chat.id)}
            >
              Open
            </Button>
            {isAssigned && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResolve(chat.id)}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Resolve
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SupportTeamDashboard Component
 */
export function SupportTeamDashboard() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load active chats
  useEffect(() => {
    async function loadChats() {
      try {
        setLoading(true);
        const result = await getActiveSupportChats();
        if (result.success) {
          setChats(result.chats || []);
        } else {
          setError(result.error || 'Failed to load chats');
        }
      } catch (err) {
        console.error('Error loading chats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToActiveSupportChats((updatedChats) => {
      setChats(updatedChats);
      
      // Play notification sound if enabled and new chat arrived
      if (notificationsEnabled && updatedChats.length > chats.length) {
        playNotificationSound();
      }
    });

    return () => unsubscribe();
  }, [notificationsEnabled, chats.length]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSdTgwOUKjj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDknU4MDlCo4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if audio can't play
      });
    } catch (err) {
      // Ignore errors
    }
  };

  // Assign chat to current user
  const handleAssign = async (chatId) => {
    try {
      const result = await assignSupportChat(chatId, user.uid);
      if (!result.success) {
        setError(result.error || 'Failed to assign chat');
      }
    } catch (err) {
      console.error('Error assigning chat:', err);
      setError(err.message);
    }
  };

  // Resolve chat
  const handleResolve = async (chatId) => {
    try {
      const result = await resolveSupportChat(chatId);
      if (result.success) {
        setSelectedChat(null);
      } else {
        setError(result.error || 'Failed to resolve chat');
      }
    } catch (err) {
      console.error('Error resolving chat:', err);
      setError(err.message);
    }
  };

  // Send message as support
  const handleSendMessage = async () => {
    if (!selectedChat || !messageInput.trim() || sending) {
      return;
    }

    try {
      setSending(true);
      const result = await sendSupportMessage(selectedChat.id, 'support', messageInput.trim());
      if (result.success) {
        setMessageInput('');
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Open chat in detail view
  const handleOpenChat = (chatId) => {
    const chat = chats.find((c) => c.id === chatId);
    setSelectedChat(chat);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading support chats..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Team Dashboard</h1>
          <p className="text-muted-foreground">
            Manage active support chats and respond to users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            <Bell className={`w-4 h-4 mr-2 ${notificationsEnabled ? 'text-primary' : ''}`} />
            {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Chats List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Chats ({chats.length})</CardTitle>
            <CardDescription>
              Chats waiting for support team response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {chats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No active chats</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <SupportChatCard
                      key={chat.id}
                      chat={chat}
                      onAssign={handleAssign}
                      onResolve={handleResolve}
                      onOpen={handleOpenChat}
                      currentUserId={user?.uid}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Selected Chat Detail */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedChat ? `Chat #${selectedChat.id.slice(0, 8)}` : 'Select a Chat'}
            </CardTitle>
            <CardDescription>
              {selectedChat
                ? 'View and respond to messages'
                : 'Click on a chat to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedChat ? (
              <div className="space-y-4">
                <ScrollArea className="h-[500px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {selectedChat.messages?.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.role === 'user'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {message.timestamp instanceof Date
                              ? message.timestamp.toLocaleTimeString()
                              : new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your response..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sending}
                  >
                    Send
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a chat from the list to view messages</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

