import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { config } from '../config';

const AIChat = () => {
  // Load messages from localStorage or use default
  const loadMessages = () => {
    try {
      const savedMessages = localStorage.getItem('aiChatMessages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (error) {
      console.error('Error loading chat messages from localStorage:', error);
    }

    // Default welcome message
    return [
      {
        id: 1,
        type: 'ai',
        content:
          "Hello! I'm your AI Finance Expert. I can help you with trading strategies, market analysis, economic insights, and investment advice or teach you about the macroeconomy. I also have information about your account positions and balance. What would you like to know?",
        timestamp: new Date(),
      },
    ];
  };

  const [messages, setMessages] = useState(loadMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem('aiChatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat messages to localStorage:', error);
      // If localStorage is full or disabled, show a warning
      if (error.name === 'QuotaExceededError') {
        console.warn(
          'LocalStorage quota exceeded. Chat history may not be saved.'
        );
      }
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear chat function with confirmation
  const clearChat = () => {
    if (
      window.confirm(
        'Are you sure you want to clear the chat history? This action cannot be undone.'
      )
    ) {
      const defaultMessage = {
        id: Date.now(),
        type: 'ai',
        content:
          "Hello! I'm your AI Finance Expert. I can help you with trading strategies, market analysis, economic insights, and investment advice or teach you about the macroeconomy. I also have information about your account positions and balance. What would you like to know?",
        timestamp: new Date(),
      };
      setMessages([defaultMessage]);
    }
  };

  // Export chat history function
  const exportChat = () => {
    try {
      const exportDate = new Date();
      const formattedDate = exportDate.toLocaleDateString();
      const formattedTime = exportDate.toLocaleTimeString();

      let chatText = `AI Finance Expert - Chat Export\n`;
      chatText += `=================================================\n`;
      chatText += `Export Date: ${formattedDate} at ${formattedTime}\n`;
      chatText += `Total Messages: ${messages.length}\n`;
      chatText += `=================================================\n\n`;

      messages.forEach((msg, index) => {
        const timestamp = msg.timestamp.toLocaleString();
        const sender = msg.type === 'ai' ? 'AI Finance Expert' : 'You';
        const searchBadge = msg.webSearchPerformed ? ' [🔍 Live Search]' : '';

        chatText += `[${timestamp}] ${sender}${searchBadge}:\n`;
        chatText += `${msg.content}\n`;

        // Add sources if available
        if (msg.sources && msg.sources.length > 0) {
          chatText += `\nSources:\n`;
          msg.sources.forEach((source, sourceIndex) => {
            chatText += `  ${sourceIndex + 1}. ${source.title}\n`;
            chatText += `     ${source.url}\n`;
            if (source.snippet) {
              chatText += `     "${source.snippet}"\n`;
            }
          });
        }

        chatText += `\n${'-'.repeat(50)}\n\n`;
      });

      chatText += `\nExported from AI Finance Expert Chat\n`;
      chatText += `Total conversation length: ${messages.length} messages\n`;

      const dataUri =
        'data:text/plain;charset=utf-8,' + encodeURIComponent(chatText);
      const exportFileDefaultName = `ai-chat-export-${
        new Date().toISOString().split('T')[0]
      }.txt`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting chat:', error);
      alert('Failed to export chat history. Please try again.');
    }
  };

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
        webSearchPerformed: response.data.web_search_performed || false,
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
    'What are the latest EUR/USD news?',
    'Tell me about recent Fed policy decisions',
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
        <div className='ml-auto flex items-center space-x-3'>
          {/* Message Count & Chat Controls */}
          <div className='flex items-center space-x-2'>
            <span className='text-xs text-gray-500'>
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>

            {/* Export Button */}
            <button
              onClick={exportChat}
              className='flex items-center space-x-1 px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs text-gray-300 transition-colors'
              title='Export Chat History'>
              <svg
                className='w-3 h-3'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              <span>Export</span>
            </button>

            {/* Clear Button */}
            <button
              onClick={clearChat}
              className='flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors'
              title='Clear Chat History'>
              <svg
                className='w-3 h-3'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
              <span>Clear</span>
            </button>
          </div>

          {/* Online Status */}
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
            <span className='text-xs text-green-400'>Online</span>
          </div>
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
                  {message.webSearchPerformed && (
                    <div className='flex items-center space-x-1 px-2 py-1 bg-green-900 bg-opacity-30 rounded-full border border-green-600'>
                      <span className='text-green-400 text-xs'>🔍</span>
                      <span className='text-xs text-green-400'>
                        Live Search
                      </span>
                    </div>
                  )}
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
                  Searching markets & analyzing data...
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
        <div className='flex justify-between items-center mt-1'>
          <p className='text-xs text-gray-500'>
            Press Enter to send • Shift+Enter for new line
          </p>
          <p className='text-xs text-gray-500 flex items-center space-x-1'>
            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z' />
            </svg>
            <span>Chat auto-saved</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
