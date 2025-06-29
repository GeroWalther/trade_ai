import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import CustomBotService from '../services/custom_bot_service';

const TradingBots = () => {
  const [customBots, setCustomBots] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newBot, setNewBot] = useState({
    name: '',
    description: '',
    code: '',
    enabled: false,
    instruments: [],
    riskLevel: 'medium',
    executionInterval: 5, // minutes
    trailingStopType: 'none', // 'none', 'fixed_pips'
    trailingStopPips: 20, // pip distance when using fixed_pips
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

  // Load custom bots from API
  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      setLoading(true);
      const bots = await CustomBotService.getAllBots();
      setCustomBots(bots);
    } catch (error) {
      console.error('Error loading bots:', error);
      toast.error('Failed to load bots');
    } finally {
      setLoading(false);
    }
  };

  // Create new bot
  const handleCreateBot = async () => {
    if (!newBot.name || !newBot.code) {
      toast.error('Bot name and code are required');
      return;
    }

    try {
      setLoading(true);
      const bot = {
        ...newBot,
        status: 'stopped',
      };

      await CustomBotService.createBot(bot);
      await loadBots(); // Refresh the list
      setShowCreateModal(false);
      resetNewBot();
      toast.success('Custom bot created successfully!');
    } catch (error) {
      console.error('Error creating bot:', error);
      toast.error('Failed to create bot');
    } finally {
      setLoading(false);
    }
  };

  // Delete bot
  const handleDeleteBot = async (botId) => {
    if (window.confirm('Are you sure you want to delete this bot?')) {
      try {
        setLoading(true);
        await CustomBotService.deleteBot(botId);
        await loadBots(); // Refresh the list
        toast.success('Bot deleted successfully');
      } catch (error) {
        console.error('Error deleting bot:', error);
        toast.error('Failed to delete bot');
      } finally {
        setLoading(false);
      }
    }
  };

  // Toggle bot status
  const handleToggleBot = async (botId) => {
    const bot = customBots.find((b) => b.id === botId);
    if (!bot) return;

    try {
      setLoading(true);
      if (bot.status === 'running') {
        await CustomBotService.stopBot(botId);
        toast.info(`Bot "${bot.name}" stopped`);
      } else {
        await CustomBotService.startBot(botId);
        toast.success(`Bot "${bot.name}" started`);
      }
      await loadBots(); // Refresh the list
    } catch (error) {
      console.error('Error toggling bot:', error);
      toast.error(
        `Failed to ${bot.status === 'running' ? 'stop' : 'start'} bot`
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit bot
  const handleEditBot = (bot) => {
    setEditingBot(bot);
    setNewBot(bot);
    setShowCreateModal(true);
  };

  // Update existing bot
  const handleUpdateBot = async () => {
    if (!newBot.name || !newBot.code) {
      toast.error('Bot name and code are required');
      return;
    }

    try {
      setLoading(true);
      await CustomBotService.updateBot(editingBot.id, newBot);
      await loadBots(); // Refresh the list
      setShowCreateModal(false);
      setEditingBot(null);
      resetNewBot();
      toast.success('Bot updated successfully!');
    } catch (error) {
      console.error('Error updating bot:', error);
      toast.error('Failed to update bot');
    } finally {
      setLoading(false);
    }
  };

  const resetNewBot = () => {
    setNewBot({
      name: '',
      description: '',
      code: '',
      enabled: false,
      instruments: [],
      riskLevel: 'medium',
      executionInterval: 5,
      trailingStopType: 'none',
      trailingStopPips: 20,
    });
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

    custom_strategies: `# Fully Custom Trading Strategy Examples
# These show advanced patterns you can implement

import pandas as pd
import numpy as np
import talib
from datetime import datetime, timedelta
import requests
import json

class FullyCustomTradingBot:
    def __init__(self, config):
        self.name = config['name']
        self.instruments = config['instruments']
        self.risk_level = config['risk_level']
        self.account_balance = 10000  # Will be fetched from API
        self.risk_per_trade = {'low': 0.005, 'medium': 0.01, 'high': 0.02}[config['risk_level']]
        self.positions = {}
        self.correlation_matrix = None
        
    # ========== RISK-BASED POSITION SIZING ==========
    def calculate_position_size_with_risk(self, entry_price, stop_loss, symbol):
        """Calculate position size based on exact risk amount"""
        risk_amount = self.account_balance * self.risk_per_trade
        price_risk_per_unit = abs(entry_price - stop_loss)
        
        if price_risk_per_unit == 0:
            return 0
            
        # Position size = Risk Amount / Risk per Unit
        position_size = risk_amount / price_risk_per_unit
        
        # Adjust for different instruments
        if 'XAU' in symbol:  # Gold
            position_size = min(position_size, 10)  # Max 10 oz
        elif 'BTC' in symbol:  # Bitcoin
            position_size = min(position_size, 1)   # Max 1 BTC
        else:  # Forex
            position_size = min(position_size, 100000)  # Max 100k units
            
        return position_size
    
    def calculate_trailing_stop(self, entry_price, current_price, direction, trail_percent):
        """Calculate trailing stop based on risk percentage"""
        initial_risk = self.account_balance * self.risk_per_trade
        trail_risk = initial_risk * (trail_percent / 100)
        
        if direction == 'BUY':
            # Trail stop up as price increases
            trail_distance = trail_risk / self.calculate_position_size_with_risk(entry_price, entry_price - trail_risk, 'EUR_USD')
            return current_price - trail_distance
        else:  # SELL
            # Trail stop down as price decreases  
            trail_distance = trail_risk / self.calculate_position_size_with_risk(entry_price, entry_price + trail_risk, 'EUR_USD')
            return current_price + trail_distance
    
    # ========== MULTI-TIMEFRAME ANALYSIS ==========
    def analyze_multiple_timeframes(self, symbol, data_5m, data_1h, data_4h, data_1d):
        """Analyze across multiple timeframes for stronger signals"""
        signals = {}
        
        # Daily trend (primary direction)
        daily_trend = self.get_trend_direction(data_1d)
        signals['daily_trend'] = daily_trend
        signals['daily_strength'] = self.calculate_trend_strength(data_1d)
        
        # 4H momentum
        h4_momentum = self.get_momentum_signals(data_4h)
        signals['h4_momentum'] = h4_momentum
        
        # 1H entry setup
        h1_setup = self.get_entry_setup(data_1h)
        signals['h1_setup'] = h1_setup
        
        # 5M timing
        timing = self.get_precise_timing(data_5m)
        signals['timing'] = timing
        
        # Combine all timeframes
        final_signal = self.combine_timeframe_signals(signals)
        return final_signal
    
    def get_trend_direction(self, df):
        """Determine primary trend direction"""
        df = self.add_trend_indicators(df)
        latest = df.iloc[-1]
        
        # Multiple trend confirmations
        ema_trend = 'UP' if latest['EMA_21'] > latest['EMA_50'] > latest['EMA_200'] else 'DOWN'
        adx_trend = 'STRONG' if latest['ADX'] > 25 else 'WEAK'
        price_trend = 'UP' if latest['close'] > latest['EMA_21'] else 'DOWN'
        
        return {
            'direction': ema_trend if ema_trend == price_trend else 'SIDEWAYS',
            'strength': adx_trend,
            'confidence': latest['ADX'] / 100
        }
    
    # ========== CORRELATION & PORTFOLIO MANAGEMENT ==========
    def analyze_instrument_correlations(self, market_data):
        """Avoid correlated positions to reduce portfolio risk"""
        correlations = {}
        
        # Calculate correlation matrix
        price_data = {}
        for symbol, data in market_data.items():
            if len(data) > 50:
                price_data[symbol] = [candle['close'] for candle in data[-50:]]
        
        correlation_matrix = pd.DataFrame(price_data).corr()
        
        # Check existing positions
        for symbol in self.instruments:
            if symbol in self.positions:
                correlated_symbols = correlation_matrix[symbol][correlation_matrix[symbol].abs() > 0.7].index
                correlations[symbol] = list(correlated_symbols)
        
        return correlations
    
    def portfolio_risk_check(self, new_symbol, new_direction):
        """Check if new trade would exceed portfolio risk limits"""
        current_risk = sum([pos['risk_amount'] for pos in self.positions.values()])
        max_portfolio_risk = self.account_balance * 0.06  # 6% max portfolio risk
        
        proposed_risk = self.account_balance * self.risk_per_trade
        
        if current_risk + proposed_risk > max_portfolio_risk:
            return False, "Portfolio risk limit exceeded"
        
        # Check correlation risk
        correlations = self.analyze_instrument_correlations({})
        for existing_symbol, position in self.positions.items():
            if existing_symbol in correlations and new_symbol in correlations[existing_symbol]:
                if position['direction'] == new_direction:
                    return False, f"Correlated position exists: {existing_symbol}"
        
        return True, "Risk check passed"
    
    # ========== ECONOMIC CALENDAR & NEWS ==========
    def check_economic_events(self, symbol):
        """Check for high-impact news events"""
        # This would integrate with economic calendar API
        high_impact_events = [
            'NFP', 'FOMC', 'CPI', 'GDP', 'Central Bank Decisions'
        ]
        
        # Example: Check if major news in next 2 hours
        upcoming_events = self.get_upcoming_news(symbol)
        
        for event in upcoming_events:
            if event['impact'] == 'HIGH' and event['time_until'] < 120:  # 2 hours
                return {
                    'avoid_trading': True,
                    'reason': f"High-impact {event['name']} in {event['time_until']} minutes"
                }
        
        return {'avoid_trading': False}
    
    # ========== VOLATILITY-BASED STRATEGIES ==========
    def volatility_breakout_strategy(self, df, symbol):
        """Trade volatility breakouts with dynamic stops"""
        df['ATR'] = talib.ATR(df['high'], df['low'], df['close'], timeperiod=14)
        df['volatility_percentile'] = df['ATR'].rolling(100).rank(pct=True)
        
        latest = df.iloc[-1]
        
        # Only trade during high volatility periods
        if latest['volatility_percentile'] < 0.8:
            return {'action': 'HOLD', 'reason': 'Low volatility period'}
        
        # Breakout detection
        high_20 = df['high'].rolling(20).max().iloc[-2]  # Previous 20-period high
        low_20 = df['low'].rolling(20).min().iloc[-2]    # Previous 20-period low
        
        current_price = latest['close']
        atr = latest['ATR']
        
        if current_price > high_20:
            # Bullish breakout
            entry_price = current_price
            stop_loss = entry_price - (2 * atr)
            take_profit = entry_price + (3 * atr)  # 1.5:1 RR
            
            position_size = self.calculate_position_size_with_risk(entry_price, stop_loss, symbol)
            
            return {
                'action': 'BUY',
                'entry_price': entry_price,
                'stop_loss': stop_loss,
                'take_profit': take_profit,
                'position_size': position_size,
                'reason': f'Volatility breakout above 20-period high. ATR: {atr:.5f}'
            }
        
        elif current_price < low_20:
            # Bearish breakout
            entry_price = current_price
            stop_loss = entry_price + (2 * atr)
            take_profit = entry_price - (3 * atr)
            
            position_size = self.calculate_position_size_with_risk(entry_price, stop_loss, symbol)
            
            return {
                'action': 'SELL',
                'entry_price': entry_price,
                'stop_loss': stop_loss,
                'take_profit': take_profit,
                'position_size': position_size,
                'reason': f'Volatility breakout below 20-period low. ATR: {atr:.5f}'
            }
        
        return {'action': 'HOLD', 'reason': 'No breakout detected'}
    
    # ========== MEAN REVERSION STRATEGIES ==========
    def mean_reversion_strategy(self, df, symbol):
        """Trade mean reversion with statistical measures"""
        # Z-score based mean reversion
        df['price_zscore'] = (df['close'] - df['close'].rolling(50).mean()) / df['close'].rolling(50).std()
        df['rsi'] = talib.RSI(df['close'], timeperiod=14)
        
        latest = df.iloc[-1]
        zscore = latest['price_zscore']
        rsi = latest['rsi']
        
        # Extreme oversold conditions
        if zscore < -2 and rsi < 20:
            entry_price = latest['close']
            stop_loss = entry_price * 0.98  # 2% stop
            take_profit = df['close'].rolling(50).mean().iloc[-1]  # Mean target
            
            position_size = self.calculate_position_size_with_risk(entry_price, stop_loss, symbol)
            
            return {
                'action': 'BUY',
                'entry_price': entry_price,
                'stop_loss': stop_loss,
                'take_profit': take_profit,
                'position_size': position_size,
                'reason': f'Mean reversion: Z-score {zscore:.2f}, RSI {rsi:.1f}'
            }
        
        # Extreme overbought conditions
        elif zscore > 2 and rsi > 80:
            entry_price = latest['close']
            stop_loss = entry_price * 1.02  # 2% stop
            take_profit = df['close'].rolling(50).mean().iloc[-1]  # Mean target
            
            position_size = self.calculate_position_size_with_risk(entry_price, stop_loss, symbol)
            
            return {
                'action': 'SELL',
                'entry_price': entry_price,
                'stop_loss': stop_loss,
                'take_profit': take_profit,
                'position_size': position_size,
                'reason': f'Mean reversion: Z-score {zscore:.2f}, RSI {rsi:.1f}'
            }
        
        return {'action': 'HOLD', 'reason': 'No extreme conditions detected'}
    
    # ========== POSITION MANAGEMENT API (EXPOSED TO USER) ==========
    def __init__(self, config):
        # ... existing init code ...
        self.trading_api = None  # Will be injected by trading system
        
    def close_position(self, symbol, reason="Manual close"):
        """
        Manually close a position for specific symbol
        This method is EXPOSED to users for direct position control
        """
        if symbol in self.positions:
            position = self.positions[symbol]
            try:
                # Call actual trading API to close position
                result = self.trading_api.close_position(
                    position_id=position['position_id'],
                    symbol=symbol,
                    size=position['position_size']
                )
                
                if result.get('success'):
                    del self.positions[symbol]
                    print(f"✅ Closed {symbol} position: {reason}")
                    return True
                else:
                    print(f"❌ Failed to close {symbol}: {result.get('error')}")
                    return False
                    
            except Exception as e:
                print(f"❌ Error closing {symbol}: {str(e)}")
                return False
        else:
            print(f"⚠️ No open position for {symbol}")
            return False
    
    def close_all_positions(self, reason="Close all"):
        """
        Close ALL open positions - EXPOSED to users
        """
        closed_count = 0
        for symbol in list(self.positions.keys()):
            if self.close_position(symbol, reason):
                closed_count += 1
        
        print(f"✅ Closed {closed_count} positions: {reason}")
        return closed_count
    
    def reduce_position_size(self, symbol, percentage, reason="Partial close"):
        """
        Reduce position size by percentage - EXPOSED to users
        """
        if symbol in self.positions:
            position = self.positions[symbol]
            original_size = position['position_size']
            reduce_size = original_size * (percentage / 100)
            
            try:
                result = self.trading_api.close_partial_position(
                    position_id=position['position_id'],
                    symbol=symbol,
                    size=reduce_size
                )
                
                if result.get('success'):
                    position['position_size'] -= reduce_size
                    print(f"✅ Reduced {symbol} by {percentage}%: {reason}")
                    return True
                    
            except Exception as e:
                print(f"❌ Error reducing {symbol}: {str(e)}")
                return False
        
        return False
    
    def get_position_pnl(self, symbol):
        """
        Get current P&L for position - EXPOSED to users
        """
        if symbol in self.positions:
            position = self.positions[symbol]
            current_price = self.get_current_price(symbol)
            
            if position['direction'] == 'BUY':
                pnl = (current_price - position['entry_price']) * position['position_size']
            else:
                pnl = (position['entry_price'] - current_price) * position['position_size']
                
            return {
                'unrealized_pnl': pnl,
                'pnl_percent': (pnl / (position['entry_price'] * position['position_size'])) * 100,
                'entry_price': position['entry_price'],
                'current_price': current_price
            }
        
        return None

    # ========== CUSTOM EXIT LOGIC EXAMPLES ==========
    def check_exit_conditions(self, symbol, position, current_data):
        """
        AUTOMATIC exit logic - called by trading system every interval
        Return True to close position, False to keep it open
        """
        # Your custom exit conditions here
        if some_condition:
            return True, "Reason for exit"
        return False, "Hold position"
    
    def manual_exit_examples(self, market_data):
        """
        Examples of MANUAL position management that users can call anytime
        These methods can be called from anywhere in your strategy
        """
        
        # Example 1: Close specific position based on news
        if self.is_high_impact_news_coming('EUR_USD'):
            self.close_position('EUR_USD', "News event coming")
        
        # Example 2: Reduce position size if correlation risk too high
        eur_usd_pnl = self.get_position_pnl('EUR_USD')
        gbp_usd_pnl = self.get_position_pnl('GBP_USD')
        
        if eur_usd_pnl and gbp_usd_pnl:
            # Both positions losing money simultaneously (correlation risk)
            if eur_usd_pnl['pnl_percent'] < -0.5 and gbp_usd_pnl['pnl_percent'] < -0.5:
                self.reduce_position_size('EUR_USD', 50, "Correlation risk reduction")
                self.reduce_position_size('GBP_USD', 50, "Correlation risk reduction")
        
        # Example 3: Portfolio-level exit
        total_portfolio_pnl = sum([
            self.get_position_pnl(symbol)['unrealized_pnl'] 
            for symbol in self.positions.keys()
            if self.get_position_pnl(symbol)
        ])
        
        if total_portfolio_pnl < -0.05 * self.account_balance:  # -5% portfolio loss
            self.close_all_positions("Portfolio drawdown protection")
        
        # Example 4: Time-based position management
        current_hour = datetime.now().hour
        if current_hour == 22:  # 10 PM - end of trading day
            # Close all EUR/USD positions before overnight
            if 'EUR_USD' in self.positions:
                self.close_position('EUR_USD', "End of trading day")
        
        # Example 5: Partial profit taking
        for symbol in self.positions.keys():
            pnl_info = self.get_position_pnl(symbol)
            if pnl_info and pnl_info['pnl_percent'] > 2.0:  # 2% profit
                # Take 50% profit, let rest run
                self.reduce_position_size(symbol, 50, "Take partial profit")
    
    def manage_portfolio_exits(self, positions, market_data):
        """
        Portfolio-level exit management
        Can close positions based on overall portfolio metrics
        """
        total_exposure = sum([pos['position_size'] for pos in positions.values()])
        total_pnl = sum([pos['unrealized_pnl'] for pos in positions.values()])
        
        # Portfolio-level stops
        if total_pnl < -0.05 * self.account_balance:  # 5% portfolio drawdown
            return "CLOSE_ALL", "Portfolio drawdown limit reached"
        
        # Correlation-based exits
        if len(positions) > 1:
            correlations = self.analyze_instrument_correlations(market_data)
            correlated_risk = 0
            for symbol, pos in positions.items():
                if symbol in correlations:
                    correlated_risk += pos['risk_amount']
            
            if correlated_risk > 0.03 * self.account_balance:  # 3% correlated risk limit
                return "REDUCE_CORRELATED", "Too much correlated exposure"
        
        return "HOLD", "Portfolio OK"

    # ========== MAIN ANALYSIS FUNCTION ==========
    def run_live_analysis(self, market_data):
        """
        Main entry point - called by trading system every interval
        This is where AUTOMATIC logic runs, but users can also call manual methods
        """
        results = {}
        
        # STEP 1: Handle manual/custom position management first
        # Users can implement any custom logic here
        self.manual_exit_examples(market_data)  # Example of manual position management
        
        # STEP 2: Check automatic exit conditions for existing positions
        for symbol in list(self.positions.keys()):  # Use list() to avoid dict size change during iteration
            if symbol in market_data:
                # Call user's AUTOMATIC exit logic
                should_exit, exit_reason = self.check_exit_conditions(
                    symbol, self.positions[symbol], market_data[symbol][-1]
                )
                
                if should_exit:
                    # Trading system will execute the close
                    results[symbol] = {
                        'action': 'CLOSE_POSITION', 
                        'reason': exit_reason,
                        'position_id': self.positions[symbol]['position_id']
                    }
                    continue  # Don't look for new entries while closing
        
        # STEP 3: Look for new entry opportunities
        for symbol in self.instruments:
            if symbol not in market_data:
                continue
                
            # Skip if we already have a position or closing signal
            if symbol in self.positions or symbol in results:
                continue
                
            df = pd.DataFrame(market_data[symbol])
            
            # Portfolio risk check
            risk_check, risk_msg = self.portfolio_risk_check(symbol, 'BUY')
            if not risk_check:
                results[symbol] = {'action': 'HOLD', 'reason': risk_msg}
                continue
            
            # Economic calendar check
            news_check = self.check_economic_events(symbol)
            if news_check['avoid_trading']:
                results[symbol] = {'action': 'HOLD', 'reason': news_check['reason']}
                continue
            
            # Choose strategy based on market conditions
            volatility = talib.ATR(df['high'], df['low'], df['close']).iloc[-1]
            volatility_rank = df['close'].rolling(100).std().rank(pct=True).iloc[-1]
            
            if volatility_rank > 0.7:
                # High volatility - use breakout strategy
                signal = self.volatility_breakout_strategy(df, symbol)
            else:
                # Low volatility - use mean reversion
                signal = self.mean_reversion_strategy(df, symbol)
            
            results[symbol] = signal
        
        return results
    
    # ========== TRADING SYSTEM INTEGRATION ==========
    def on_position_opened(self, symbol, position_info):
        """
        Called by trading system when position is successfully opened
        Users can override this for custom position tracking
        """
        self.positions[symbol] = {
            'position_id': position_info['position_id'],
            'symbol': symbol,
            'direction': position_info['direction'],
            'entry_price': position_info['entry_price'],
            'position_size': position_info['position_size'],
            'entry_time': datetime.now(),
            'trailing_stop': None,
            'risk_amount': position_info['risk_amount']
        }
        
        print(f"📈 Position opened: {symbol} {position_info['direction']} {position_info['position_size']} @ {position_info['entry_price']}")
    
    def on_position_closed(self, symbol, close_info):
        """
        Called by trading system when position is closed
        Users can override this for custom logging/analysis
        """
        if symbol in self.positions:
            position = self.positions[symbol]
            pnl = close_info.get('realized_pnl', 0)
            
            print(f"📉 Position closed: {symbol} P&L: {pnl:.2f} ({close_info.get('reason', 'Unknown')})")
            
            # Remove from tracking
            del self.positions[symbol]
    
    def on_error(self, error_info):
        """
        Called by trading system on errors
        Users can override this for custom error handling
        """
        print(f"❌ Trading Error: {error_info.get('message', 'Unknown error')}")
        
        # Example: Close all positions on critical errors
        if error_info.get('severity') == 'CRITICAL':
            self.close_all_positions("Critical error - emergency exit")

# Example Bot Configuration:
# This bot combines:
# - Risk-based position sizing
# - Multi-timeframe analysis  
# - Portfolio correlation management
# - Economic calendar integration
# - Volatility-adaptive strategies
# - Mean reversion and breakout detection

# ========== COMPLETE BOT LIFECYCLE EXPLAINED ==========
#
# 🤖 BOT OPERATION FLOW:
#
# 1. SIGNAL DETECTION PHASE:
#    - Bot runs every X minutes (1min, 5min, 15min, 30min, 1hr - set in UI)
#    - Calls run_live_analysis() to evaluate market conditions
#    - Looks for entry signals based on your custom strategy
#    - Will WAIT until all conditions are met before entering
#
# 2. POSITION ENTRY PHASE:
#    - When signal found: Bot sends entry order to trading system
#    - Trading system executes trade via OANDA API
#    - on_position_opened() called with position details
#    - Position tracking begins in self.positions dictionary
#    - Bot will NOT look for new entries on same instrument while position open
#
# 3. POSITION MONITORING PHASE (Runs every X minutes while position open):
#    - check_exit_conditions() called automatically for each open position
#    - IF Fixed Pip Trailing Stop: System manages automatically
#    - IF Custom Exit Logic: Your exit rules evaluated
#    - Can call manual exit methods anytime: self.close_position(), etc.
#    - Trailing stops updated if price moves favorably
#
# 4. POSITION EXIT PHASE:
#    - When exit condition met: Trading system closes position
#    - on_position_closed() called with P&L and exit reason
#    - Position removed from tracking
#    - Bot returns to Signal Detection Phase for that instrument
#
# 5. ERROR HANDLING:
#    - on_error() called for any trading system errors
#    - Can implement custom error responses (close all, retry, etc.)
#
# 6. MANUAL CONTROL:
#    - All positions visible in Overview tab
#    - Can manually close positions from UI anytime
#    - Manual close triggers on_position_closed() callback
#
# 7. BOT STATUS BEHAVIOR:
#    - RUNNING: Actively looks for signals and manages positions
#    - STOPPED: No new signals, but existing positions remain open
#    - Existing positions can be manually monitored/closed when bot stopped
#
# ========== TRAILING STOP OPTIONS ==========
#
# Option 1: FIXED PIP TRAILING STOP (Set in UI)
# - Simple trailing stop at fixed pip distance
# - Position size calculated: risk_amount / (pip_distance * pip_value)  
# - Automatically managed by trading system
# - Example: 20 pip trailing stop on EUR/USD
#   * $10,000 account, 1% risk = $100 risk amount
#   * Position size = $100 / (20 pips × $1/pip) = 5 mini lots
#
# Option 2: CUSTOM EXIT LOGIC (Set trailing stop to "None")
# - Implement check_exit_conditions() method for automatic exits
# - Use manual methods for programmatic control:
#   * self.close_position(symbol, reason)
#   * self.close_all_positions(reason)  
#   * self.reduce_position_size(symbol, percentage, reason)
# - Full control over exit timing and conditions
#
# ========== EXPOSED METHODS FOR USER CONTROL ==========
#
# AUTOMATIC EXIT (called by system every interval):
# def check_exit_conditions(self, symbol, position, current_data):
#     return True, "exit reason"  # Close position
#     return False, "hold reason" # Keep position
#
# MANUAL CONTROL (call anytime from your code):
# self.close_position('EUR_USD', "News event")
# self.close_all_positions("Market crash")
# self.reduce_position_size('GBP_USD', 50, "Take profit")
# pnl_info = self.get_position_pnl('EUR_USD')
#
# LIFECYCLE CALLBACKS (system calls these):
# def on_position_opened(self, symbol, position_info):  # Position entered
# def on_position_closed(self, symbol, close_info):     # Position exited  
# def on_error(self, error_info):                       # Error occurred
#
# ========== EXAMPLE USAGE ==========
#
# bot = FullyCustomTradingBot({
#     'name': 'Advanced Multi-Strategy Bot',
#     'instruments': ['EUR_USD', 'GBP_USD', 'XAU_USD'],
#     'risk_level': 'medium'  # 1% risk per trade
# })
#
# The bot will:
# 1. Run every 5 minutes (or whatever interval you set)
# 2. Look for entry signals on EUR/USD, GBP/USD, XAU/USD
# 3. Enter positions when conditions met
# 4. Monitor positions with your custom exit logic
# 5. Show all positions in Overview tab
# 6. Continue until manually stopped`,
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
        {loading ? (
          <div className='bg-[#232a4d] p-8 rounded-lg text-center'>
            <div className='text-6xl mb-4'>⏳</div>
            <h3 className='text-xl font-bold text-white mb-2'>
              Loading Bots...
            </h3>
            <p className='text-gray-400'>Fetching your custom trading bots</p>
          </div>
        ) : customBots.length === 0 ? (
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
                    disabled={loading}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      bot.status === 'running'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {loading
                      ? '...'
                      : bot.status === 'running'
                      ? 'Stop'
                      : 'Start'}
                  </button>
                  <button
                    onClick={() => handleEditBot(bot)}
                    disabled={loading}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBot(bot.id)}
                    disabled={loading}
                    className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                    {loading ? '...' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className='grid grid-cols-4 gap-4 pt-4 border-t border-gray-700'>
                <div className='text-center'>
                  <div className='text-lg font-bold text-white'>
                    {bot.performance?.totalTrades ?? bot.total_trades ?? 0}
                  </div>
                  <div className='text-sm text-gray-400'>Total Trades</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-white'>
                    {(bot.performance?.winRate ?? bot.win_rate ?? 0).toFixed(1)}
                    %
                  </div>
                  <div className='text-sm text-gray-400'>Win Rate</div>
                </div>
                <div className='text-center'>
                  <div
                    className={`text-lg font-bold ${
                      (bot.performance?.totalPnL ?? bot.total_pnl ?? 0) >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                    {(bot.performance?.totalPnL ?? bot.total_pnl ?? 0) >= 0
                      ? '+'
                      : ''}
                    {(bot.performance?.totalPnL ?? bot.total_pnl ?? 0).toFixed(
                      2
                    )}
                    %
                  </div>
                  <div className='text-sm text-gray-400'>Total P&L</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-white'>
                    {bot.performance?.lastRun ?? bot.last_run
                      ? new Date(
                          bot.performance?.lastRun ?? bot.last_run
                        ).toLocaleDateString()
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
                  resetNewBot();
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

              {/* Execution Settings */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-white mb-2'>
                    Check Interval (minutes)
                  </label>
                  <select
                    value={newBot.executionInterval}
                    onChange={(e) =>
                      setNewBot({
                        ...newBot,
                        executionInterval: parseInt(e.target.value),
                      })
                    }
                    className='w-full bg-gray-700 text-white p-2 rounded'>
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
                <div>
                  <label className='block text-white mb-2'>
                    Trailing Stop Type
                  </label>
                  <select
                    value={newBot.trailingStopType}
                    onChange={(e) =>
                      setNewBot({
                        ...newBot,
                        trailingStopType: e.target.value,
                      })
                    }
                    className='w-full bg-gray-700 text-white p-2 rounded'>
                    <option value='none'>
                      None (Custom Exit Logic or Close Manually)
                    </option>
                    <option value='fixed_pips'>Fixed Pip Distance</option>
                  </select>
                  <p className='text-xs text-gray-400 mt-1'>
                    {newBot.trailingStopType === 'none'
                      ? 'Implement custom exit logic in your code'
                      : 'Automatic trailing stop at fixed pip distance'}
                  </p>
                </div>
              </div>

              {/* Pip Distance for Fixed Trailing Stop */}
              {newBot.trailingStopType === 'fixed_pips' && (
                <div>
                  <label className='block text-white mb-2'>
                    Trailing Stop Distance (pips)
                  </label>
                  <input
                    type='number'
                    value={newBot.trailingStopPips}
                    onChange={(e) =>
                      setNewBot({
                        ...newBot,
                        trailingStopPips: parseInt(e.target.value),
                      })
                    }
                    className='w-full bg-gray-700 text-white p-2 rounded'
                    min='5'
                    max='200'
                    step='5'
                  />
                  <p className='text-xs text-gray-400 mt-1'>
                    Position size will be calculated based on risk% and pip
                    distance
                  </p>
                </div>
              )}

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
                      <option value='custom_strategies'>
                        Fully Custom Examples
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
                  <br />• <strong>Fully Custom Examples:</strong> Complete bot
                  lifecycle with position management, custom exit logic, manual
                  controls, and detailed usage explanation
                  <br />
                  <br />
                  🔄 <strong>Bot Lifecycle:</strong> Signal detection → Position
                  entry (on_position_opened) → Monitoring every X min → Exit
                  conditions → Manual control → Overview tab display → Continue
                  until stopped
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-4 pt-4'>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingBot(null);
                    resetNewBot();
                  }}
                  className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded'>
                  Cancel
                </button>
                <button
                  onClick={editingBot ? handleUpdateBot : handleCreateBot}
                  disabled={loading}
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                  {loading
                    ? 'Please wait...'
                    : editingBot
                    ? 'Update Bot'
                    : 'Create Bot'}
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
