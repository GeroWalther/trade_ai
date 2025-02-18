import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';

const BotMonitor = () => {
  const [botsStatus, setBotsStatus] = useState(null);
  const [selectedBot, setSelectedBot] = useState('ema_strategy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBotsStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.api.tradingUrl}/api/bots`);
      setBotsStatus(response.data.bots);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bots status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotsStatus();
    const interval = setInterval(fetchBotsStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleBot = async (botId) => {
    try {
      setLoading(true);
      const currentStatus = botsStatus[botId].running;
      await axios.post(`${config.api.tradingUrl}/api/bots/${botId}/toggle`, {
        action: currentStatus ? 'stop' : 'start',
      });
      fetchBotsStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSymbol = async (botId, symbol) => {
    try {
      setLoading(true);
      await axios.put(`${config.api.tradingUrl}/api/bots/${botId}/parameters`, {
        symbol: symbol,
      });
      fetchBotsStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateParameters = async (botId, parameters) => {
    try {
      setLoading(true);
      await axios.put(
        `${config.api.tradingUrl}/api/bots/${botId}/parameters`,
        parameters
      );
      fetchBotsStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !botsStatus) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-rose-900 text-rose-200 p-4 rounded'>
        Error: {error}
      </div>
    );
  }

  if (!botsStatus) return null;

  const selectedBotStatus = botsStatus[selectedBot];

  return (
    <div className='bg-[#232a4d] rounded-lg p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-blue-100'>Trading Bots</h2>
        <select
          className='bg-blue-900 text-blue-200 px-3 py-2 rounded'
          value={selectedBot}
          onChange={(e) => setSelectedBot(e.target.value)}>
          {Object.entries(botsStatus).map(([botId, bot]) => (
            <option key={botId} value={botId}>
              {bot.name}
            </option>
          ))}
        </select>
      </div>

      {selectedBotStatus && (
        <div className='space-y-6'>
          {/* Bot Status and Controls */}
          <div className='flex items-center justify-between bg-[#1a1f3c] p-4 rounded'>
            <div>
              <h3 className='text-lg font-semibold text-blue-100'>
                {selectedBotStatus.name}
              </h3>
              <p className='text-sm text-blue-300'>
                Status: {selectedBotStatus.running ? 'Running' : 'Stopped'}
              </p>
            </div>
            <button
              onClick={() => handleToggleBot(selectedBot)}
              className={`px-4 py-2 rounded font-medium ${
                selectedBotStatus.running
                  ? 'bg-rose-500 hover:bg-rose-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              } text-white transition-colors`}>
              {selectedBotStatus.running ? 'Stop Bot' : 'Start Bot'}
            </button>
          </div>

          {/* Symbol Selection */}
          {selectedBot === 'ema_strategy' && (
            <div className='bg-[#1a1f3c] p-4 rounded'>
              <h4 className='text-sm font-medium text-blue-300 mb-2'>
                Trading Symbol
              </h4>
              <select
                className='w-full bg-blue-900 text-blue-200 px-3 py-2 rounded'
                value={selectedBotStatus.parameters?.symbol}
                onChange={(e) =>
                  handleUpdateSymbol(selectedBot, e.target.value)
                }>
                {selectedBotStatus.status?.available_instruments.map(
                  (symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol.replace('_', '/')}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* Parameters */}
          <div className='bg-[#1a1f3c] p-4 rounded'>
            <h4 className='text-sm font-medium text-blue-300 mb-4'>
              Parameters
            </h4>
            <div className='grid grid-cols-2 gap-4'>
              {Object.entries(selectedBotStatus.parameters || {}).map(
                ([key, value]) =>
                  key !== 'symbol' && (
                    <div key={key} className='space-y-1'>
                      <label className='text-sm text-blue-300 block'>
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </label>
                      <input
                        type='number'
                        value={value}
                        onChange={(e) =>
                          handleUpdateParameters(selectedBot, {
                            [key]: parseFloat(e.target.value),
                          })
                        }
                        className='w-full bg-blue-900 text-blue-200 px-3 py-2 rounded'
                      />
                    </div>
                  )
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          {selectedBotStatus.status?.performance && (
            <div className='bg-[#1a1f3c] p-4 rounded'>
              <h4 className='text-sm font-medium text-blue-300 mb-4'>
                Performance
              </h4>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <p className='text-sm text-blue-300'>Win Rate</p>
                  <p className='text-xl font-bold'>
                    {(
                      (selectedBotStatus.status.performance.winning_trades /
                        selectedBotStatus.status.performance.total_trades) *
                        100 || 0
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div>
                  <p className='text-sm text-blue-300'>Total Trades</p>
                  <p className='text-xl font-bold'>
                    {selectedBotStatus.status.performance.total_trades}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-blue-300'>Daily P/L</p>
                  <p className='text-xl font-bold'>
                    €
                    {selectedBotStatus.status.daily_profit_loss?.toFixed(2) ||
                      '0.00'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Updates */}
          <div className='bg-[#1a1f3c] p-4 rounded'>
            <h4 className='text-sm font-medium text-blue-300 mb-4'>
              Recent Updates
            </h4>
            <div className='space-y-2 max-h-40 overflow-y-auto'>
              {selectedBotStatus.status?.recent_updates?.map(
                (update, index) => (
                  <p key={index} className='text-sm text-blue-200'>
                    {update}
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotMonitor;
