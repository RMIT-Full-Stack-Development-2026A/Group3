import React, { useState, useRef, useEffect } from 'react';
import { PaperPlaneTilt } from '@phosphor-icons/react';
import { useAuthStore } from '../../../app/store/authStore';

const ChatPanel = ({ messages = [], onSendMessage, currentUser, opponentName = 'Opponent', isLive = true }) => {
  const [messageInput, setMessageInput] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();

  const RATE_LIMIT_MS = 500;
  const activeUser = currentUser || user;
  const activeUserIds = [activeUser?.id, activeUser?._id].filter(Boolean).map(String);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    const now = Date.now();

    // Check rate limiting
    if (now - lastMessageTime < RATE_LIMIT_MS) {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), RATE_LIMIT_MS - (now - lastMessageTime));
      return;
    }

    // Validate message
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage || trimmedMessage.length === 0 || trimmedMessage.length > 200) {
      return;
    }

    // Send message
    onSendMessage(trimmedMessage);

    // Reset input and update rate limit
    setMessageInput('');
    setLastMessageTime(now);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="xl:col-span-3 h-full">
      <div className="glass-panel rounded-xl border border-outline-variant/10 shadow-2xl h-[360px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
          <h4 className="font-headline font-bold text-volt">Live Tactics</h4>
          <div className="flex gap-2 items-center">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-outline'}`} aria-hidden="true"></span>
            <span className={`text-[10px] font-bold ${isLive ? 'text-volt/80' : 'text-on-surface-variant'}`}>{isLive ? 'PLAYING' : 'ENDED'}</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-ethereal" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
              <p>No messages yet. Start chatting!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const senderId = msg.senderId?._id || msg.senderId;
              const isCurrentUser = activeUserIds.includes(String(senderId)) ||
                (!!activeUser?.username && msg.senderName === activeUser.username);
              const displayName = isCurrentUser ? 'YOU' : (msg.senderName || opponentName);
              return (
                <div key={idx} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  <p className={`text-[10px] font-bold tracking-tighter ${
                    isCurrentUser ? 'text-volt' : 'text-secondary'
                  }`}>
                    {displayName}
                  </p>
                  <p className={`mt-1 max-w-[78%] px-3 py-2 text-sm leading-relaxed shadow-sm break-words ${
                    isCurrentUser
                      ? 'rounded-2xl rounded-br-md bg-volt text-volt-ink'
                      : 'rounded-2xl rounded-bl-md bg-surface-container-high text-on-surface'
                  }`}>
                    {msg.message}
                  </p>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-container-high/50 border-t border-outline-variant/10 relative">
          <div className="flex gap-2">
            <label htmlFor="chat-message-input" className="sr-only">Type a message</label>
            <input
              id="chat-message-input"
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isRateLimited}
              placeholder="Type a message…"
              maxLength={200}
              autoComplete="off"
              className="flex-1 bg-surface-container-highest border border-outline-variant/20 rounded-lg py-3 px-4 text-sm text-on-surface placeholder-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={isRateLimited || !messageInput.trim()}
              aria-label="Send message"
              className="p-3 text-volt hover:bg-volt/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60"
            >
              <PaperPlaneTilt size={20} weight="bold" aria-hidden="true" />
            </button>
          </div>

          {/* Character count */}
          <div className="text-[10px] text-on-surface-variant mt-2">
            {messageInput.length}/200
          </div>

          {/* Rate limit feedback */}
          {isRateLimited && (
            <div role="status" aria-live="polite" className="text-[10px] text-warning mt-1">
              Please wait before sending another message…
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
