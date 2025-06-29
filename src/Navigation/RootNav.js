import React, { useState } from 'react';

import MarketOverview from '../components/MarketOverview';
import { AIAnalysis } from '../components/AIAlanysis';
import MasterBot from '../components/MasterBot';
import AIChat from '../components/AIChat';
import TradingBots from '../components/TradingBots';

export const RootNav = () => {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className='bg-[#1a1f3c] rounded-lg shadow-xl'>
      {/* Tab Navigation */}
      <div className='border-b border-gray-700'>
        <nav className='flex space-x-4 px-4' aria-label='Tabs'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'overview'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}>
            🔍 Market Overview
          </button>
          <button
            onClick={() => setActiveTab('master-bot')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'master-bot'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}>
            🚀 Master AI Bot
          </button>
          <button
            onClick={() => setActiveTab('bots')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'bots'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}>
            🤖 Trading Bots
          </button>
          {/* <button
            onClick={() => setActiveTab('market-intelligence')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'market-intelligence'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}>
            Market Intelligence
          </button> */}
          <button
            onClick={() => setActiveTab('ai-analysis')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'ai-analysis'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}>
            ⚡️ AI Analysis
          </button>
          <button
            onClick={() => setActiveTab('ai-chat')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'ai-chat'
                ? 'text-purple-500 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}>
            🤖 AI Chat
          </button>
        </nav>
      </div>

      <div className='w-full p-2'>
        {activeTab === 'master-bot' ? (
          // Master Bot Tab Content
          <MasterBot />
        ) : activeTab === 'overview' ? (
          // Overview Tab Content
          <MarketOverview />
        ) : activeTab === 'bots' ? (
          // Trading Bots Tab Content
          <TradingBots />
        ) : //  : activeTab === 'market-intelligence' ? (
        //   // Market Intelligence Tab Content
        //   <MarketIntelligence />
        // )
        activeTab === 'ai-analysis' ? (
          // AI Analysis Tab Content
          <AIAnalysis />
        ) : activeTab === 'ai-chat' ? (
          // AI Chat Tab Content
          <AIChat />
        ) : (
          <div>
            <h1>404</h1>
            <p>Page not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RootNav;
