import React, { useState } from 'react';
import axios from 'axios';
import { config } from '../config';

const MarketOverview = ({
  marketPrices,
  account,
  positions,
  onTradeComplete,
}) => {
  const [availableInstruments, setAvailableInstruments] = useState([
    'EUR_USD',
    'GBP_USD',
    'USD_JPY',
    'AUD_USD',
    'USD_CAD',
    'BTC_USD',
    'SPX500_USD', // S&P 500
    'NAS100_USD', // Nasdaq
    'XAU_USD', // Gold
    'BCO_USD', // Brent Crude Oil
  ]);
  const [activeInstruments, setActiveInstruments] = useState([
    'EUR_USD',
    'BTC_USD',
  ]);
  const [showPositionsModal, setShowPositionsModal] = useState(false);

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
    return `${amount.toFixed(2)}€`;
  };

  const getDefaultQuantity = (symbol) => {
    if (symbol.includes('XAU')) return 1; // Gold trades in smaller units
    if (symbol.includes('BTC')) return 0.1; // Bitcoin trades in smaller units
    if (symbol.includes('SPX') || symbol.includes('NAS')) return 1; // Index trades
    if (symbol.includes('BCO')) return 10; // Oil trades in barrels
    return 1000; // Default for forex
  };

  const handleTrade = async (symbol, side) => {
    try {
      const requestData = {
        symbol: symbol,
        side: side,
        quantity: getDefaultQuantity(symbol),
      };
      console.log('Sending trade request:', requestData);

      const response = await axios.post(
        `${config.api.tradingUrl}/execute-trade`,
        requestData
      );
      console.log('Trade response:', response.data);

      if (response.data.status === 'success') {
        console.log(`Trade executed successfully: ${response.data.order_id}`);
        if (onTradeComplete) {
          onTradeComplete();
        }
      } else {
        console.error('Trade failed:', response.data.message);
      }
    } catch (error) {
      console.error('Trade error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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

  const fetchAllPositions = async () => {
    try {
      const response = await axios.get(`${config.api.baseUrl}/api/positions`);
      console.log('All open positions:', response.data);
      if (response.data.status === 'success') {
        const positions = response.data.positions;
        console.log('Open positions:');
        Object.entries(positions).forEach(([symbol, position]) => {
          console.log(`
            Symbol: ${symbol}
            Side: ${position.side}
            Quantity: ${position.quantity}
            Entry: ${position.entry_price}
            Current: ${position.current_price}
            P/L: €${position.pl_euro.toFixed(2)} (${position.profit_pct.toFixed(
            2
          )}%)
          `);
        });
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
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

  const getInstrumentType = (symbol) => {
    if (symbol.includes('BTC')) return 'CRYPTO';
    if (symbol.includes('SPX') || symbol.includes('NAS')) return 'INDEX';
    if (symbol.includes('XAU') || symbol.includes('BCO')) return 'COMMODITY';
    return 'FOREX';
  };

  const formatPositionDetails = (position) => {
    const isLong = position.quantity > 0;
    return {
      ...position,
      side: isLong ? 'LONG' : 'SHORT',
      quantity: Math.abs(position.quantity),
      pl_formatted: `€${position.pl_euro?.toFixed(
        2
      )} (${position.profit_pct?.toFixed(2)}%)`,
    };
  };

  return (
    <div className='space-y-6'>
      {/* Account Overview */}
      <div className='grid grid-cols-3 gap-6 bg-[#232a4d] p-6 rounded-lg'>
        <div>
          <h3 className='text-blue-300 mb-2'>Initial Balance</h3>
          <p className='text-2xl font-bold'>
            {formatCurrency(account?.balance)}
          </p>
        </div>
        <div>
          <h3 className='text-blue-300 mb-2'>Unrealized P/L</h3>
          <p
            className={`text-2xl font-bold ${
              account?.unrealized_pl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
            {formatCurrency(account?.unrealized_pl)}
          </p>
        </div>
        <div>
          <h3 className='text-blue-300 mb-2'>Current Value</h3>
          <p className='text-2xl font-bold'>
            {formatCurrency(account?.total_value)}
          </p>
        </div>
      </div>

      {/* Trading Pairs */}
      <div className='grid grid-cols-2 gap-6'>
        {activeInstruments.map((symbol) => (
          <div key={symbol} className='bg-[#232a4d] p-6 rounded-lg'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-bold'>{symbol.replace('_', '/')}</h3>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  symbol.includes('BTC')
                    ? 'bg-blue-900 text-blue-200'
                    : 'bg-indigo-900 text-indigo-200'
                }`}>
                {symbol.includes('BTC') ? 'CRYPTO' : 'FOREX'}
              </span>
            </div>
            <p className='text-2xl font-bold mb-4'>
              {formatPrice(marketPrices?.[symbol]?.price)}
            </p>
            <div className='grid grid-cols-2 gap-4'>
              <button
                onClick={() => handleTrade(symbol, 'buy')}
                className='bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded transition-colors'>
                Buy
              </button>
              <button
                onClick={() => handleTrade(symbol, 'sell')}
                className='bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded transition-colors'>
                Sell
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Positions */}
      {Object.keys(positions).length > 0 && (
        <div className='bg-[#232a4d] p-6 rounded-lg'>
          <h3 className='text-xl font-bold mb-6'>Positions</h3>
          {Object.entries(positions).map(([symbol, position]) => (
            <div
              key={symbol}
              className='border-b border-blue-800 last:border-0 py-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <h4 className='text-lg font-medium flex items-center gap-2'>
                    {symbol.replace('_', '/')}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        position.side === 'LONG'
                          ? 'bg-emerald-900 text-emerald-200'
                          : 'bg-rose-900 text-rose-200'
                      }`}>
                      {position.side}
                    </span>
                  </h4>
                  <p className='text-sm text-blue-300'>
                    Quantity: {position.quantity} | Entry:{' '}
                    {formatPrice(position.entry_price)}
                  </p>
                </div>
                <div className='text-right'>
                  <p
                    className={`text-lg font-bold ${
                      position.pl_euro >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}>
                    {formatCurrency(position.pl_euro)}
                  </p>
                  <button
                    onClick={() => handleClosePosition(symbol)}
                    className='text-rose-400 hover:text-rose-300 text-sm'>
                    Close Position
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketOverview;
