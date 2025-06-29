import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const TradingBots = () => {
  const [customBots, setCustomBots] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  const [newBot, setNewBot] = useState({
    name: '',
    description: '',
    code: '',
    enabled: false,
    instruments: [],
    riskLevel: 'medium',
  });

  // Available instruments for bot configuration
  const availableInstruments = [
    'EUR_USD',
    'GBP_USD',
    'USD_JPY',
    'AUD_USD',
    'USD_CAD',
    'BTC_USD',
    'SPX500_USD',
    'NAS100_USD',
    'XAU_USD',
    'BCO_USD',
  ];

  // Load custom bots from localStorage
  useEffect(() => {
    const savedBots = localStorage.getItem('tradingBots');
    if (savedBots) {
      setCustomBots(JSON.parse(savedBots));
    }
  }, []);

  // Save custom bots to localStorage
  const saveBots = (bots) => {
    localStorage.setItem('tradingBots', JSON.stringify(bots));
    setCustomBots(bots);
  };

  // Create new bot
  const handleCreateBot = () => {
    if (!newBot.name || !newBot.code) {
      toast.error('Bot name and code are required');
      return;
    }

    const bot = {
      ...newBot,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'stopped',
      performance: {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        lastRun: null,
      },
    };

    const updatedBots = [...customBots, bot];
    saveBots(updatedBots);
    setShowCreateModal(false);
    setNewBot({
      name: '',
      description: '',
      code: '',
      enabled: false,
      instruments: [],
      riskLevel: 'medium',
    });
    toast.success('Custom bot created successfully!');
  };

  // Delete bot
  const handleDeleteBot = (botId) => {
    if (window.confirm('Are you sure you want to delete this bot?')) {
      const updatedBots = customBots.filter((bot) => bot.id !== botId);
      saveBots(updatedBots);
      toast.success('Bot deleted successfully');
    }
  };

  // Toggle bot status
  const handleToggleBot = (botId) => {
    const updatedBots = customBots.map((bot) => {
      if (bot.id === botId) {
        const newStatus = bot.status === 'running' ? 'stopped' : 'running';
        if (newStatus === 'running') {
          toast.success(`Bot "${bot.name}" started`);
        } else {
          toast.info(`Bot "${bot.name}" stopped`);
        }
        return { ...bot, status: newStatus };
      }
      return bot;
    });
    saveBots(updatedBots);
  };

  // Edit bot
  const handleEditBot = (bot) => {
    setEditingBot(bot);
    setNewBot(bot);
    setShowCreateModal(true);
  };

  // Update existing bot
  const handleUpdateBot = () => {
    if (!newBot.name || !newBot.code) {
      toast.error('Bot name and code are required');
      return;
    }

    const updatedBots = customBots.map((bot) => {
      if (bot.id === editingBot.id) {
        return { ...bot, ...newBot, updatedAt: new Date().toISOString() };
      }
      return bot;
    });

    saveBots(updatedBots);
    setShowCreateModal(false);
    setEditingBot(null);
    setNewBot({
      name: '',
      description: '',
      code: '',
      enabled: false,
      instruments: [],
      riskLevel: 'medium',
    });
    toast.success('Bot updated successfully!');
  };

  // Sample bot templates
  const botTemplates = {
    javascript: `// Custom Trading Bot Template (JavaScript)
// This is a sample bot that demonstrates the basic structure

class CustomBot {
  constructor(config) {
    this.name = config.name;
    this.instruments = config.instruments;
    this.riskLevel = config.riskLevel;
  }

  // Main trading logic
  async analyze(marketData) {
    // Your analysis logic here
    const { symbol, price, indicators } = marketData;
    
    // Example: Simple moving average crossover
    const shortMA = indicators.sma_10;
    const longMA = indicators.sma_20;
    
    if (shortMA > longMA) {
      return {
        action: 'BUY',
        confidence: 0.7,
        reason: 'Short MA crossed above Long MA'
      };
    } else if (shortMA < longMA) {
      return {
        action: 'SELL',
        confidence: 0.7,
        reason: 'Short MA crossed below Long MA'
      };
    }
    
    return {
      action: 'HOLD',
      confidence: 0.5,
      reason: 'No clear signal'
    };
  }

  // Risk management
  calculatePositionSize(accountBalance, riskPerTrade) {
    return accountBalance * (riskPerTrade / 100);
  }

  // Entry and exit logic
  shouldEnter(signal) {
    return signal.confidence > 0.6;
  }

  shouldExit(position, currentPrice) {
    // Example exit conditions
    const profitTarget = position.entryPrice * 1.02; // 2% profit
    const stopLoss = position.entryPrice * 0.98; // 2% loss
    
    return currentPrice >= profitTarget || currentPrice <= stopLoss;
  }
}

// Export the bot class
module.exports = CustomBot;`,

    python: `# Custom Trading Bot Template (Python)
# Advanced trading bot with technical indicators and risk management

import pandas as pd
import numpy as np
import talib
from datetime import datetime, timedelta

class CustomTradingBot:
    def __init__(self, config):
        self.name = config['name']
        self.instruments = config['instruments']
        self.risk_level = config['risk_level']
        self.max_risk_per_trade = 0.02  # 2% max risk per trade
        self.positions = {}
        
    def get_technical_indicators(self, df):
        """Calculate technical indicators"""
        # Moving Averages
        df['SMA_20'] = talib.SMA(df['close'], timeperiod=20)
        df['SMA_50'] = talib.SMA(df['close'], timeperiod=50)
        df['EMA_12'] = talib.EMA(df['close'], timeperiod=12)
        df['EMA_26'] = talib.EMA(df['close'], timeperiod=26)
        
        # RSI
        df['RSI'] = talib.RSI(df['close'], timeperiod=14)
        
        # MACD
        df['MACD'], df['MACD_signal'], df['MACD_hist'] = talib.MACD(df['close'])
        
        # Bollinger Bands
        df['BB_upper'], df['BB_middle'], df['BB_lower'] = talib.BBANDS(df['close'])
        
        # ATR for volatility
        df['ATR'] = talib.ATR(df['high'], df['low'], df['close'], timeperiod=14)
        
        return df
    
    def analyze_market(self, symbol, df):
        """Main analysis function"""
        df = self.get_technical_indicators(df)
        latest = df.iloc[-1]
        prev = df.iloc[-2]
        
        signals = []
        confidence = 0
        
        # Moving Average Crossover Strategy
        if latest['SMA_20'] > latest['SMA_50'] and prev['SMA_20'] <= prev['SMA_50']:
            signals.append("SMA 20 crossed above SMA 50 - BULLISH")
            confidence += 0.3
            
        if latest['SMA_20'] < latest['SMA_50'] and prev['SMA_20'] >= prev['SMA_50']:
            signals.append("SMA 20 crossed below SMA 50 - BEARISH")
            confidence -= 0.3
        
        # RSI Strategy
        if latest['RSI'] < 30:
            signals.append("RSI oversold - potential BUY signal")
            confidence += 0.2
        elif latest['RSI'] > 70:
            signals.append("RSI overbought - potential SELL signal")
            confidence -= 0.2
            
        # MACD Strategy
        if latest['MACD'] > latest['MACD_signal'] and prev['MACD'] <= prev['MACD_signal']:
            signals.append("MACD bullish crossover")
            confidence += 0.25
        elif latest['MACD'] < latest['MACD_signal'] and prev['MACD'] >= prev['MACD_signal']:
            signals.append("MACD bearish crossover")
            confidence -= 0.25
            
        # Bollinger Bands Strategy
        if latest['close'] <= latest['BB_lower']:
            signals.append("Price at lower Bollinger Band - potential bounce")
            confidence += 0.15
        elif latest['close'] >= latest['BB_upper']:
            signals.append("Price at upper Bollinger Band - potential pullback")
            confidence -= 0.15
            
        # Determine action
        if confidence >= 0.4:
            action = 'BUY'
        elif confidence <= -0.4:
            action = 'SELL'
        else:
            action = 'HOLD'
            
        return {
            'symbol': symbol,
            'action': action,
            'confidence': abs(confidence),
            'signals': signals,
            'price': latest['close'],
            'stop_loss': self.calculate_stop_loss(latest, action),
            'take_profit': self.calculate_take_profit(latest, action),
            'position_size': self.calculate_position_size(latest['close'], latest['ATR'])
        }
    
    def calculate_stop_loss(self, latest, action):
        """Calculate dynamic stop loss using ATR"""
        atr_multiplier = 2.0
        if action == 'BUY':
            return latest['close'] - (latest['ATR'] * atr_multiplier)
        elif action == 'SELL':
            return latest['close'] + (latest['ATR'] * atr_multiplier)
        return None
    
    def calculate_take_profit(self, latest, action):
        """Calculate take profit with 2:1 risk/reward ratio"""
        atr_multiplier = 4.0  # 2x the stop loss distance
        if action == 'BUY':
            return latest['close'] + (latest['ATR'] * atr_multiplier)
        elif action == 'SELL':
            return latest['close'] - (latest['ATR'] * atr_multiplier)
        return None
    
    def calculate_position_size(self, price, atr):
        """Calculate position size based on ATR and risk management"""
        # This would use your account balance in real implementation
        account_balance = 10000  # Example balance
        risk_amount = account_balance * self.max_risk_per_trade
        
        # Position size based on ATR stop loss
        stop_distance = atr * 2.0
        position_size = risk_amount / stop_distance
        
        return min(position_size, account_balance * 0.1)  # Max 10% of balance
    
    def backtest_strategy(self, symbol, df, start_date, end_date):
        """Simple backtesting function"""
        results = []
        df = self.get_technical_indicators(df)
        
        for i in range(50, len(df)):  # Start after indicators are calculated
            current_data = df.iloc[:i+1]
            signal = self.analyze_market(symbol, current_data)
            results.append({
                'date': df.iloc[i]['timestamp'],
                'price': df.iloc[i]['close'],
                'action': signal['action'],
                'confidence': signal['confidence']
            })
            
        return results
    
    def run_live_analysis(self, market_data):
        """Main entry point for live trading"""
        results = {}
        
        for symbol in self.instruments:
            if symbol in market_data:
                df = pd.DataFrame(market_data[symbol])
                analysis = self.analyze_market(symbol, df)
                results[symbol] = analysis
                
        return results

# Example usage:
# bot = CustomTradingBot({
#     'name': 'Multi-Indicator Bot',
#     'instruments': ['EUR_USD', 'GBP_USD', 'BTC_USD'],
#     'risk_level': 'medium'
# })`,

    advanced_python: `# Advanced Multi-Strategy Trading Bot (Python)
# Combines multiple strategies with machine learning

import pandas as pd
import numpy as np
import talib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle
import warnings
warnings.filterwarnings('ignore')

class AdvancedTradingBot:
    def __init__(self, config):
        self.name = config['name']
        self.instruments = config['instruments']
        self.risk_level = config['risk_level']
        self.ml_model = None
        self.scaler = StandardScaler()
        self.feature_columns = []
        
    def calculate_features(self, df):
        """Calculate comprehensive technical features"""
        # Price-based features
        df['returns'] = df['close'].pct_change()
        df['log_returns'] = np.log(df['close'] / df['close'].shift(1))
        df['price_change'] = df['close'] - df['open']
        df['true_range'] = np.maximum(df['high'] - df['low'], 
                                    np.maximum(abs(df['high'] - df['close'].shift(1)),
                                             abs(df['low'] - df['close'].shift(1))))
        
        # Moving averages
        for period in [5, 10, 20, 50]:
            df[f'sma_{period}'] = talib.SMA(df['close'], timeperiod=period)
            df[f'ema_{period}'] = talib.EMA(df['close'], timeperiod=period)
            df[f'sma_ratio_{period}'] = df['close'] / df[f'sma_{period}']
            
        # Momentum indicators
        df['rsi_14'] = talib.RSI(df['close'], timeperiod=14)
        df['rsi_7'] = talib.RSI(df['close'], timeperiod=7)
        df['stoch_k'], df['stoch_d'] = talib.STOCH(df['high'], df['low'], df['close'])
        df['williams_r'] = talib.WILLR(df['high'], df['low'], df['close'])
        
        # Trend indicators
        df['macd'], df['macd_signal'], df['macd_hist'] = talib.MACD(df['close'])
        df['adx'] = talib.ADX(df['high'], df['low'], df['close'])
        df['cci'] = talib.CCI(df['high'], df['low'], df['close'])
        
        # Volatility indicators
        df['atr'] = talib.ATR(df['high'], df['low'], df['close'])
        df['bb_upper'], df['bb_middle'], df['bb_lower'] = talib.BBANDS(df['close'])
        df['bb_width'] = (df['bb_upper'] - df['bb_lower']) / df['bb_middle']
        df['bb_position'] = (df['close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
        
        # Volume indicators (if volume data available)
        if 'volume' in df.columns:
            df['ad_line'] = talib.AD(df['high'], df['low'], df['close'], df['volume'])
            df['obv'] = talib.OBV(df['close'], df['volume'])
            df['volume_sma'] = talib.SMA(df['volume'], timeperiod=20)
            df['volume_ratio'] = df['volume'] / df['volume_sma']
        
        # Pattern recognition
        df['doji'] = talib.CDLDOJI(df['open'], df['high'], df['low'], df['close'])
        df['hammer'] = talib.CDLHAMMER(df['open'], df['high'], df['low'], df['close'])
        df['engulfing'] = talib.CDLENGULFING(df['open'], df['high'], df['low'], df['close'])
        
        return df
    
    def prepare_ml_features(self, df):
        """Prepare features for machine learning"""
        feature_cols = [
            'returns', 'sma_ratio_5', 'sma_ratio_10', 'sma_ratio_20', 'sma_ratio_50',
            'rsi_14', 'rsi_7', 'stoch_k', 'stoch_d', 'williams_r',
            'macd', 'macd_signal', 'macd_hist', 'adx', 'cci',
            'atr', 'bb_width', 'bb_position'
        ]
        
        # Add lagged features
        for col in ['returns', 'rsi_14', 'macd']:
            for lag in [1, 2, 3]:
                df[f'{col}_lag_{lag}'] = df[col].shift(lag)
                feature_cols.append(f'{col}_lag_{lag}')
        
        # Rolling statistics
        for window in [5, 10]:
            df[f'returns_mean_{window}'] = df['returns'].rolling(window).mean()
            df[f'returns_std_{window}'] = df['returns'].rolling(window).std()
            df[f'rsi_mean_{window}'] = df['rsi_14'].rolling(window).mean()
            feature_cols.extend([f'returns_mean_{window}', f'returns_std_{window}', f'rsi_mean_{window}'])
        
        self.feature_columns = feature_cols
        return df[feature_cols].dropna()
    
    def create_labels(self, df, forward_periods=5, threshold=0.001):
        """Create trading labels for ML training"""
        df['future_return'] = df['close'].shift(-forward_periods) / df['close'] - 1
        
        # Create three classes: BUY (1), HOLD (0), SELL (-1)
        df['label'] = 0  # Default to HOLD
        df.loc[df['future_return'] > threshold, 'label'] = 1   # BUY
        df.loc[df['future_return'] < -threshold, 'label'] = -1  # SELL
        
        return df['label']
    
    def train_ml_model(self, df):
        """Train machine learning model"""
        df = self.calculate_features(df)
        X = self.prepare_ml_features(df)
        y = self.create_labels(df)
        
        # Align X and y
        min_len = min(len(X), len(y))
        X = X.iloc[:min_len]
        y = y.iloc[:min_len]
        
        # Remove rows with NaN
        mask = ~(X.isnull().any(axis=1) | y.isnull())
        X = X[mask]
        y = y[mask]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Random Forest
        self.ml_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        self.ml_model.fit(X_scaled, y)
        
        # Print feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.ml_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("Top 10 Most Important Features:")
        print(feature_importance.head(10))
        
        return self.ml_model
    
    def predict_signal(self, df):
        """Predict trading signal using ML model"""
        if self.ml_model is None:
            return self.fallback_strategy(df)
        
        df = self.calculate_features(df)
        X = self.prepare_ml_features(df)
        
        if len(X) == 0:
            return self.fallback_strategy(df)
        
        # Use only the latest row for prediction
        X_latest = X.iloc[-1:].fillna(0)
        X_scaled = self.scaler.transform(X_latest)
        
        # Predict
        prediction = self.ml_model.predict(X_scaled)[0]
        probability = self.ml_model.predict_proba(X_scaled)[0]
        
        # Map prediction to action
        action_map = {-1: 'SELL', 0: 'HOLD', 1: 'BUY'}
        action = action_map[prediction]
        confidence = max(probability)
        
        return {
            'action': action,
            'confidence': confidence,
            'ml_prediction': prediction,
            'probabilities': {
                'sell': probability[0] if len(probability) > 2 else 0,
                'hold': probability[1] if len(probability) > 2 else probability[0],
                'buy': probability[2] if len(probability) > 2 else probability[1]
            }
        }
    
    def fallback_strategy(self, df):
        """Fallback strategy when ML model is not available"""
        df = self.calculate_features(df)
        latest = df.iloc[-1]
        
        # Simple multi-indicator strategy
        signals = 0
        
        # RSI
        if latest['rsi_14'] < 30:
            signals += 1
        elif latest['rsi_14'] > 70:
            signals -= 1
            
        # MACD
        if latest['macd'] > latest['macd_signal']:
            signals += 1
        else:
            signals -= 1
            
        # Bollinger Bands
        if latest['bb_position'] < 0.2:
            signals += 1
        elif latest['bb_position'] > 0.8:
            signals -= 1
        
        # Determine action
        if signals >= 2:
            action = 'BUY'
            confidence = 0.7
        elif signals <= -2:
            action = 'SELL'
            confidence = 0.7
        else:
            action = 'HOLD'
            confidence = 0.5
            
        return {'action': action, 'confidence': confidence}
    
    def analyze_market(self, symbol, df):
        """Main analysis function combining ML and traditional indicators"""
        # Get ML prediction
        ml_result = self.predict_signal(df)
        
        # Get traditional analysis
        traditional_result = self.fallback_strategy(df)
        
        # Combine signals (you can customize this logic)
        if ml_result['confidence'] > 0.6:
            final_action = ml_result['action']
            final_confidence = ml_result['confidence']
        else:
            final_action = traditional_result['action']
            final_confidence = traditional_result['confidence']
        
        latest = df.iloc[-1]
        
        return {
            'symbol': symbol,
            'action': final_action,
            'confidence': final_confidence,
            'ml_signal': ml_result,
            'traditional_signal': traditional_result,
            'price': latest['close'],
            'timestamp': latest.get('timestamp', pd.Timestamp.now())
        }

# Example usage:
# bot = AdvancedTradingBot({
#     'name': 'ML Multi-Strategy Bot',
#     'instruments': ['EUR_USD', 'GBP_USD', 'BTC_USD'],
#     'risk_level': 'high'
# })
#
# # Train the model with historical data
# historical_data = get_historical_data('EUR_USD', '2020-01-01', '2023-01-01')
# bot.train_ml_model(historical_data)
#
# # Analyze current market
# current_data = get_current_data('EUR_USD')
# signal = bot.analyze_market('EUR_USD', current_data)`,
  };

  const [selectedTemplate, setSelectedTemplate] = useState('javascript');

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-white'>Custom Trading Bots</h2>
          <p className='text-gray-400'>
            Create and manage your custom trading algorithms
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'>
          <span>+</span>
          Create Bot
        </button>
      </div>

      {/* Bot List */}
      <div className='grid gap-6'>
        {customBots.length === 0 ? (
          <div className='bg-[#232a4d] p-8 rounded-lg text-center'>
            <div className='text-6xl mb-4'>🤖</div>
            <h3 className='text-xl font-bold text-white mb-2'>
              No Custom Bots Yet
            </h3>
            <p className='text-gray-400 mb-4'>
              Create your first custom trading bot to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg'>
              Create Your First Bot
            </button>
          </div>
        ) : (
          customBots.map((bot) => (
            <div key={bot.id} className='bg-[#232a4d] p-6 rounded-lg'>
              <div className='flex justify-between items-start mb-4'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='text-xl font-bold text-white'>{bot.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bot.status === 'running'
                          ? 'bg-green-900 text-green-200'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                      {bot.status}
                    </span>
                  </div>
                  <p className='text-gray-400 mb-3'>{bot.description}</p>
                  <div className='flex flex-wrap gap-2 mb-3'>
                    <span className='text-sm text-gray-500'>Instruments:</span>
                    {bot.instruments.map((instrument) => (
                      <span
                        key={instrument}
                        className='bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs'>
                        {instrument.replace('_', '/')}
                      </span>
                    ))}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => handleToggleBot(bot.id)}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      bot.status === 'running'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}>
                    {bot.status === 'running' ? 'Stop' : 'Start'}
                  </button>
                  <button
                    onClick={() => handleEditBot(bot)}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm'>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBot(bot.id)}
                    className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm'>
                    Delete
                  </button>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className='grid grid-cols-4 gap-4 pt-4 border-t border-gray-700'>
                <div className='text-center'>
                  <div className='text-lg font-bold text-white'>
                    {bot.performance.totalTrades}
                  </div>
                  <div className='text-sm text-gray-400'>Total Trades</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-white'>
                    {bot.performance.winRate.toFixed(1)}%
                  </div>
                  <div className='text-sm text-gray-400'>Win Rate</div>
                </div>
                <div className='text-center'>
                  <div
                    className={`text-lg font-bold ${
                      bot.performance.totalPnL >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                    {bot.performance.totalPnL >= 0 ? '+' : ''}
                    {bot.performance.totalPnL.toFixed(2)}%
                  </div>
                  <div className='text-sm text-gray-400'>Total P&L</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-white'>
                    {bot.performance.lastRun
                      ? new Date(bot.performance.lastRun).toLocaleDateString()
                      : 'Never'}
                  </div>
                  <div className='text-sm text-gray-400'>Last Run</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Bot Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-[#232a4d] p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold text-white'>
                {editingBot ? 'Edit Bot' : 'Create New Bot'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingBot(null);
                  setNewBot({
                    name: '',
                    description: '',
                    code: '',
                    enabled: false,
                    instruments: [],
                    riskLevel: 'medium',
                  });
                }}
                className='text-gray-400 hover:text-gray-300'>
                ✕
              </button>
            </div>

            <div className='space-y-4'>
              {/* Bot Name */}
              <div>
                <label className='block text-white mb-2'>Bot Name</label>
                <input
                  type='text'
                  value={newBot.name}
                  onChange={(e) =>
                    setNewBot({ ...newBot, name: e.target.value })
                  }
                  className='w-full bg-gray-700 text-white p-2 rounded'
                  placeholder='Enter bot name'
                />
              </div>

              {/* Description */}
              <div>
                <label className='block text-white mb-2'>Description</label>
                <textarea
                  value={newBot.description}
                  onChange={(e) =>
                    setNewBot({ ...newBot, description: e.target.value })
                  }
                  className='w-full bg-gray-700 text-white p-2 rounded h-20'
                  placeholder='Describe your bot strategy'
                />
              </div>

              {/* Instruments */}
              <div>
                <label className='block text-white mb-2'>
                  Trading Instruments
                </label>
                <div className='grid grid-cols-5 gap-2'>
                  {availableInstruments.map((instrument) => (
                    <label
                      key={instrument}
                      className='flex items-center gap-2 text-white'>
                      <input
                        type='checkbox'
                        checked={newBot.instruments.includes(instrument)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewBot({
                              ...newBot,
                              instruments: [...newBot.instruments, instrument],
                            });
                          } else {
                            setNewBot({
                              ...newBot,
                              instruments: newBot.instruments.filter(
                                (i) => i !== instrument
                              ),
                            });
                          }
                        }}
                        className='rounded'
                      />
                      <span className='text-sm'>
                        {instrument.replace('_', '/')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <label className='block text-white mb-2'>Risk Level</label>
                <select
                  value={newBot.riskLevel}
                  onChange={(e) =>
                    setNewBot({ ...newBot, riskLevel: e.target.value })
                  }
                  className='w-full bg-gray-700 text-white p-2 rounded'>
                  <option value='low'>Low (0.5% per trade)</option>
                  <option value='medium'>Medium (1% per trade)</option>
                  <option value='high'>High (2% per trade)</option>
                </select>
              </div>

              {/* Code Editor */}
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <label className='block text-white'>Bot Code</label>
                  <div className='flex items-center gap-2'>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className='bg-gray-700 text-white px-2 py-1 rounded text-sm'>
                      <option value='javascript'>JavaScript Template</option>
                      <option value='python'>Python Template</option>
                      <option value='advanced_python'>
                        Advanced Python + ML
                      </option>
                    </select>
                    <button
                      onClick={() =>
                        setNewBot({
                          ...newBot,
                          code: botTemplates[selectedTemplate],
                        })
                      }
                      className='bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm'>
                      Load Template
                    </button>
                  </div>
                </div>
                <textarea
                  value={newBot.code}
                  onChange={(e) =>
                    setNewBot({ ...newBot, code: e.target.value })
                  }
                  className='w-full bg-gray-800 text-white p-4 rounded font-mono text-sm h-80'
                  placeholder='Enter your bot code here...'
                />
                <div className='text-xs text-gray-400 mt-2'>
                  💡 <strong>Templates Available:</strong>
                  <br />• <strong>JavaScript:</strong> Simple moving average
                  crossover strategy
                  <br />• <strong>Python:</strong> Multi-indicator bot with RSI,
                  MACD, Bollinger Bands
                  <br />• <strong>Advanced Python + ML:</strong> Machine
                  learning with Random Forest classifier
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-4 pt-4'>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingBot(null);
                    setNewBot({
                      name: '',
                      description: '',
                      code: '',
                      enabled: false,
                      instruments: [],
                      riskLevel: 'medium',
                    });
                  }}
                  className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded'>
                  Cancel
                </button>
                <button
                  onClick={editingBot ? handleUpdateBot : handleCreateBot}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded'>
                  {editingBot ? 'Update Bot' : 'Create Bot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingBots;
