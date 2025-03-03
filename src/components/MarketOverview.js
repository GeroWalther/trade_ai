import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TradingService from '../services/trading_service';
import { config } from '../config';
import { toast } from 'sonner';

const MarketOverview = () => {
  const availableInstruments = [
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
  ];

  const [activeInstruments, setActiveInstruments] = useState([
    'EUR_USD',
    'BTC_USD',
  ]);
  const [showPositionsModal, setShowPositionsModal] = useState(false);
  const [tradingStatus, setTradingStatus] = useState(null);
  const [error, setError] = useState(null);

  // New state for advanced trading modal
  const [showAdvancedTradingModal, setShowAdvancedTradingModal] =
    useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [tradeSide, setTradeSide] = useState('buy');
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [orderType, setOrderType] = useState('market'); // 'market' or 'pending'
  const [entryPrice, setEntryPrice] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');

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

  const addInstrument = (instrument) => {
    setActiveInstruments([...activeInstruments, instrument]);
  };

  const removeInstrument = (instrument) => {
    setActiveInstruments(activeInstruments.filter((i) => i !== instrument));
  };

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

  // Open the advanced trading modal
  const openAdvancedTradingModal = (symbol, side) => {
    setSelectedSymbol(symbol);
    setTradeSide(side);
    setTradeQuantity(getDefaultQuantity(symbol).toString());
    setOrderType('market');
    setEntryPrice('');
    setTakeProfitPrice('');
    setStopLossPrice('');

    // Pre-fill entry price with current market price
    const currentPrice = tradingStatus.market_prices?.[symbol]?.price;
    if (currentPrice) {
      setEntryPrice(currentPrice.toString());
    }

    setShowAdvancedTradingModal(true);
  };

  // Handle simple trade (quick buy/sell without advanced options)
  const handleSimpleTrade = async (symbol, side) => {
    try {
      console.log(`Sending simple trade request: ${symbol} ${side}`);

      // Clear any previous errors
      setError(null);
      const updatedInstruments = [...activeInstruments];
      const symbolIndex = updatedInstruments.indexOf(symbol);
      if (symbolIndex !== -1) {
        // Set loading state for this instrument
        setActiveInstruments(updatedInstruments);
      }

      const response = await TradingService.executeTrade(
        symbol,
        side,
        getDefaultQuantity(symbol)
      );

      console.log('Trade response:', response);

      if (response.status === 'success') {
        console.log(`Trade executed successfully: ${response.order_id}`);
        // Show success toast
        toast.success(
          `Trade executed successfully: ${symbol} ${side.toUpperCase()}`,
          {
            duration: 5000,
          }
        );
        // Refresh data
        fetchData();
      } else if (response.status === 'warning') {
        // Handle warning (order processed but no position created)
        console.warn(`Trade warning: ${response.message}`);
        toast.warning(`Warning: ${response.message}`, {
          duration: 5000,
        });
        fetchData();
      } else {
        // This shouldn't happen as errors should throw exceptions
        console.error('Trade failed:', response.message);
        toast.error(`Error: ${response.message}`, {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Trade error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // If the error is related to market being halted, show a more specific message
      if (error.response?.data?.error_code === 'MARKET_HALTED') {
        toast.error(
          `Market Closed: Trading for ${symbol} is currently unavailable. Please try again later or choose a different instrument.`,
          {
            duration: 5000,
          }
        );
      }
    }
  };

  // Handle advanced trade (with position size, pending orders, TP/SL)
  const handleAdvancedTrade = async () => {
    try {
      // Validate inputs
      if (!selectedSymbol || !tradeQuantity) {
        toast.error('Symbol and quantity are required');
        return;
      }

      // For pending orders, entry price is required
      if (orderType === 'pending' && !entryPrice) {
        toast.error('Entry price is required for pending orders');
        return;
      }

      // Parse numeric values
      const quantity = parseFloat(tradeQuantity);
      const entry = orderType === 'pending' ? parseFloat(entryPrice) : null;
      const takeProfit = takeProfitPrice ? parseFloat(takeProfitPrice) : null;
      const stopLoss = stopLossPrice ? parseFloat(stopLossPrice) : null;

      // Validate TP/SL based on trade direction
      if (takeProfit && stopLoss) {
        if (tradeSide === 'buy' && takeProfit <= stopLoss) {
          toast.error(
            'For buy orders, take profit must be higher than stop loss'
          );
          return;
        }
        if (tradeSide === 'sell' && takeProfit >= stopLoss) {
          toast.error(
            'For sell orders, take profit must be lower than stop loss'
          );
          return;
        }
      }

      const options = {
        orderType: orderType,
        price: entry,
        takeProfit: takeProfit,
        stopLoss: stopLoss,
      };

      console.log(
        `Sending advanced trade request: ${selectedSymbol} ${tradeSide} ${quantity}`,
        options
      );

      // Clear any previous errors
      setError(null);

      const response = await TradingService.executeTrade(
        selectedSymbol,
        tradeSide,
        quantity,
        options
      );

      console.log('Trade response:', response);

      if (response.status === 'success') {
        console.log(`Trade executed successfully: ${response.order_id}`);
        // Show success toast
        toast.success(
          `${
            orderType === 'market' ? 'Trade' : 'Order'
          } placed successfully: ${selectedSymbol} ${tradeSide.toUpperCase()}`,
          {
            duration: 5000,
          }
        );
        // Close the modal
        setShowAdvancedTradingModal(false);
        // Refresh data
        fetchData();
      } else if (response.status === 'warning') {
        // Handle warning (order processed but no position created)
        console.warn(`Trade warning: ${response.message}`);
        toast.warning(`Warning: ${response.message}`, {
          duration: 5000,
        });
        setShowAdvancedTradingModal(false);
        fetchData();
      } else {
        // This shouldn't happen as errors should throw exceptions
        console.error('Trade failed:', response.message);
        toast.error(`Error: ${response.message}`, {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Trade error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // If the error is related to market being halted, show a more specific message
      if (error.response?.data?.error_code === 'MARKET_HALTED') {
        toast.error(
          `Market Closed: Trading for ${selectedSymbol} is currently unavailable. Please try again later or choose a different instrument.`,
          {
            duration: 5000,
          }
        );
      } else {
        toast.error(`Error: ${error.message || 'Unknown error occurred'}`, {
          duration: 5000,
        });
      }
    }
  };

  const handleClosePosition = async (symbol) => {
    try {
      console.log(`Closing position for ${symbol}`);
      const response = await TradingService.closePosition(symbol);
      console.log('Close position response:', response);

      if (response.status === 'success') {
        console.log(`Position closed successfully: ${response.order_id}`);
        toast.success(`Position closed successfully: ${symbol}`, {
          duration: 5000,
        });
        fetchData();
      } else {
        console.error('Failed to close position:', response.message);
        toast.error(`Failed to close position: ${response.message}`, {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error closing position:', error);
      toast.error(`Error closing position: ${error.message}`, {
        duration: 5000,
      });
    }
  };

  const getInstrumentType = (symbol) => {
    if (symbol.includes('BTC')) return 'CRYPTO';
    if (symbol.includes('SPX') || symbol.includes('NAS')) return 'INDEX';
    if (symbol.includes('XAU')) return 'COMMODITY';
    if (symbol.includes('BCO')) return 'COMMODITY';
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

  const handleCancelOrder = async (orderId) => {
    try {
      console.log(`Canceling order: ${orderId}`);
      const response = await TradingService.cancelOrder(orderId);
      console.log('Cancel order response:', response);

      if (response.status === 'success') {
        console.log(`Order canceled successfully`);
        toast.success(`Order canceled successfully`, {
          duration: 5000,
        });
        fetchData();
      } else {
        console.error('Failed to cancel order:', response.message);
        toast.error(`Failed to cancel order: ${response.message}`, {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      toast.error(`Error canceling order: ${error.message}`, {
        duration: 5000,
      });
    }
  };

  if (!tradingStatus) {
    return (
      <div className='flex items-center justify-center h-screen bg-blue-950 text-blue-200'>
        <div className='animate-pulse'>Loading trading data...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Account Overview */}
      <div className='grid grid-cols-3 gap-6 bg-[#232a4d] p-6 rounded-lg'>
        <div>
          <h3 className='text-blue-300 mb-2'>Initial Balance</h3>
          <p className='text-2xl font-bold'>
            {formatCurrency(tradingStatus.account?.balance)}
          </p>
        </div>
        <div>
          <h3 className='text-blue-300 mb-2'>Unrealized P/L</h3>
          <p
            className={`text-2xl font-bold ${
              tradingStatus.account?.unrealized_pl >= 0
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}>
            {formatCurrency(tradingStatus.account?.unrealized_pl)}
          </p>
        </div>
        <div>
          <h3 className='text-blue-300 mb-2'>Current Value</h3>
          <p className='text-2xl font-bold'>
            {formatCurrency(tradingStatus.account?.total_value)}
          </p>
        </div>
      </div>

      {/* Instrument Management */}
      <div className='bg-[#232a4d] p-6 rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-bold'>Trading Pairs</h3>
          <button
            onClick={() => setShowPositionsModal(true)}
            className='text-blue-300 hover:text-blue-200 text-sm'>
            Manage Pairs
          </button>
        </div>

        {/* Trading Pairs Grid */}
        <div className='grid grid-cols-2 gap-6'>
          {activeInstruments.map((symbol) => (
            <div key={symbol} className='bg-[#1a1f3c] p-6 rounded-lg relative'>
              {/* Add remove button */}
              <button
                onClick={() => removeInstrument(symbol)}
                className='absolute top-2 right-2 text-rose-400 hover:text-rose-300'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>

              {/* Existing trading pair content */}
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-bold'>
                  {symbol.replace('_', '/')}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-sm ${(() => {
                    switch (getInstrumentType(symbol)) {
                      case 'CRYPTO':
                        return 'bg-blue-900 text-blue-200';
                      case 'INDEX':
                        return 'bg-purple-900 text-purple-200';
                      case 'COMMODITY':
                        return 'bg-amber-900 text-amber-200';
                      default:
                        return 'bg-indigo-900 text-indigo-200';
                    }
                  })()}`}>
                  {getInstrumentType(symbol)}
                </span>
              </div>
              <p className='text-2xl font-bold mb-4'>
                {formatPrice(tradingStatus.market_prices?.[symbol]?.price)}
              </p>

              {/* Updated trading buttons with advanced options */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <button
                    onClick={() => openAdvancedTradingModal(symbol, 'buy')}
                    className='bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded transition-colors w-full'>
                    Buy
                  </button>
                </div>
                <div className='space-y-2'>
                  <button
                    onClick={() => openAdvancedTradingModal(symbol, 'sell')}
                    className='bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded transition-colors w-full'>
                    Sell
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Pairs Modal */}
      {showPositionsModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-[#232a4d] p-6 rounded-lg w-96'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-bold'>Manage Trading Pairs</h3>
              <button
                onClick={() => setShowPositionsModal(false)}
                className='text-blue-300 hover:text-blue-200'>
                ✕
              </button>
            </div>
            <div className='space-y-2 max-h-96 overflow-y-auto'>
              {availableInstruments.map((instrument) => (
                <div
                  key={instrument}
                  className='flex justify-between items-center p-2 hover:bg-[#1a1f3c] rounded'>
                  <span>{instrument.replace('_', '/')}</span>
                  {activeInstruments.includes(instrument) ? (
                    <button
                      onClick={() => removeInstrument(instrument)}
                      className='text-rose-400 hover:text-rose-300 px-2 py-1 rounded'>
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => addInstrument(instrument)}
                      className='text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded'>
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Trading Modal */}
      {showAdvancedTradingModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-[#232a4d] p-6 rounded-lg w-[500px] max-w-full'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-bold'>
                Advanced {tradeSide === 'buy' ? 'Buy' : 'Sell'} -{' '}
                {selectedSymbol?.replace('_', '/')}
              </h3>
              <button
                onClick={() => setShowAdvancedTradingModal(false)}
                className='text-blue-300 hover:text-blue-200'>
                ✕
              </button>
            </div>

            <div className='space-y-4'>
              {/* Position Size */}
              <div>
                <label className='block text-blue-300 mb-1'>
                  Position Size
                </label>
                <input
                  type='number'
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  className='w-full bg-[#1a1f3c] text-white p-2 rounded'
                  placeholder='Enter quantity'
                  step={
                    selectedSymbol?.includes('BTC')
                      ? '0.01'
                      : selectedSymbol?.includes('XAU')
                      ? '0.1'
                      : '1'
                  }
                />
              </div>

              {/* Order Type */}
              <div>
                <label className='block text-blue-300 mb-1'>Order Type</label>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => setOrderType('market')}
                    className={`py-2 px-4 rounded ${
                      orderType === 'market'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#1a1f3c] text-blue-300'
                    }`}>
                    Market Order
                  </button>
                  <button
                    onClick={() => setOrderType('pending')}
                    className={`py-2 px-4 rounded ${
                      orderType === 'pending'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#1a1f3c] text-blue-300'
                    }`}>
                    Pending Order
                  </button>
                </div>
              </div>

              {/* Entry Price (for pending orders) */}
              {orderType === 'pending' && (
                <div>
                  <label className='block text-blue-300 mb-1'>
                    Entry Price
                  </label>
                  <input
                    type='number'
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className='w-full bg-[#1a1f3c] text-white p-2 rounded'
                    placeholder='Enter entry price'
                    step='0.00001'
                  />
                  <div className='flex justify-between text-xs text-blue-400 mt-1'>
                    <span>
                      Current:{' '}
                      {formatPrice(
                        tradingStatus.market_prices?.[selectedSymbol]?.price
                      )}
                    </span>
                    <button
                      onClick={() =>
                        setEntryPrice(
                          tradingStatus.market_prices?.[
                            selectedSymbol
                          ]?.price?.toString() || ''
                        )
                      }
                      className='text-blue-300 hover:text-blue-200'>
                      Use Current
                    </button>
                  </div>
                </div>
              )}

              {/* Take Profit */}
              <div>
                <label className='block text-blue-300 mb-1'>
                  Take Profit Price (Optional)
                </label>
                <input
                  type='number'
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  className='w-full bg-[#1a1f3c] text-white p-2 rounded'
                  placeholder='Enter take profit price'
                  step='0.00001'
                />
                {tradeSide === 'buy' && (
                  <div className='text-xs text-blue-400 mt-1'>
                    Recommended: Above entry price
                  </div>
                )}
                {tradeSide === 'sell' && (
                  <div className='text-xs text-blue-400 mt-1'>
                    Recommended: Below entry price
                  </div>
                )}
              </div>

              {/* Stop Loss */}
              <div>
                <label className='block text-blue-300 mb-1'>
                  Stop Loss Price (Optional)
                </label>
                <input
                  type='number'
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  className='w-full bg-[#1a1f3c] text-white p-2 rounded'
                  placeholder='Enter stop loss price'
                  step='0.00001'
                />
                {tradeSide === 'buy' && (
                  <div className='text-xs text-blue-400 mt-1'>
                    Recommended: Below entry price
                  </div>
                )}
                {tradeSide === 'sell' && (
                  <div className='text-xs text-blue-400 mt-1'>
                    Recommended: Above entry price
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className='pt-2'>
                <button
                  onClick={handleAdvancedTrade}
                  className={`w-full py-3 px-4 rounded text-white ${
                    tradeSide === 'buy'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  }`}>
                  {orderType === 'market' ? 'Execute Trade' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Positions */}
      {Object.keys(tradingStatus.positions).length > 0 && (
        <div className='bg-[#232a4d] p-6 rounded-lg'>
          <h3 className='text-xl font-bold mb-6'>Open Positions</h3>
          {Object.entries(tradingStatus.positions).map(([symbol, position]) => (
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
                  {/* Display TP/SL if available */}
                  {(position.take_profit || position.stop_loss) && (
                    <p className='text-sm text-blue-300'>
                      {position.take_profit &&
                        `TP: ${formatPrice(position.take_profit)}`}
                      {position.take_profit && position.stop_loss && ' | '}
                      {position.stop_loss &&
                        `SL: ${formatPrice(position.stop_loss)}`}
                    </p>
                  )}
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

      {/* Pending Orders */}
      {tradingStatus.pending_orders?.length > 0 && (
        <div className='bg-[#232a4d] p-6 rounded-lg'>
          <h3 className='text-xl font-bold mb-6'>Pending Orders</h3>
          {tradingStatus.pending_orders.map((order) => (
            <div
              key={order.id}
              className='border-b border-blue-800 last:border-0 py-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <h4 className='text-lg font-medium flex items-center gap-2'>
                    {order.symbol.replace('_', '/')}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.side === 'buy'
                          ? 'bg-emerald-900 text-emerald-200'
                          : 'bg-rose-900 text-rose-200'
                      }`}>
                      {order.side.toUpperCase()}
                    </span>
                  </h4>
                  <p className='text-sm text-blue-300'>
                    Quantity: {order.quantity} | Entry:{' '}
                    {formatPrice(order.price)}
                  </p>
                  {/* Display TP/SL if available */}
                  {(order.take_profit || order.stop_loss) && (
                    <p className='text-sm text-blue-300'>
                      {order.take_profit &&
                        `TP: ${formatPrice(order.take_profit)}`}
                      {order.take_profit && order.stop_loss && ' | '}
                      {order.stop_loss && `SL: ${formatPrice(order.stop_loss)}`}
                    </p>
                  )}
                  <p className='text-xs text-gray-400 mt-1'>
                    Created: {new Date(order.created_time).toLocaleString()}
                  </p>
                </div>
                <div className='text-right'>
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className='text-rose-400 hover:text-rose-300 text-sm'>
                    Cancel Order
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
