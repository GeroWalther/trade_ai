import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import TradingService from '../services/trading_service';
import { config } from '../config';
import { toast } from 'sonner';
import TradingViewChart from './MarketIntelligence/TradingViewChart';

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

  // Add new state variables for editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [editTakeProfit, setEditTakeProfit] = useState('');
  const [editStopLoss, setEditStopLoss] = useState('');

  // New state for chart functionality
  const [showChart, setShowChart] = useState(true);

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
    if (price === undefined || price === null) return 'Not Set';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return 'Not Set';
    return numericPrice.toFixed(5);
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || typeof amount !== 'number')
      return 'N/A';
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

  const handleClosePosition = async (position) => {
    try {
      console.log(
        `Closing position for ${position.symbol} (ID: ${position.trade_id})`
      );
      const response = await TradingService.closePosition(position.trade_id);
      console.log('Close position response:', response);

      if (response.status === 'success') {
        console.log(`Position closed successfully: ${response.order_id}`);
        toast.success(`Position closed successfully: ${position.symbol}`, {
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

  // Convert OANDA symbol to TradingView symbol
  const getTradingViewSymbol = (oandaSymbol) => {
    const symbolMap = {
      EUR_USD: 'FX:EURUSD',
      GBP_USD: 'FX:GBPUSD',
      USD_JPY: 'FX:USDJPY',
      AUD_USD: 'FX:AUDUSD',
      USD_CAD: 'FX:USDCAD',
      BTC_USD: 'BITSTAMP:BTCUSD',
      SPX500_USD: 'TVC:SPX',
      NAS100_USD: 'NASDAQ:NDX',
      XAU_USD: 'TVC:GOLD',
      BCO_USD: 'TVC:UKOIL',
    };
    return symbolMap[oandaSymbol] || 'FX:EURUSD';
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
      // No need to modify takeProfitOrder and stopLossOrder as they're already in the position object
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

  // Add new function to handle position edits
  const handleEditPosition = async () => {
    try {
      if (!editingPosition) return;

      const response = await TradingService.modifyPosition(
        editingPosition.trade_id,
        editTakeProfit ? parseFloat(editTakeProfit) : null,
        editStopLoss ? parseFloat(editStopLoss) : null
      );

      if (response.status === 'success') {
        toast.success('Position updated successfully');
        setIsEditModalOpen(false);
        setEditingPosition(null);
        setEditTakeProfit('');
        setEditStopLoss('');
        fetchData();
      } else {
        toast.error(`Failed to update position: ${response.message}`);
        console.error('Failed to update position:', response.message);
      }
    } catch (error) {
      toast.error(`Error updating position: ${error.message}`);
      console.error('Error updating position:', error);
    }
  };

  // Add function to open edit modal
  const openEditModal = (position) => {
    // Find the trade with matching ID to get take profit and stop loss
    const trade = tradingStatus.trades?.find((t) => t.id === position.trade_id);

    // Format the position
    const formattedPosition = formatPositionDetails(position);

    // Set the editing position
    setEditingPosition(formattedPosition);

    // Set take profit and stop loss from the trade if available
    setEditTakeProfit(trade?.takeProfitOrder?.price?.toString() || '');
    setEditStopLoss(trade?.stopLossOrder?.price?.toString() || '');

    // Open the modal
    setIsEditModalOpen(true);
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

      {/* Multiple TradingView Charts Section */}
      {showChart && (
        <div className='bg-[#232a4d] p-2 rounded-lg'>
          <div className='flex justify-between items-center mb-2 px-4'>
            <h3 className='text-lg font-bold'>Live Charts</h3>
            <button
              onClick={() => setShowChart(false)}
              className='text-gray-400 hover:text-gray-300'>
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
          </div>
          {/* 2x2 Grid of Charts */}
          <div className='grid grid-cols-2 gap-1'>
            {/* Chart 1: EUR/USD */}
            <div className='bg-[#1a1f3c] p-1 rounded'>
              <div className='h-80 w-full'>
                <TradingViewChart symbol='FX:EURUSD' theme='dark' />
              </div>
            </div>

            {/* Chart 2: BTC/USD */}
            <div className='bg-[#1a1f3c] p-1 rounded'>
              <div className='h-80 w-full'>
                <TradingViewChart symbol='BITSTAMP:BTCUSD' theme='dark' />
              </div>
            </div>

            {/* Chart 3: Gold */}
            <div className='bg-[#1a1f3c] p-1 rounded'>
              <div className='h-80 w-full'>
                <TradingViewChart symbol='TVC:GOLD' theme='dark' />
              </div>
            </div>

            {/* Chart 4: S&P 500 */}
            <div className='bg-[#1a1f3c] p-1 rounded'>
              <div className='h-80 w-full'>
                <TradingViewChart symbol='SP500' theme='dark' />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Charts Button (when charts are hidden) */}
      {!showChart && (
        <div className='bg-[#232a4d] p-4 rounded-lg text-center'>
          <button
            onClick={() => setShowChart(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'>
            📈 Show 4 Live Charts
          </button>
        </div>
      )}

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
      {showPositionsModal &&
        ReactDOM.createPortal(
          <div
            className='fixed inset-0 bg-black/50 flex items-center justify-center'
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
            }}>
            <div
              className='bg-[#232a4d] p-6 rounded-lg w-96 relative'
              style={{ zIndex: 10000 }}>
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
          </div>,
          document.body
        )}

      {/* Advanced Trading Modal */}
      {showAdvancedTradingModal &&
        ReactDOM.createPortal(
          <div
            className='fixed inset-0 bg-black/50 flex items-center justify-center'
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
            }}>
            <div
              className='bg-[#232a4d] p-6 rounded-lg w-[500px] max-w-full relative'
              style={{ zIndex: 10000 }}>
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
          </div>,
          document.body
        )}

      {/* Positions */}
      {tradingStatus.positions &&
        Object.keys(tradingStatus.positions).length > 0 && (
          <div className='bg-[#232a4d] p-6 rounded-lg'>
            <h3 className='text-xl font-bold mb-6'>Open Positions</h3>
            {Object.entries(tradingStatus.positions).map(
              ([positionKey, position]) => (
                <div
                  key={positionKey}
                  className='border-b border-blue-800 last:border-0 py-4'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <h4 className='text-lg font-medium flex items-center gap-2'>
                        {position.symbol.replace('_', '/')}
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            position.side === 'LONG'
                              ? 'bg-emerald-900 text-emerald-200'
                              : 'bg-rose-900 text-rose-200'
                          }`}>
                          {position.side}
                        </span>
                        <span className='text-xs text-blue-400'>
                          ID: {position.trade_id}
                        </span>
                      </h4>
                      <div className='grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-400 mt-2'>
                        <div className='flex justify-between'>
                          <span>Entry:</span>
                          <span className='text-white'>
                            {formatPrice(position.entry_price)}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Current:</span>
                          <span className='text-white'>
                            {formatPrice(position.current_price)}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Quantity:</span>
                          <span className='text-white'>
                            {Math.abs(position.quantity)}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='mr-2'>Take Profit: </span>
                          <span className='text-emerald-400'>
                            {(() => {
                              const trade = tradingStatus.trades?.find(
                                (t) => t.id === position.trade_id
                              );
                              return trade?.takeProfitOrder
                                ? formatPrice(trade.takeProfitOrder.price)
                                : 'Not Set';
                            })()}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Stop Loss:</span>
                          <span className='text-rose-400'>
                            {(() => {
                              const trade = tradingStatus.trades?.find(
                                (t) => t.id === position.trade_id
                              );
                              return trade?.stopLossOrder
                                ? formatPrice(trade.stopLossOrder.price)
                                : 'Not Set';
                            })()}
                          </span>
                        </div>
                      </div>
                      <div className='text-sm mt-2'>
                        <span
                          className={
                            position.pl_euro >= 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }>
                          P/L: {formatCurrency(position.pl_euro)} (
                          {position.profit_pct?.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => openEditModal(position)}
                        className='px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors'>
                        Edit
                      </button>
                      <button
                        onClick={() => handleClosePosition(position)}
                        className='px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-sm transition-colors'>
                        Close Position
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
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

      {/* Edit Position Modal */}
      {isEditModalOpen &&
        editingPosition &&
        ReactDOM.createPortal(
          <div
            className='fixed inset-0 bg-black/50 flex items-center justify-center'
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
            }}>
            <div
              className='bg-[#1a1f3c] p-6 rounded-lg w-96 relative'
              style={{ zIndex: 10000 }}>
              <h3 className='text-xl font-bold mb-4'>
                Edit {editingPosition.symbol.replace('_', '/')} Position
              </h3>
              <div className='space-y-4'>
                {/* Current Price Display */}
                <div className='bg-[#232a4d] p-3 rounded'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-400'>
                      Current Price:
                    </span>
                    <span className='text-lg font-bold'>
                      {formatPrice(
                        tradingStatus.market_prices?.[editingPosition.symbol]
                          ?.price
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between items-center mt-2'>
                    <span className='text-sm text-gray-400'>Entry Price:</span>
                    <span className='text-lg'>
                      {formatPrice(editingPosition.entry_price)}
                    </span>
                  </div>
                </div>

                {/* Take Profit */}
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Take Profit
                    {editTakeProfit && (
                      <span className='ml-2 text-emerald-400'>
                        (Current: {formatPrice(parseFloat(editTakeProfit))})
                      </span>
                    )}
                  </label>
                  <input
                    type='number'
                    value={editTakeProfit}
                    onChange={(e) => setEditTakeProfit(e.target.value)}
                    placeholder='Enter take profit price'
                    className='w-full bg-[#232a4d] px-3 py-2 rounded text-white'
                    step='0.00001'
                  />
                  {editingPosition.side === 'LONG' && (
                    <div className='text-xs text-blue-400 mt-1'>
                      Recommended: Above entry price
                    </div>
                  )}
                  {editingPosition.side === 'SHORT' && (
                    <div className='text-xs text-blue-400 mt-1'>
                      Recommended: Below entry price
                    </div>
                  )}
                </div>

                {/* Stop Loss */}
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Stop Loss
                    {editStopLoss && (
                      <span className='ml-2 text-rose-400'>
                        (Current: {formatPrice(parseFloat(editStopLoss))})
                      </span>
                    )}
                  </label>
                  <input
                    type='number'
                    value={editStopLoss}
                    onChange={(e) => setEditStopLoss(e.target.value)}
                    placeholder='Enter stop loss price'
                    className='w-full bg-[#232a4d] px-3 py-2 rounded text-white'
                    step='0.00001'
                  />
                  {editingPosition.side === 'LONG' && (
                    <div className='text-xs text-blue-400 mt-1'>
                      Recommended: Below entry price
                    </div>
                  )}
                  {editingPosition.side === 'SHORT' && (
                    <div className='text-xs text-blue-400 mt-1'>
                      Recommended: Above entry price
                    </div>
                  )}
                </div>

                <div className='flex justify-end gap-3 mt-6'>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingPosition(null);
                      setEditTakeProfit('');
                      setEditStopLoss('');
                    }}
                    className='px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors'>
                    Cancel
                  </button>
                  <button
                    onClick={handleEditPosition}
                    className='px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors'>
                    Update Position
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MarketOverview;
