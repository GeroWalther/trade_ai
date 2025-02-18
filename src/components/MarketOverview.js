import React, { useState } from 'react';
import axios from 'axios';
import { config } from '../config';

const MarketOverview = ({ marketPrices, account, positions }) => {
  const [availableInstruments, setAvailableInstruments] = useState([
    'EUR_USD',
    'GBP_USD',
    'USD_JPY',
    'AUD_USD',
    'USD_CAD',
    'BTC_USD',
  ]);
  const [activeInstruments, setActiveInstruments] = useState([
    'EUR_USD',
    'BTC_USD',
  ]);

  const addInstrument = (instrument) => {
    setActiveInstruments([...activeInstruments, instrument]);
  };

  const removeInstrument = (instrument) => {
    setActiveInstruments(activeInstruments.filter((i) => i !== instrument));
  };

  if (!marketPrices || !account) return <div>Loading market data...</div>;

  const formatPrice = (price) => {
    if (!price || typeof price !== 'number') return 'N/A';
    return price.toFixed(5);
  };

  const formatCurrency = (amount) => {
    if (!amount || typeof amount !== 'number') return 'N/A';
    return `$${amount.toFixed(2)}`;
  };

  const handleTrade = async (symbol, side) => {
    try {
      const requestData = {
        symbol: symbol,
        side: side,
        quantity: 1000,
      };
      console.log('Sending trade request:', requestData);

      const response = await axios.post(
        `${config.api.tradingUrl}/execute-trade`,
        requestData
      );
      console.log('Trade response:', response.data);

      if (response.data.status === 'success') {
        console.log(`Trade executed successfully: ${response.data.order_id}`);
        // You could add a success notification here
      } else {
        console.error('Trade failed:', response.data.message);
        // You could add an error notification here
      }
    } catch (error) {
      console.error('Trade error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // You could add an error notification here
    }
  };

  const handleClosePosition = async (symbol) => {
    try {
      console.log(`Closing position for ${symbol}`);
      const response = await axios.post(
        `${config.api.tradingUrl}/close-position/${symbol}`
      );
      console.log('Close position response:', response.data);

      if (response.data.status === 'success') {
        console.log(`Position closed successfully: ${response.data.order_id}`);
      } else {
        console.error('Failed to close position:', response.data.message);
      }
    } catch (error) {
      console.error('Error closing position:', error);
    }
  };

  const PriceDisplay = ({ symbol, price, action }) => {
    if (!price) return <div>N/A</div>;

    const direction = action?.direction || 'neutral';
    const change = action?.change_percent || 0;

    return (
      <div>
        <p className='text-3xl font-bold mb-2'>{formatPrice(price)}</p>
        <div
          className={`text-sm ${
            direction === 'up'
              ? 'text-emerald-400'
              : direction === 'down'
              ? 'text-rose-400'
              : 'text-blue-300'
          }`}>
          <span className='mr-2'>
            {direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→'}
          </span>
          {change > 0 ? '+' : ''}
          {change}%
        </div>
      </div>
    );
  };

  return (
    <div className='bg-[#232a4d] text-white w-full p-6'>
      {/* Account Info */}
      <div className='grid grid-cols-3 gap-8 mb-8'>
        <div>
          <p className='text-blue-300 text-sm mb-1'>Initial Balance</p>
          <p className='text-3xl font-bold'>
            {formatCurrency(account.balance)}
          </p>
        </div>
        <div>
          <p className='text-blue-300 text-sm mb-1'>Unrealized P/L</p>
          <p
            className={`text-3xl font-bold ${
              account.unrealized_pl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
            {formatCurrency(account.unrealized_pl)}
          </p>
        </div>
        <div>
          <p className='text-blue-300 text-sm mb-1'>Current Value</p>
          <p className='text-3xl font-bold'>
            {formatCurrency(account.total_value)}
          </p>
        </div>
      </div>

      {/* Instrument Management */}
      <div className='mb-6'>
        <select
          className='bg-blue-900 text-blue-200 px-3 py-2 rounded'
          onChange={(e) => addInstrument(e.target.value)}
          value=''>
          <option value='' disabled>
            Add Instrument
          </option>
          {availableInstruments
            .filter((i) => !activeInstruments.includes(i))
            .map((instrument) => (
              <option key={instrument} value={instrument}>
                {instrument.replace('_', '/')}
              </option>
            ))}
        </select>
      </div>

      {/* Trading Instruments */}
      <div className='grid grid-cols-2 gap-8 mb-8'>
        {activeInstruments.map((symbol) => (
          <div key={symbol} className='bg-[#1a1f3c] p-4 rounded relative'>
            <button
              onClick={() => removeInstrument(symbol)}
              className='absolute top-2 right-2 text-rose-400 hover:text-rose-300 p-1'>
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-blue-300 text-sm'>
                {symbol.replace('_', '/')}
              </span>
              <span className='px-2 py-1 bg-blue-800 text-blue-200 text-xs rounded'>
                {symbol.includes('BTC') ? 'CRYPTO' : 'FOREX'}
              </span>
            </div>
            <PriceDisplay
              symbol={symbol}
              price={marketPrices[symbol]?.price}
              action={marketPrices[symbol]?.action}
            />
            <div className='flex gap-2 mt-4'>
              <button
                onClick={() => handleTrade(symbol, 'buy')}
                className='flex-1 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors text-sm font-medium'>
                Buy
              </button>
              <button
                onClick={() => handleTrade(symbol, 'sell')}
                className='flex-1 px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors text-sm font-medium'>
                Sell
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Positions */}
      {positions && Object.keys(positions).length > 0 && (
        <div className='mt-8'>
          <h3 className='text-xl font-bold mb-4'>Positions</h3>
          <div className='space-y-4'>
            {Object.entries(positions).map(([symbol, position]) => (
              <div key={symbol} className='bg-[#1a1f3c] p-4 rounded'>
                {/* Position Header */}
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-blue-300 text-sm'>{symbol}</span>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        position.profit_pct >= 0
                          ? 'bg-emerald-900 text-emerald-200'
                          : 'bg-rose-900 text-rose-200'
                      }`}>
                      {position.profit_pct?.toFixed(2)}%
                    </span>
                    <span
                      className={`text-xs ${
                        position.pl_euro >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}>
                      €{position.pl_euro?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Position Details */}
                <div className='grid grid-cols-3 gap-4 mb-4'>
                  <div>
                    <p className='text-xs text-blue-300 mb-1'>Quantity</p>
                    <p className='text-lg font-bold'>{position.quantity}</p>
                  </div>
                  <div>
                    <p className='text-xs text-blue-300 mb-1'>Entry</p>
                    <p className='text-lg font-bold'>
                      ${position.entry_price?.toFixed(5)}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-blue-300 mb-1'>Current</p>
                    <p className='text-lg font-bold'>
                      ${position.current_price?.toFixed(5)}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <div className='flex justify-end'>
                  <button
                    onClick={() => handleClosePosition(symbol)}
                    className='px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 rounded border border-rose-400 hover:border-rose-300 text-sm transition-colors'>
                    Close Position
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Update Time */}
      <div className='mt-6 text-blue-400 text-sm flex items-center'>
        <svg
          className='w-4 h-4 mr-2'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        {marketPrices.last_update
          ? new Date(marketPrices.last_update).toLocaleString()
          : 'N/A'}
      </div>
    </div>
  );
};

export default MarketOverview;
