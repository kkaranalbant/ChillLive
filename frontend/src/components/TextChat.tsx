'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { socketService } from '@/lib/socket';

export default function TextChat() {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, matchData, addMessage } = useChatStore();

  useEffect(() => {
    // Listen for incoming messages
    socketService.onChatMessage((msg) => {
      addMessage(msg);
    });

    return () => {
      socketService.off('chat-message');
    };
  }, [addMessage]);

  useEffect(() => {
    // Auto scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !matchData?.roomId) return;

    // Send message
    socketService.sendMessage(matchData.roomId, message);

    // Add to local messages
    addMessage({
      from: 'me',
      message,
      timestamp: new Date(),
    });

    setMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-green-500 w-3 h-3 rounded-full"></div>
          <span className="font-semibold">
            {matchData?.partnerProfile?.username || 'Yabancı'}
          </span>
          {matchData?.partnerProfile?.age && (
            <span className="text-sm opacity-90">
              ({matchData.partnerProfile.age})
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Mesajlaşmaya başlayın...</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.from === 'me'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="break-words">{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.from === 'me' ? 'text-purple-200' : 'text-gray-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
