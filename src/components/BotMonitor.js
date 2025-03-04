import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { config } from '../config';

const BotParameters = React.memo(
  ({ botId, parameters, onUpdate, availableInstruments, isBotRunning }) => {
    const [checkIntervalInput, setCheckIntervalInput] = useState(
      parameters?.check_interval
        ? Math.round(parameters.check_interval / 60)
        : 30
    );

    useEffect(() => {
      if (parameters?.check_interval) {
        setCheckIntervalInput(Math.round(parameters.check_interval / 60));
      }
    }, [parameters?.check_interval]);

    // Check if this is an AI strategy
    const isAIStrategy = botId.includes('ai_');

    // Trading term options for AI strategy
    const termOptions = [
      { value: 'Day trade', label: 'Day Trade (1-2 days)' },
      { value: 'Swing trade', label: 'Swing Trade (1-2 weeks)' },
      { value: 'Position trade', label: 'Position Trade (1-3 months)' },
    ];

    // Risk level options for AI strategy
    const riskLevelOptions = [
      { value: 'conservative', label: 'Conservative' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'aggressive', label: 'Aggressive' },
    ];

    const handleUpdateParameters = async (paramName, value) => {
      try {
        const updateData = { [paramName]: value };
        await axios.put(
          `${config.api.tradingUrl}/api/bots/${botId}/parameters`,
          updateData
        );
        onUpdate(); // Refresh the bot status after update
      } catch (err) {
        console.error('Error updating parameters:', err);
      }
    };

    return (
      <div className='bg-[#1a1f3c] p-4 rounded'>
        <h4 className='text-lg font-medium mb-4'>Parameters</h4>

        {/* Warning message when bot is running */}
        {isBotRunning && (
          <div className='bg-yellow-900/30 border border-yellow-700 text-yellow-200 p-3 rounded mb-4 text-sm'>
            <p>
              <span className='font-bold'>⚠️ Note:</span> Parameters cannot be
              changed while the bot is running. Stop the bot first to modify all
              settings.
            </p>
          </div>
        )}

        <div className='space-y-4'>
          {/* Trading Symbol - Only for non-AI strategies */}
          {!isAIStrategy && (
            <div className='flex items-center justify-between'>
              <label className='text-sm text-blue-300'>Trading Symbol</label>
              <select
                value={parameters?.symbol}
                onChange={(e) =>
                  handleUpdateParameters('symbol', e.target.value)
                }
                className={`bg-[#232a4d] px-2 py-1 rounded w-40 text-right ${
                  isBotRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isBotRunning}>
                {availableInstruments.map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Check Interval */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <label className='text-sm text-blue-300'>Check Interval</label>
              <div className='group relative'>
                <span className='cursor-help text-blue-400'>ⓘ</span>
                <div className='absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-xs text-blue-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 pointer-events-none'>
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
                  if (isBotRunning) return;
                  const value = parseInt(e.target.value) || 1;
                  const clampedValue = Math.min(10080, Math.max(1, value));
                  setCheckIntervalInput(clampedValue);
                }}
                onBlur={() => {
                  if (isBotRunning) return;
                  handleUpdateParameters(
                    'check_interval',
                    checkIntervalInput * 60
                  );
                }}
                className={`bg-[#232a4d] px-2 py-1 rounded w-24 text-right [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100 ${
                  isBotRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                min='1'
                max='10080'
                step='1'
                disabled={isBotRunning}
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
                {parameters?.continue_after_trade ? 'Yes' : 'No'}
              </span>
              <input
                type='checkbox'
                checked={parameters?.continue_after_trade}
                onChange={(e) => {
                  if (isBotRunning) return;
                  handleUpdateParameters(
                    'continue_after_trade',
                    e.target.checked
                  );
                }}
                className={`bg-[#232a4d] rounded w-4 h-4 checked:bg-blue-500 hover:cursor-pointer ${
                  isBotRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isBotRunning}
              />
            </div>
          </div>

          {/* Trailing Stop Loss */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <label className='text-sm text-blue-300'>
                Trailing Stop Loss
              </label>
              <div className='group relative'>
                <span className='cursor-help text-blue-400'>ⓘ</span>
                <div className='absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-xs text-blue-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 pointer-events-none'>
                  When enabled, the stop loss will move up as the price moves in
                  your favor, locking in profits while still protecting against
                  downside risk.
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-blue-300'>
                {parameters?.trailing_stop_loss ? 'Enabled' : 'Disabled'}
              </span>
              <input
                type='checkbox'
                checked={parameters?.trailing_stop_loss}
                onChange={(e) => {
                  if (isBotRunning) return;
                  handleUpdateParameters(
                    'trailing_stop_loss',
                    e.target.checked
                  );
                }}
                className={`bg-[#232a4d] rounded w-4 h-4 checked:bg-blue-500 hover:cursor-pointer ${
                  isBotRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isBotRunning}
              />
            </div>
          </div>

          {/* Max Concurrent Trades */}
          <div className='flex items-center justify-between'>
            <label className='text-sm text-blue-300'>
              Max Concurrent Trades
            </label>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                value={Math.max(
                  1,
                  Math.min(5, parameters?.max_concurrent_trades || 1)
                )}
                onChange={(e) => {
                  if (isBotRunning) return;
                  handleUpdateParameters(
                    'max_concurrent_trades',
                    Math.max(1, Math.min(5, parseInt(e.target.value) || 1))
                  );
                }}
                className={`bg-[#232a4d] px-2 py-1 rounded w-24 text-right ${
                  isBotRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                min='1'
                max='5'
                step='1'
                disabled={isBotRunning}
              />
            </div>
          </div>

          {/* Risk Per Trade */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <label className='text-sm text-blue-300'>Risk Per Trade</label>
              <div className='group relative'>
                <span className='cursor-help text-blue-400'>ⓘ</span>
                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-blue-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 pointer-events-none'>
                  {botId === 'ema_strategy'
                    ? `The percentage of your account balance to risk on each trade. 
                    Position size is calculated based on the distance between entry price and the 50 EMA (which serves as the stop loss).
                    For example, with 0.5% risk, a stop loss 2% away from entry would use 25% of your maximum position size.`
                    : `The percentage of your account balance to risk on each trade.
                    This determines your position size based on the distance between entry and stop loss.
                    Lower values (0.1-1%) are more conservative, higher values (1-5%) are more aggressive.`}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                value={Math.max(
                  0.1,
                  Math.min(10, parameters?.risk_percent || 0.5)
                )}
                onChange={(e) => {
                  if (isBotRunning) return;
                  handleUpdateParameters(
                    'risk_percent',
                    Math.max(
                      0.1,
                      Math.min(10, parseFloat(e.target.value) || 0.5)
                    )
                  );
                }}
                className={`bg-[#232a4d] px-2 py-1 rounded w-24 text-right ${
                  isBotRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                min='0.1'
                max='10'
                step='0.1'
                disabled={isBotRunning}
              />
              <span className='text-sm text-blue-300'>%</span>
            </div>
          </div>

          {/* Take Profit Level - For EMA strategy */}
          {botId === 'ema_strategy' && (
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <label className='text-sm text-blue-300'>
                  Take Profit Level
                </label>
                <div className='group relative'>
                  <span className='cursor-help text-blue-400'>ⓘ</span>
                  <div className='absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-xs text-blue-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity w-64 pointer-events-none'>
                    The percentage distance from entry to take profit level.
                    Higher values mean larger potential profits but lower win
                    rates.
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  value={
                    parameters?.take_profit_level !== undefined
                      ? (typeof parameters.take_profit_level === 'number'
                          ? parameters.take_profit_level
                          : parseFloat(parameters.take_profit_level)) * 100
                      : 400
                  }
                  onChange={(e) => {
                    if (isBotRunning) return;
                    handleUpdateParameters(
                      'take_profit_level',
                      Math.max(
                        0.5,
                        Math.min(20, parseFloat(e.target.value) || 0.5) / 100
                      )
                    );
                  }}
                  className={`bg-[#232a4d] px-2 py-1 rounded w-24 text-right ${
                    isBotRunning ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  min='0.5'
                  max='20'
                  step='0.1'
                  disabled={isBotRunning}
                />
                <span className='text-sm text-blue-300'>%</span>
              </div>
            </div>
          )}

          {/* AI-specific parameters */}
          {isAIStrategy && (
            <>
              {/* Trading Term */}
              <div className='flex items-center justify-between'>
                <label className='text-sm text-blue-300'>Trading Term</label>
                <div className='flex items-center gap-2'>
                  <select
                    value={parameters?.trading_term || 'Day trade'}
                    onChange={(e) => {
                      if (isBotRunning) return;
                      handleUpdateParameters('trading_term', e.target.value);
                    }}
                    className={`bg-[#232a4d] px-2 py-1 rounded w-40 ${
                      isBotRunning ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isBotRunning}>
                    {termOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Risk Level */}
              <div className='flex items-center justify-between'>
                <label className='text-sm text-blue-300'>Risk Level</label>
                <div className='flex items-center gap-2'>
                  <select
                    value={parameters?.risk_level || 'moderate'}
                    onChange={(e) => {
                      if (isBotRunning) return;
                      handleUpdateParameters('risk_level', e.target.value);
                    }}
                    className={`bg-[#232a4d] px-2 py-1 rounded w-40 ${
                      isBotRunning ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isBotRunning}>
                    {riskLevelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

/* Comment out the BotPerformance component
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
*/

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

  const handleClearLogs = async () => {
    try {
      await axios.post(`${config.api.tradingUrl}/api/bots/${botId}/clear-logs`);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  if (!status) return null;

  return (
    <>
      {/* Comment out the BotPerformance component usage
      <BotPerformance
        performance={status.performance}
        dailyPL={status.performance?.total_profit_loss || 0}
      />
      */}
      <div className='bg-[#1a1f3c] p-4 rounded'>
        <div className='flex justify-between items-center mb-4'>
          <h4 className='text-sm font-medium text-blue-300'>Recent Updates</h4>
          <button
            onClick={handleClearLogs}
            className='px-2 py-1 text-xs bg-blue-800 hover:bg-blue-700 text-blue-200 rounded flex items-center gap-1'>
            <span>Clear Logs</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-3 w-3'
              viewBox='0 0 20 20'
              fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>
        <div className='space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar border border-blue-900/50 rounded p-3 bg-[#151b36]'>
          {status.recent_updates
            ?.slice()
            .reverse()
            .map((update, index) => (
              <div
                key={index}
                className='text-sm text-blue-200 whitespace-pre-wrap border-b border-blue-900/30 pb-2 last:border-b-0'>
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
    // AI strategy default parameters
    trading_term: 'Day trade',
    risk_level: 'conservative',
    risk_percent: 0.5, // Default to 0.5% risk per trade
    trailing_stop_loss: false, // Default trailing stop loss to disabled
    take_profit_level: 0.04, // Default take profit level (4%)
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
        const currentStatus = botsStatus[botId]?.running || false;
        await axios.post(`${config.api.tradingUrl}/api/bots/${botId}/toggle`, {
          action: currentStatus ? 'stop' : 'start',
        });

        // Poll for status updates more frequently after toggling
        fetchBots(); // Immediate fetch

        // If stopping the bot, poll a few more times to ensure UI reflects the stopped state
        if (currentStatus) {
          // Poll 3 more times with a 1-second delay between polls
          setTimeout(() => fetchBots(), 1000);
          setTimeout(() => fetchBots(), 2000);
          setTimeout(() => fetchBots(), 3000);
        }
      } catch (err) {
        console.error('Error toggling bot:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [botsStatus, fetchBots]
  );

  const handleUpdateSymbol = useCallback(
    async (botId, symbol) => {
      try {
        const response = await axios.put(
          `${config.api.tradingUrl}/api/bots/${botId}/parameters`,
          {
            symbol: symbol,
          }
        );

        if (response.data.status === 'success') {
          fetchBots(); // Use fetchBots instead of fetchBotsStatus
        }
      } catch (err) {
        // Check if this is the "bot is running" error
        if (
          err.response &&
          err.response.data &&
          err.response.data.message &&
          err.response.data.message.includes(
            'Cannot change parameters while the bot is running'
          )
        ) {
          // Show a more user-friendly error message
          setError(
            'Cannot change symbol while the bot is running. Please stop the bot first.'
          );
        } else {
          setError(err.message);
        }

        // Refresh the bot status to ensure UI is in sync with server state
        fetchBots();
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
        .catch((error) => {
          // Check if this is the "bot is running" error
          if (
            error.response &&
            error.response.data &&
            error.response.data.message &&
            error.response.data.message.includes(
              'Cannot change parameters while the bot is running'
            )
          ) {
            // Show a more user-friendly error message
            setError(
              'Cannot change parameters while the bot is running. Please stop the bot first.'
            );
          } else {
            setError(error.message);
          }

          // Refresh the bot status to ensure UI is in sync with server state
          fetchBots();

          console.error('Error updating parameters:', error);
        });
    },
    [selectedBotStatus.parameters, defaultParameters, fetchBots] // Add fetchBots to dependencies
  );

  // Group bots by type
  const groupedBots = useMemo(() => {
    const groups = {
      technical: [],
      ai: [],
    };

    Object.entries(botsStatus).forEach(([botId, bot]) => {
      if (botId.startsWith('ai_')) {
        groups.ai.push({ id: botId, ...bot });
      } else {
        groups.technical.push({ id: botId, ...bot });
      }
    });

    return groups;
  }, [botsStatus]);

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
    <div className='p-6 bg-[#0f1535] text-white min-h-screen'>
      <h1 className='text-2xl font-bold mb-6'>Trading Bot Dashboard</h1>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='md:col-span-1 bg-[#1a1f3c] p-4 rounded'>
          <h2 className='text-xl font-bold mb-4'>Trading Bots</h2>

          {/* Technical Analysis Bots */}
          <div className='mb-6'>
            <h3 className='text-md font-semibold text-blue-300 mb-2'>
              Technical Analysis
            </h3>
            <ul className='space-y-2'>
              {groupedBots.technical.map((bot) => (
                <li
                  key={bot.id}
                  className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                    selectedBot === bot.id
                      ? 'bg-blue-800 text-white'
                      : 'hover:bg-[#2a2f4c]'
                  }`}
                  onClick={() => setSelectedBot(bot.id)}>
                  <span>{bot.name}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      bot.running ? 'bg-green-800' : 'bg-red-800'
                    }`}>
                    {bot.running ? 'Running' : 'Stopped'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Strategy Bots */}
          <div>
            <h3 className='text-md font-semibold text-blue-300 mb-2'>
              AI Strategies
            </h3>
            <ul className='space-y-2'>
              {groupedBots.ai.map((bot) => (
                <li
                  key={bot.id}
                  className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                    selectedBot === bot.id
                      ? 'bg-blue-800 text-white'
                      : 'hover:bg-[#2a2f4c]'
                  }`}
                  onClick={() => setSelectedBot(bot.id)}>
                  <span>{bot.name}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      bot.running ? 'bg-green-800' : 'bg-red-800'
                    }`}>
                    {bot.running ? 'Running' : 'Stopped'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='md:col-span-3 space-y-6'>
          {/* Bot Controls */}
          <div className='bg-[#1a1f3c] p-4 rounded'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>{selectedBotStatus.name}</h2>
              <button
                onClick={() => handleToggleBot(selectedBot)}
                disabled={loading}
                className={`px-4 py-2 rounded ${
                  selectedBotStatus.running
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}>
                {loading
                  ? 'Processing...'
                  : selectedBotStatus.running
                  ? 'Stop Bot'
                  : 'Start Bot'}
              </button>
            </div>

            {/* Bot Parameters */}
            <BotParameters
              botId={selectedBot}
              parameters={selectedBotStatus.parameters || defaultParameters}
              onUpdate={fetchBots}
              availableInstruments={
                selectedBotStatus.status?.available_instruments || []
              }
              isBotRunning={selectedBotStatus.running}
            />
          </div>

          {/* Bot Status */}
          <BotStatus botId={selectedBot} />
        </div>
      </div>
    </div>
  );
};

export default BotMonitor;
