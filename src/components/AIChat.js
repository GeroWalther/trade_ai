import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { config } from '../config';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content:
        "Hello! I'm your AI Finance Expert. I can help you with trading strategies, market analysis, economic insights, and investment advice or teach you about the macroeconomy. I also have information about your account positions and balance. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${config.api.tradingUrl}/ai-chat`, {
        message: userMessage.content,
        conversation_history: messages.slice(-5), // Send last 5 messages for context
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        sources: response.data.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content:
          "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const suggestedQuestions = [
    "What's happening in the markets today?",
    'What are the key economic events this week?',
    'Tell me about the latest Fed policy decisions',
  ];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className='flex flex-col h-[calc(100vh-60px)] bg-[#232a4d] rounded-lg'>
      {/* Header */}
      <div className='flex items-center p-3 border-b border-gray-600 bg-[#1a1f3c] rounded-t-lg'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>🤖</span>
          </div>
          <div>
            <h2 className='text-base font-semibold text-white'>
              AI Finance Expert
            </h2>
            <p className='text-xs text-gray-400'>
              Real-time market insights • Investment advice • Trading strategies
            </p>
          </div>
        </div>
        <div className='ml-auto flex items-center space-x-2'>
          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
          <span className='text-xs text-green-400'>Online</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className='flex-1 overflow-y-auto p-3 space-y-3 min-h-0'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}>
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1a1f3c] text-gray-100 border border-gray-600'
              }`}>
              {message.type === 'ai' && (
                <div className='flex items-center space-x-2 mb-2'>
                  <div className='w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                    <span className='text-white text-xs'>🤖</span>
                  </div>
                  <span className='text-xs text-gray-400'>
                    AI Finance Expert
                  </span>
                </div>
              )}

              <div className='whitespace-pre-wrap text-sm leading-relaxed'>
                {message.content}
              </div>

              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className='mt-3 p-2 bg-[#0f1419] rounded border border-gray-700'>
                  <h4 className='text-xs font-semibold text-green-400 mb-2'>
                    🔗 Sources
                  </h4>
                  <div className='space-y-2'>
                    {message.sources.map((source, index) => (
                      <div key={index} className='text-xs'>
                        <a
                          href={source.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-400 hover:text-blue-300 underline'>
                          {source.title}
                        </a>
                        <p className='text-gray-400 mt-1 text-xs'>
                          {source.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='text-xs text-gray-500 mt-2'>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className='flex justify-start'>
            <div className='bg-[#1a1f3c] text-gray-100 border border-gray-600 rounded-lg p-3 max-w-[85%]'>
              <div className='flex items-center space-x-2 mb-2'>
                <div className='w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                  <span className='text-white text-xs'>🤖</span>
                </div>
                <span className='text-xs text-gray-400'>AI Finance Expert</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='flex space-x-1'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'></div>
                  <div
                    className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                    style={{ animationDelay: '0.1s' }}></div>
                  <div
                    className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                    style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className='text-sm text-gray-400'>
                  Analyzing market data...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions - Only show initially and make more compact */}
      {messages.length <= 1 && (
        <div className='p-3 border-t border-gray-600 bg-[#1a1f3c]'>
          <h3 className='text-xs font-semibold text-gray-300 mb-2'>
            💡 Try asking me:
          </h3>
          <div className='grid grid-cols-3 gap-2'>
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className='text-left p-2 bg-[#232a4d] hover:bg-[#2a3455] rounded text-xs text-gray-300 border border-gray-600 transition-colors'>
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - Made more compact */}
      <div className='p-3 border-t border-gray-600 bg-[#1a1f3c] rounded-b-lg'>
        <div className='flex space-x-3'>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Ask me about markets, trading strategies, economic data...'
            className='flex-1 p-2 bg-[#232a4d] border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2'>
            <span className='text-sm'>Send</span>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
              />
            </svg>
          </button>
        </div>
        <p className='text-xs text-gray-500 mt-1'>
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIChat;
