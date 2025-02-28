import React, { useState, useEffect } from 'react';

import MarketIntelligence from '../components/MarketIntelligence';
import BotMonitor from '../components/BotMonitor';
import TradingStatus from '../components/TradingStatus';
import MarketOverview from '../components/MarketOverview';

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
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bots')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'bots'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}>
            Trading Bots
          </button>
          <button
            onClick={() => setActiveTab('market-intelligence')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'market-intelligence'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}>
            Market Intelligence
          </button>
        </nav>
      </div>

      <div className='w-full p-2'>
        {activeTab === 'overview' ? (
          // Overview Tab Content
          <MarketOverview />
        ) : activeTab === 'bots' ? (
          // Bots Tab Content
          <BotMonitor />
        ) : activeTab === 'market-intelligence' ? (
          // Market Intelligence Tab Content
          <MarketIntelligence />
        ) : null}
      </div>
    </div>
  );
};

export default RootNav;
