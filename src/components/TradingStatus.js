import React, { useState, useEffect } from 'react';
import TradingService from '../services/trading_service';

const TradingStatus = () => {
  const [tradingStatus, setTradingStatus] = useState(null);

  useEffect(() => {
    // Initial fetch
    TradingService.getTradingStatus();

    // Set up polling every 5 seconds
    const interval = setInterval(() => {
      TradingService.getTradingStatus();
    }, 5000);

    // Listen for updates
    const handleTradingUpdate = (event) => {
      setTradingStatus(event.detail);
    };

    document.addEventListener('tradingUpdate', handleTradingUpdate);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('tradingUpdate', handleTradingUpdate);
    };
  }, []);

  if (!tradingStatus) {
    return <div>Waiting for trading data...</div>;
  }

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-6'>Trading Status</h2>

      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <h3 className='text-xl font-semibold mb-4'>Portfolio Overview</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-gray-600'>Cash Available</p>
            <p className='text-2xl font-bold'>
              ${tradingStatus.cash_available.toFixed(2)}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>Total Portfolio Value</p>
            <p className='text-2xl font-bold'>
              ${tradingStatus.total_portfolio_value.toFixed(2)}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>Daily Return</p>
            <p
              className={`text-2xl font-bold ${
                tradingStatus.daily_return_pct >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
              {tradingStatus.daily_return_pct}%
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <h3 className='text-xl font-semibold mb-4'>Active Positions</h3>
        <div className='grid gap-4'>
          {Object.entries(tradingStatus.positions).map(([symbol, position]) => (
            <div key={symbol} className='border rounded p-4'>
              <h4 className='text-lg font-semibold mb-2'>{symbol}</h4>
              <div className='grid grid-cols-2 gap-2'>
                <p>Quantity: {position.quantity}</p>
                <p>Entry Price: ${position.entry_price.toFixed(4)}</p>
                <p>Current Price: ${position.current_price.toFixed(4)}</p>
                <p
                  className={
                    position.profit_pct >= 0 ? 'text-green-600' : 'text-red-600'
                  }>
                  Profit/Loss: {position.profit_pct.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <h3 className='text-xl font-semibold mb-4'>Trading Statistics</h3>
        <div className='grid grid-cols-3 gap-4'>
          <div>
            <p className='text-gray-600'>Win Rate</p>
            <p className='text-2xl font-bold'>
              {tradingStatus.trading_stats.win_rate}%
            </p>
          </div>
          <div>
            <p className='text-gray-600'>Winning Trades</p>
            <p className='text-2xl font-bold text-green-600'>
              {tradingStatus.trading_stats.winning_trades}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>Losing Trades</p>
            <p className='text-2xl font-bold text-red-600'>
              {tradingStatus.trading_stats.losing_trades}
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-6'>
        <h3 className='text-xl font-semibold mb-4'>Market Status</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-gray-600'>Market Open</p>
            <p
              className={`text-lg font-bold ${
                tradingStatus.market_status.is_market_open
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
              {tradingStatus.market_status.is_market_open ? 'Open' : 'Closed'}
            </p>
          </div>
          <div>
            <p className='text-gray-600'>Active Symbols</p>
            <p className='text-lg font-bold'>
              {tradingStatus.market_status.active_symbols.join(', ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingStatus;
