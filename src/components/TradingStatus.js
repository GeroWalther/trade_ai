import React, { useState, useEffect } from 'react';
import tradingService from '../services/trading_service';
import MarketOverview from './MarketOverview';

const TradingStatus = () => {
  const [tradingStatus, setTradingStatus] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const data = await tradingService.getTradingStatus();
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
    <div className='min-h-screen bg-[#1a1f3c] text-white w-full m-0 p-0'>
      <div className='w-full'>
        <MarketOverview
          marketPrices={tradingStatus.market_prices}
          account={tradingStatus.account}
          positions={tradingStatus.positions}
        />

        {/* Active Positions */}
        <div className='mt-4 bg-[#232a4d]'>
          <h3 className='text-xl font-bold mb-6 text-blue-100'>Positions</h3>
          <div className='grid gap-4'>
            {Object.entries(tradingStatus.positions || {}).map(
              ([symbol, position]) => (
                <div
                  key={symbol}
                  className='border-l-4 border-blue-700 pl-4 py-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <h4 className='text-lg font-bold'>{symbol}</h4>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        position.profit_pct >= 0
                          ? 'bg-emerald-900 text-emerald-200'
                          : 'bg-rose-900 text-rose-200'
                      }`}>
                      {position.profit_pct?.toFixed(2) || '0.00'}%
                    </span>
                  </div>
                  <div className='grid grid-cols-3 gap-4 text-blue-200'>
                    <div>
                      <p className='text-sm opacity-75'>Quantity</p>
                      <p className='text-lg font-semibold'>
                        {position.quantity}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm opacity-75'>Entry</p>
                      <p className='text-lg font-semibold'>
                        ${position.entry_price?.toFixed(4) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm opacity-75'>Current</p>
                      <p className='text-lg font-semibold'>
                        ${position.current_price?.toFixed(4) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Stats and Market Status */}
        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div className='bg-[#232a4d]'>
            <h3 className='text-xl font-bold mb-6 text-blue-100'>Statistics</h3>
            <div className='grid grid-cols-3 gap-6'>
              <div className='text-center'>
                <p className='text-blue-300 text-sm'>Win Rate</p>
                <p className='text-2xl font-bold'>
                  {tradingStatus.trading_stats?.win_rate || 0}%
                </p>
              </div>
              <div className='text-center'>
                <p className='text-blue-300 text-sm'>Wins</p>
                <p className='text-2xl font-bold text-emerald-400'>
                  {tradingStatus.trading_stats?.winning_trades || 0}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-blue-300 text-sm'>Losses</p>
                <p className='text-2xl font-bold text-rose-400'>
                  {tradingStatus.trading_stats?.losing_trades || 0}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-[#232a4d]'>
            <h3 className='text-xl font-bold mb-6 text-blue-100'>Market</h3>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <p className='text-blue-300 text-sm'>Status</p>
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
              <div>
                <p className='text-blue-300 text-sm'>Active Pairs</p>
                <div className='flex gap-2 flex-wrap'>
                  {tradingStatus.market_status.active_symbols.map((symbol) => (
                    <span
                      key={symbol}
                      className='px-2 py-1 bg-blue-800 text-blue-200 text-xs rounded'>
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingStatus;
