import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { config } from '../config';

const BotParameters = React.memo(
  ({
    selectedBot,
    selectedBotStatus,
    defaultParameters,
    onUpdateParameters,
    onUpdateSymbol,
  }) => {
    const [checkIntervalInput, setCheckIntervalInput] = useState(
      Math.round(defaultParameters.check_interval / 60)
    );

    useEffect(() => {
      if (selectedBotStatus.parameters?.check_interval) {
        setCheckIntervalInput(
          Math.round(selectedBotStatus.parameters.check_interval / 60)
        );
      }
    }, [selectedBotStatus.parameters?.check_interval]);

    return (
      <div className='bg-[#1a1f3c] p-4 rounded'>
        <h4 className='text-lg font-medium mb-4'>Parameters</h4>
        <div className='space-y-4'>
          {/* Trading Symbol */}
          <div className='flex items-center justify-between'>
            <label className='text-sm text-blue-300'>Trading Symbol</label>
            <select
              value={selectedBotStatus.parameters.symbol}
              onChange={(e) => onUpdateSymbol(selectedBot, e.target.value)}
              className='bg-[#232a4d] px-2 py-1 rounded w-40 text-right'>
              {selectedBotStatus.status?.available_instruments?.map(
                (symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol.replace('_', '/')}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Check Interval */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <label className='text-sm text-blue-300'>Check Interval</label>
              <div className='group relative'>
                <span className='cursor-help text-blue-400'>ⓘ</span>
                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-blue-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 pointer-events-none'>
                  How often the bot checks for trading signals. Lower values
                  mean more frequent checks but higher API usage.
                  <br />
                  <br />
                  Recommended ranges:
                  <ul className='list-disc ml-4 mt-1'>
                    <li>Active trading: 1-5 minutes</li>
                    <li>Day trading: 5-60 minutes</li>
                    <li>Swing trading: 60-1440 minutes</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                value={checkIntervalInput}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const clampedValue = Math.min(10080, Math.max(1, value));
                  setCheckIntervalInput(clampedValue);
                }}
                onBlur={() => {
                  onUpdateParameters(selectedBot, {
                    check_interval: checkIntervalInput * 60,
                  });
                }}
                className='bg-[#232a4d] px-2 py-1 rounded w-24 text-right [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100'
                min='1'
                max='10080'
                step='1'
              />
              <span className='text-sm text-blue-300'>minutes</span>
            </div>
          </div>

          {/* Continue After Trade */}
          <div className='flex items-center justify-between'>
            <label className='text-sm text-blue-300'>
              Continue After Trade
            </label>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-blue-300'>
                {selectedBotStatus.parameters?.continue_after_trade ??
                defaultParameters.continue_after_trade
                  ? 'Yes'
                  : 'No'}
              </span>
              <input
                type='checkbox'
                checked={
                  selectedBotStatus.parameters?.continue_after_trade ??
                  defaultParameters.continue_after_trade
                }
                onChange={(e) =>
                  onUpdateParameters(selectedBot, {
                    continue_after_trade: e.target.checked,
                  })
                }
                className='bg-[#232a4d] rounded w-4 h-4 checked:bg-blue-500 hover:cursor-pointer'
              />
            </div>
          </div>

          {/* Max Concurrent Trades */}
          <div className='flex items-center justify-between'>
            <label className='text-sm text-blue-300'>
              Max Concurrent Trades
            </label>
            <input
              type='number'
              value={
                selectedBotStatus.parameters?.max_concurrent_trades ||
                defaultParameters.max_concurrent_trades
              }
              onChange={(e) =>
                onUpdateParameters(selectedBot, {
                  max_concurrent_trades: Math.max(
                    1,
                    Math.min(
                      5,
                      parseInt(e.target.value) ||
                        defaultParameters.max_concurrent_trades
                    )
                  ),
                })
              }
              className='bg-[#232a4d] px-2 py-1 rounded w-24 text-right'
              min='1'
              max='5'
            />
          </div>
        </div>
      </div>
    );
  }
);

const BotPerformance = React.memo(({ performance, dailyPL }) => {
  if (!performance) return null;

  const winRate =
    performance.total_trades > 0
      ? ((performance.winning_trades / performance.total_trades) * 100).toFixed(
          1
        )
      : '0.0';

  return (
    <div className='bg-[#1a1f3c] p-4 rounded'>
      <h4 className='text-sm font-medium text-blue-300 mb-4'>Performance</h4>
      <div className='grid grid-cols-3 gap-4'>
        <div>
          <p className='text-sm text-blue-300'>Win Rate</p>
          <p className='text-xl font-bold'>{winRate}%</p>
        </div>
        <div>
          <p className='text-sm text-blue-300'>Total Trades</p>
          <p className='text-xl font-bold'>{performance.total_trades}</p>
        </div>
        <div>
          <p className='text-sm text-blue-300'>Daily P/L</p>
          <p className='text-xl font-bold'>€{dailyPL.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
});

const RecentUpdates = React.memo(({ updates }) => {
  return (
    <div className='bg-[#1a1f3c] p-4 rounded'>
      <h4 className='text-sm font-medium text-blue-300 mb-4'>Recent Updates</h4>
      <div className='space-y-2 max-h-40 overflow-y-auto'>
        {updates?.map((update, index) => (
          <p key={index} className='text-sm text-blue-200'>
            {update}
          </p>
        ))}
      </div>
    </div>
  );
});

// New component for polled data
const BotStatus = ({ botId }) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(
          `${config.api.tradingUrl}/api/bots/${botId}/status`
        );
        setStatus(response.data.data);
      } catch (error) {
        console.error('Error fetching bot status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [botId]);

  if (!status) return null;

  return (
    <>
      <BotPerformance
        performance={status.performance}
        dailyPL={status.performance?.total_profit_loss || 0}
      />
      <div className='bg-[#1a1f3c] p-4 rounded'>
        <h4 className='text-sm font-medium text-blue-300 mb-4'>
          Recent Updates
        </h4>
        <div className='space-y-2 max-h-[600px] overflow-y-auto'>
          {status.recent_updates
            ?.slice()
            .reverse()
            .map((update, index) => (
              <div
                key={index}
                className='text-sm text-blue-200 whitespace-pre-wrap'>
                {update}
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

// Main BotMonitor without polling
const BotMonitor = () => {
  const defaultParameters = {
    check_interval: 240,
    continue_after_trade: true,
    max_concurrent_trades: 1,
    symbol: 'BTC_USD',
  };

  const [botsStatus, setBotsStatus] = useState({});
  const [selectedBot, setSelectedBot] = useState('ema_strategy');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Move fetchBots outside useEffect and make it reusable
  const fetchBots = useCallback(async () => {
    try {
      const response = await axios.get(`${config.api.tradingUrl}/api/bots`);
      setBotsStatus(response.data.bots);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching bots:', error);
      setError(error.message);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const selectedBotStatus = botsStatus[selectedBot] || {
    name: '',
    running: false,
    parameters: defaultParameters,
    status: {
      strategy_info: {
        name: '',
        period: '',
        description: '',
        rules: [],
      },
      available_instruments: [],
    },
  };

  const handleToggleBot = useCallback(
    async (botId) => {
      try {
        setLoading(true);
        const currentStatus = botsStatus[botId].running;
        await axios.post(`${config.api.tradingUrl}/api/bots/${botId}/toggle`, {
          action: currentStatus ? 'stop' : 'start',
        });
        fetchBots(); // Use fetchBots instead of fetchBotsStatus
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [botsStatus, fetchBots]
  ); // Add fetchBots to dependencies

  const handleUpdateSymbol = useCallback(
    async (botId, symbol) => {
      try {
        await axios.put(
          `${config.api.tradingUrl}/api/bots/${botId}/parameters`,
          {
            symbol: symbol,
          }
        );
        fetchBots(); // Use fetchBots instead of fetchBotsStatus
      } catch (err) {
        setError(err.message);
      }
    },
    [fetchBots]
  ); // Add fetchBots to dependencies

  const handleUpdateParameters = useCallback(
    (botId, newParams) => {
      const params = {
        ...defaultParameters,
        ...selectedBotStatus.parameters,
        ...newParams,
      };

      axios
        .put(`${config.api.tradingUrl}/api/bots/${botId}/parameters`, params)
        .then((response) => {
          if (response.data.status === 'success') {
            fetchBots(); // Use fetchBots instead of fetchBotsStatus
          }
        })
        .catch((error) => console.error('Error updating parameters:', error));
    },
    [selectedBotStatus.parameters, defaultParameters, fetchBots] // Add fetchBots to dependencies
  );

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
              <h3 className='text-lg font-semibold text-blue-100 flex items-center gap-2'>
                {selectedBotStatus.name}
                <div className='group relative'>
                  <span className='cursor-help text-blue-400'>ⓘ</span>
                  <div className='absolute top-full left-0 mt-2 px-4 py-3 bg-gray-900 text-sm text-blue-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity w-80 pointer-events-none z-50'>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='font-medium'>
                          {selectedBotStatus.status?.strategy_info?.name}
                        </span>
                        <span className='text-xs text-blue-400'>
                          {selectedBotStatus.status?.strategy_info?.period}
                        </span>
                      </div>
                      <p>
                        {selectedBotStatus.status?.strategy_info?.description}
                      </p>
                      <ul className='list-disc ml-4 space-y-1'>
                        {selectedBotStatus.status?.strategy_info?.rules.map(
                          (rule, index) => (
                            <li key={index}>{rule}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
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

          {/* Parameters - won't rerender with status updates */}
          <BotParameters
            selectedBot={selectedBot}
            selectedBotStatus={selectedBotStatus}
            defaultParameters={defaultParameters}
            onUpdateParameters={handleUpdateParameters}
            onUpdateSymbol={handleUpdateSymbol}
          />

          {/* Polled data in separate component */}
          <BotStatus botId={selectedBot} />
        </div>
      )}
    </div>
  );
};

export default BotMonitor;
