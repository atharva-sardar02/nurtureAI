/**
 * Support Chat Component
 * Real-time chat interface for connecting with Daybreak support team
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useSupportChat } from '@/hooks/useSupportChat';
import { MessageCircle, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Message Bubble Component
 */
function MessageBubble({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          {message.timestamp instanceof Date
            ? message.timestamp.toLocaleTimeString()
            : new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

/**
 * SupportChat Component
 * @param {Object} props
 * @param {string} props.chatId - Optional existing chat ID
 * @param {string} props.initialMessage - Optional initial message to start chat
 */
export function SupportChat({ chatId = null, initialMessage = null }) {
  const { chat, messages, loading, error, sending, sendMessage, loadChat } = useSupportChat(chatId);
  const [messageInput, setMessageInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Start a new chat if no chatId and initialMessage is provided
  const handleStartChat = async () => {
    if (!messageInput.trim() && !initialMessage) {
      return;
    }

    setIsStarting(true);
    try {
      await loadChat(messageInput.trim() || initialMessage);
      setMessageInput('');
    } catch (err) {
      console.error('Error starting chat:', err);
    } finally {
      setIsStarting(false);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) {
      return;
    }

    const content = messageInput.trim();
    setMessageInput('');

    await sendMessage(content);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chat) {
        handleSendMessage();
      } else {
        handleStartChat();
      }
    }
  };

  // Show loading state
  if (loading && !chat) {
    return (
      <Card className="border border-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Support Chat
          </CardTitle>
          <CardDescription>
            Connect with our support team for assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading chat..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show start chat interface if no chat exists
  if (!chat) {
    return (
      <Card className="border border-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Support Chat
          </CardTitle>
          <CardDescription>
            Connect with our support team for assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              Our support team is here to help! Start a conversation by typing your question or concern below.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Input
              placeholder="Type your message here..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isStarting}
            />
            <Button
              onClick={handleStartChat}
              disabled={!messageInput.trim() || isStarting}
              className="w-full"
            >
              {isStarting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Starting chat...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show active chat interface
  return (
    <Card className="border border-border shadow-lg flex flex-col h-[600px]">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Support Chat
            </CardTitle>
            <CardDescription>
              {chat.status === 'active' ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Active - Support team will respond soon
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Resolved
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4" ref={scrollAreaRef}>
          <ScrollArea className="h-full">
            <div className="py-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    isUser={message.role === 'user'}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 pb-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Input Area */}
        {chat.status === 'active' ? (
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sending}
                size="icon"
              >
                {sending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t p-4 flex-shrink-0">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                This chat has been resolved. If you need further assistance, please start a new chat.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

