import React, { useState, useEffect } from 'react';
import './MasterBot.css';
import { config } from '../config';

const MasterBot = () => {
  const [botStatus, setBotStatus] = useState({
    is_running: false,
    current_position: null,
    performance_metrics: {
      total_trades: 0,
      winning_trades: 0,
      total_profit_loss: 0.0,
      max_drawdown: 0.0,
      sharpe_ratio: 0.0,
      win_rate: 0.0,
      avg_risk_reward: 0.0,
    },
    asset_rankings: {},
    status_log: [],
    trade_history: [],
    risk_config: {
      max_risk_per_trade: 1.0,
      max_portfolio_risk: 3.0,
      min_risk_reward_ratio: 2.0,
      max_drawdown_limit: 10.0,
      confidence_threshold: 50.0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const API_BASE = config.api.backendUrl;

  // Fetch bot status
  const fetchBotStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/master-bot/status`);
      const data = await response.json();
      if (data.status === 'success') {
        setBotStatus((prev) => ({
          ...prev,
          ...data.data,
          performance_metrics: {
            ...prev.performance_metrics,
            ...(data.data.performance_metrics || {}),
          },
          risk_config: {
            ...prev.risk_config,
            ...(data.data.risk_config || {}),
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching bot status:', error);
    }
  };

  // Start bot (with existing analysis)
  const startBot = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/master-bot/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert(`🎉 Master Trading Bot started successfully!`);
        fetchBotStatus();
      } else {
        // Handle different error types
        if (data.weekend_warning) {
          alert(
            `⚠️ ${data.message}\n\nPlease try again during weekdays (Monday-Friday).`
          );
        } else if (data.need_analysis) {
          alert(`📊 ${data.message}\n\nPlease run analysis first.`);
        } else {
          alert(`❌ ${data.message}`);
        }
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Analyze and start bot (combined function)
  const analyzeAndStart = async () => {
    setLoading(true);
    setAnalyzing(true);

    try {
      const response = await fetch(`${API_BASE}/master-bot/analyze-and-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert(`🎉 ${data.message}`);
        fetchBotStatus();
      } else {
        // Handle different error types
        if (data.weekend_warning) {
          alert(
            `⚠️ ${data.message}\n\nPlease try again during weekdays (Monday-Friday).`
          );
        } else if (data.analysis_completed) {
          alert(
            `📊 ${data.message}\n\nWaiting for better market conditions...`
          );
        } else {
          alert(`❌ ${data.message}`);
        }
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  // Stop bot
  const stopBot = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/master-bot/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert('Master Trading Bot stopped successfully!');
        fetchBotStatus();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Error stopping bot: ${error.message}`);
    }
    setLoading(false);
  };

  // Analyze markets
  const analyzeMarkets = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE}/master-bot/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert(
          `Analysis complete! Analyzed ${
            Object.keys(data.data.asset_rankings).length
          } assets`
        );
        fetchBotStatus();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Error analyzing markets: ${error.message}`);
    }
    setAnalyzing(false);
  };

  // Force trade
  const forceTrade = async () => {
    if (!confirm('Are you sure you want to force execute a trade?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/master-bot/force-trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert('Trade executed successfully!');
        fetchBotStatus();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Error forcing trade: ${error.message}`);
    }
    setLoading(false);
  };

  // Auto-refresh status
  useEffect(() => {
    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (botStatus.is_running) return '#10B981'; // Green
    return '#EF4444'; // Red
  };

  const formatPnL = (pnl) => {
    const color = pnl >= 0 ? '#10B981' : '#EF4444';
    return (
      <span style={{ color }}>
        {pnl >= 0 ? '+' : ''}
        {pnl.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className='master-bot-container'>
      <div className='master-bot-header'>
        <h1>🚀 Master AI Trading Bot</h1>
        <div className='bot-status'>
          <div
            className='status-indicator'
            style={{ backgroundColor: getStatusColor() }}></div>
          <span>{botStatus.is_running ? 'RUNNING' : 'STOPPED'}</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className='control-panel'>
        <div className='control-buttons'>
          {/* Conditional Start Button */}
          {Object.keys(botStatus.asset_rankings || {}).length > 0 ? (
            // Show "Start Bot" when analysis is available
            <button
              onClick={startBot}
              disabled={loading || botStatus.is_running}
              className='btn btn-start'>
              {loading ? 'Starting...' : 'Start Bot'}
            </button>
          ) : (
            // Show "Analyze & Start Bot" when no analysis is available
            <button
              onClick={analyzeAndStart}
              disabled={loading || analyzing || botStatus.is_running}
              className='btn btn-start'>
              {analyzing ? 'Analyzing & Starting...' : 'Analyze & Start Bot'}
            </button>
          )}

          <button
            onClick={stopBot}
            disabled={loading || !botStatus.is_running}
            className='btn btn-stop'>
            {loading ? 'Stopping...' : 'Stop Bot'}
          </button>

          <button
            onClick={analyzeMarkets}
            disabled={analyzing || botStatus.is_running}
            className='btn btn-analyze'>
            {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </button>

          <button
            onClick={forceTrade}
            disabled={
              loading || !botStatus.is_running || botStatus.current_position
            }
            className='btn btn-trade'>
            Force Trade
          </button>
        </div>

        {/* Status indicators */}
        <div className='control-status'>
          {botStatus.is_running && (
            <div className='status-indicator-text'>
              🤖 Bot is actively monitoring markets...
            </div>
          )}
          {analyzing && (
            <div className='status-indicator-text'>
              🔍 Analyzing 9 assets for profit opportunities...
            </div>
          )}
          {!botStatus.is_running &&
            !analyzing &&
            Object.keys(botStatus.asset_rankings || {}).length > 0 && (
              <div className='status-indicator-text ready-state'>
                ✅ Analysis complete - Ready to start trading!
              </div>
            )}
        </div>
      </div>

      {/* Current Position */}
      {botStatus.current_position && (
        <div className='current-position'>
          <h3>📈 Current Position</h3>
          <div className='position-details'>
            <div className='position-info'>
              <span className='symbol'>
                {botStatus.current_position.symbol}
              </span>
              <span className='direction'>
                {botStatus.current_position.direction}
              </span>
              <span className='entry'>
                Entry: {botStatus.current_position.entry_price}
              </span>
            </div>
            <div className='position-targets'>
              <span>TP: {botStatus.current_position.take_profit}</span>
              <span>SL: {botStatus.current_position.stop_loss}</span>
            </div>
            <div className='position-rationale'>
              <small>{botStatus.current_position.rationale}</small>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className='performance-metrics'>
        <h3>📊 Performance</h3>
        <div className='metrics-grid'>
          <div className='metric'>
            <span className='metric-label'>Total Trades</span>
            <span className='metric-value'>
              {botStatus.performance_metrics.total_trades || 0}
            </span>
          </div>
          <div className='metric'>
            <span className='metric-label'>Win Rate</span>
            <span className='metric-value'>
              {(botStatus.performance_metrics.win_rate || 0).toFixed(1)}%
            </span>
          </div>
          <div className='metric'>
            <span className='metric-label'>Total P&L</span>
            <span className='metric-value'>
              {formatPnL(botStatus.performance_metrics.total_profit_loss || 0)}
            </span>
          </div>
          <div className='metric'>
            <span className='metric-label'>Winning Trades</span>
            <span className='metric-value'>
              {botStatus.performance_metrics.winning_trades || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Asset Rankings */}
      <div className='asset-rankings'>
        <h3>🏆 Asset Rankings & Trading Opportunities</h3>
        <div className='rankings-grid'>
          {Object.entries(botStatus.asset_rankings || {})
            .filter(([symbol, score]) => typeof score === 'number')
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([symbol, score]) => {
              const details = botStatus.asset_details?.[symbol] || {};
              return (
                <div key={symbol} className='asset-card'>
                  {/* Card Header */}
                  <div className='card-header'>
                    <div className='asset-info'>
                      <span className='asset-symbol'>
                        {symbol.replace('_', '/')}
                      </span>
                      <span className='asset-price'>
                        $
                        {details.current_price?.toFixed(
                          details.current_price > 100 ? 2 : 4
                        ) || 'N/A'}
                      </span>
                    </div>
                    <div className='trade-direction'>
                      <span
                        className={`direction-badge ${
                          details.direction?.toLowerCase() || 'neutral'
                        }`}>
                        {details.direction || 'NEUTRAL'}
                      </span>
                      <span className='profit-score'>
                        {(score || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* AI Rationale */}
                  <div className='card-section'>
                    <h4>🤖 AI Analysis</h4>
                    <p className='rationale-text'>
                      {details.rationale || 'AI-powered market analysis'}
                    </p>
                    <div className='confidence-bar'>
                      <span className='confidence-label'>
                        Confidence: {details.confidence || 50}%
                      </span>
                      <div className='confidence-meter'>
                        <div
                          className='confidence-fill'
                          style={{
                            width: `${details.confidence || 50}%`,
                          }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Trading Levels */}
                  <div className='card-section'>
                    <h4>🎯 Trading Setup</h4>
                    <div className='trading-levels'>
                      <div className='level-item'>
                        <span className='level-label'>Entry:</span>
                        <span className='level-value'>
                          $
                          {details.entry_price?.toFixed(
                            details.entry_price > 100 ? 2 : 4
                          ) || 'N/A'}
                        </span>
                      </div>
                      <div className='level-item'>
                        <span className='level-label'>Take Profit:</span>
                        <span className='level-value profit'>
                          $
                          {details.take_profit?.toFixed(
                            details.take_profit > 100 ? 2 : 4
                          ) || 'N/A'}
                        </span>
                      </div>
                      <div className='level-item'>
                        <span className='level-label'>Stop Loss:</span>
                        <span className='level-value loss'>
                          $
                          {details.stop_loss?.toFixed(
                            details.stop_loss > 100 ? 2 : 4
                          ) || 'N/A'}
                        </span>
                      </div>
                      <div className='level-item'>
                        <span className='level-label'>R/R Ratio:</span>
                        <span className='level-value'>
                          {details.risk_reward_ratio || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Drivers */}
                  {details.key_drivers && details.key_drivers.length > 0 && (
                    <div className='card-section'>
                      <h4>🔑 Key Drivers</h4>
                      <ul className='drivers-list'>
                        {details.key_drivers
                          .slice(0, 3)
                          .map((driver, index) => (
                            <li key={index} className='driver-item'>
                              {driver}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk Assessment */}
                  <div className='card-section'>
                    <h4>⚠️ Risk Assessment</h4>
                    <p className='risk-text'>
                      {details.risk_assessment || 'Standard risk'}
                    </p>
                  </div>
                </div>
              );
            })}
          {Object.keys(botStatus.asset_rankings || {}).length === 0 && (
            <div className='no-rankings'>
              {analyzing ? (
                <div className='loading-state'>
                  <div className='spinner-container'>
                    <div className='loading-spinner'></div>
                    <h4>🔍 Analyzing Markets...</h4>
                    <p>AI is evaluating 9 assets for trading opportunities</p>
                    <div className='loading-progress'>
                      <div className='progress-bar'>
                        <div className='progress-fill'></div>
                      </div>
                      <span className='progress-text'>Please wait...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='empty-state'>
                  <h4>📊 No Analysis Available</h4>
                  <p>
                    Click "Analyze & Start Bot" or "Refresh Analysis" to see
                    detailed trading opportunities.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Log */}
      <div className='status-log'>
        <h3>📝 Status Log</h3>
        <div className='log-container'>
          {botStatus.status_log &&
            botStatus.status_log
              .slice(-10)
              .reverse()
              .map((log, index) => (
                <div key={index} className='log-entry'>
                  {log}
                </div>
              ))}
        </div>
      </div>

      {/* Recent Trades */}
      {botStatus.trade_history && botStatus.trade_history.length > 0 && (
        <div className='recent-trades'>
          <h3>📈 Recent Trades</h3>
          <div className='trades-container'>
            {botStatus.trade_history
              .slice(-5)
              .reverse()
              .map((trade, index) => (
                <div key={index} className='trade-item'>
                  <div className='trade-header'>
                    <span className='trade-symbol'>{trade.symbol}</span>
                    <span className='trade-direction'>{trade.direction}</span>
                    <span className='trade-pnl'>
                      {formatPnL(trade.final_pnl || 0)}
                    </span>
                  </div>
                  <div className='trade-details'>
                    <small>
                      Entry: {trade.entry_price} | Score:{' '}
                      {trade.profit_score?.toFixed(1)}
                    </small>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Risk Configuration */}
      <div className='risk-config'>
        <h3>⚙️ Risk Management Settings</h3>
        <div className='config-grid'>
          <div className='config-item'>
            <label>Max Risk per Trade (%)</label>
            <input
              type='number'
              min='0.1'
              max='5'
              step='0.1'
              defaultValue={botStatus.risk_config?.max_risk_per_trade || 1}
              className='config-input'
            />
          </div>
          <div className='config-item'>
            <label>Max Drawdown Limit (%)</label>
            <input
              type='number'
              min='5'
              max='25'
              step='1'
              defaultValue={botStatus.risk_config?.max_drawdown_limit || 10}
              className='config-input'
            />
          </div>
          <div className='config-item'>
            <label>Min Risk/Reward Ratio</label>
            <input
              type='number'
              min='1'
              max='5'
              step='0.1'
              defaultValue={botStatus.risk_config?.min_risk_reward_ratio || 2}
              className='config-input'
            />
          </div>
          <div className='config-item'>
            <label>Confidence Threshold (%)</label>
            <input
              type='number'
              min='30'
              max='80'
              step='5'
              defaultValue={botStatus.risk_config?.confidence_threshold || 50}
              className='config-input'
            />
          </div>
          <div className='config-item'>
            <label>Trading Term</label>
            <select className='config-select' defaultValue='intraday'>
              <option value='intraday'>Intraday (same day)</option>
              <option value='swing'>Swing Trade (2 days - 2 weeks)</option>
              <option value='longterm'>Long Term (1 month+)</option>
            </select>
          </div>
        </div>
        <div className='config-actions'>
          <button
            className='btn btn-update'
            onClick={() => alert('Risk settings updated!')}>
            Update Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterBot;
