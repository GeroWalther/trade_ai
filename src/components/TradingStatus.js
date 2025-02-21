import React, { useState, useEffect } from 'react';
import TradingService from '../services/trading_service';
import MarketOverview from './MarketOverview';
import MarketIntelligence from './MarketIntelligence';
import BotMonitor from './BotMonitor';

const TradingStatus = () => {
  const [tradingStatus, setTradingStatus] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      const data = await TradingService.getTradingStatus();
      setTradingStatus(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching trading data:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className='p-6 bg-rose-900 text-rose-200 rounded'>
        Error: {error}
      </div>
    );
  }

  if (!tradingStatus) {
    return (
      <div className='flex items-center justify-center h-screen bg-blue-950 text-blue-200'>
        <div className='animate-pulse'>Loading trading data...</div>
      </div>
    );
  }

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
          <div>
            <MarketOverview
              marketPrices={tradingStatus.market_prices}
              account={tradingStatus.account}
              positions={tradingStatus.positions}
              onTradeComplete={fetchData}
            />

            {/* Stats and Market Status */}
            <div className='grid grid-cols-2 gap-6 mt-8'>
              {/* Statistics Panel */}
              <div className='bg-[#232a4d] rounded-lg p-6 shadow-lg'>
                <h3 className='text-xl font-bold mb-6 text-blue-100 flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2 text-blue-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    />
                  </svg>
                  Statistics
                </h3>
                <div className='grid grid-cols-3 gap-6'>
                  <div className='bg-[#1a1f3c] p-4 rounded-lg'>
                    <p className='text-blue-300 text-sm mb-2'>Win Rate</p>
                    <p className='text-2xl font-bold'>
                      {tradingStatus.trading_stats?.win_rate || 0}%
                    </p>
                  </div>
                  <div className='bg-[#1a1f3c] p-4 rounded-lg'>
                    <p className='text-blue-300 text-sm mb-2'>Wins</p>
                    <p className='text-2xl font-bold text-emerald-400'>
                      {tradingStatus.trading_stats?.winning_trades || 0}
                    </p>
                  </div>
                  <div className='bg-[#1a1f3c] p-4 rounded-lg'>
                    <p className='text-blue-300 text-sm mb-2'>Losses</p>
                    <p className='text-2xl font-bold text-rose-400'>
                      {tradingStatus.trading_stats?.losing_trades || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Market Status Panel */}
              <div className='bg-[#232a4d] rounded-lg p-6 shadow-lg'>
                <h3 className='text-xl font-bold mb-6 text-blue-100 flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2 text-blue-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
                    />
                  </svg>
                  Market
                </h3>
                <div className='grid grid-cols-2 gap-6'>
                  <div className='bg-[#1a1f3c] p-4 rounded-lg'>
                    <p className='text-blue-300 text-sm mb-2'>Status</p>
                    <p
                      className={`text-lg font-bold ${
                        tradingStatus.market_status.is_market_open
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}>
                      {tradingStatus.market_status.is_market_open
                        ? 'Market Open'
                        : 'Market Closed'}
                    </p>
                  </div>
                  <div className='bg-[#1a1f3c] p-4 rounded-lg'>
                    <p className='text-blue-300 text-sm mb-2'>Active Pairs</p>
                    <div className='flex flex-wrap gap-2'>
                      {tradingStatus.market_status.active_symbols.map(
                        (symbol) => (
                          <span
                            key={symbol}
                            className='px-2 py-1 bg-blue-800 text-blue-200 text-xs rounded-full'>
                            {symbol}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default TradingStatus;
