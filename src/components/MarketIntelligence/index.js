import React, { useState, useEffect } from 'react';
import TradingViewChart from './TradingViewChart';
import ProgressBar from './ProgressBar';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
const { shell } = window.require('electron');

// Update the assets structure with correct TradingView symbols
const availableAssets = {
  Forex: [
    { symbol: 'EURUSD', name: 'EUR/USD', tradingViewSymbol: 'FX:EURUSD' },
    { symbol: 'GBPUSD', name: 'GBP/USD', tradingViewSymbol: 'FX:GBPUSD' },
    { symbol: 'USDJPY', name: 'USD/JPY', tradingViewSymbol: 'FX:USDJPY' },
    { symbol: 'AUDUSD', name: 'AUD/USD', tradingViewSymbol: 'FX:AUDUSD' },
  ],
  Commodities: [
    { symbol: 'XAUUSD', name: 'Gold', tradingViewSymbol: 'GOLD' },
    { symbol: 'XAGUSD', name: 'Silver', tradingViewSymbol: 'SILVER' },
    { symbol: 'WTIUSD', name: 'Crude Oil', tradingViewSymbol: 'USOIL' },
    { symbol: 'XPTUSD', name: 'Platinum', tradingViewSymbol: 'PLATINUM' },
  ],
  Crypto: [
    { symbol: 'BTCUSD', name: 'Bitcoin', tradingViewSymbol: 'BINANCE:BTCUSDT' },
    {
      symbol: 'ETHUSD',
      name: 'Ethereum',
      tradingViewSymbol: 'BINANCE:ETHUSDT',
    },
    { symbol: 'SOLUSD', name: 'Solana', tradingViewSymbol: 'BINANCE:SOLUSDT' },
    { symbol: 'ADAUSD', name: 'Cardano', tradingViewSymbol: 'BINANCE:ADAUSDT' },
  ],
  Indices: [
    { symbol: 'SPX', name: 'S&P 500', tradingViewSymbol: 'SP:SPX' },
    { symbol: 'NDX', name: 'Nasdaq 100', tradingViewSymbol: 'NASDAQ:NDX' },
    { symbol: 'DJI', name: 'Dow Jones', tradingViewSymbol: 'DJ:DJI' },
    { symbol: 'UK100', name: 'FTSE 100', tradingViewSymbol: 'OANDA:UK100GBP' },
  ],
};

// Mock data generator based on selected asset
const generateMockData = (asset, term = 'SWING') => {
  // Asset-specific configurations
  const assetConfig = {
    XAUUSD: {
      sentiment: {
        value: 65,
        label: 'NEUTRAL',
        summary: 'Mixed signals with bullish bias on higher timeframes',
      },
      confidence: {
        value: 60,
        summary: 'Multiple confirming signals with some divergence',
      },
      riskLevel: {
        value: 45,
        label: 'MEDIUM',
        summary: 'Moderate risk due to economic uncertainty',
      },
      price: 2023.45,
      keyFactors: [
        'USD strength affecting price action',
        'Global economic uncertainty providing support',
        'Technical consolidation near key levels',
      ],
    },
    BTCUSD: {
      sentiment: {
        value: 75,
        label: 'BULLISH',
        summary: 'Strong momentum with institutional support',
      },
      confidence: {
        value: 70,
        summary: 'Clear trend structure with volume confirmation',
      },
      riskLevel: {
        value: 65,
        label: 'HIGH',
        summary: 'High volatility environment',
      },
      price: 52145.0,
      keyFactors: [
        'ETF inflows supporting price',
        'Increased institutional adoption',
        'Technical breakout from key levels',
      ],
    },
    SPX: {
      sentiment: {
        value: 60,
        label: 'NEUTRAL',
        summary: 'Balanced market conditions with sector rotation',
      },
      confidence: {
        value: 65,
        summary: 'Mixed signals across different sectors',
      },
      riskLevel: {
        value: 40,
        label: 'MEDIUM',
        summary: 'Normal market volatility',
      },
      price: 5000.45,
      keyFactors: [
        'Earnings season impact',
        'Fed policy expectations',
        'Sector performance divergence',
      ],
    },
    // Default config for other assets
    default: {
      sentiment: {
        value: 50,
        label: 'NEUTRAL',
        summary: 'Balanced market conditions',
      },
      confidence: {
        value: 50,
        summary: 'Mixed signals in current market environment',
      },
      riskLevel: {
        value: 50,
        label: 'MEDIUM',
        summary: 'Standard market risk',
      },
      price: 0,
      keyFactors: [
        'Market in consolidation phase',
        'Mixed technical signals',
        'Awaiting clear directional bias',
      ],
    },
  };

  // Get the config for this asset or use default
  const config = assetConfig[asset.symbol] || assetConfig.default;

  const getEconomicIndicators = (symbol) => {
    const commonIndicators = [
      {
        name: 'US CPI (YoY)',
        current: '3.1%',
        previous: ['3.4%', '3.7%', '3.9%'],
        trend: 'DECREASING',
        nextRelease: '2024-03-12',
        impact: 'HIGH',
        forecast: '3.0%',
      },
      {
        name: 'US PPI (YoY)',
        current: '0.9%',
        previous: ['1.0%', '1.3%', '1.6%'],
        trend: 'STABLE',
        nextRelease: '2024-03-14',
        impact: 'MEDIUM',
        forecast: '0.8%',
      },
      {
        name: 'Fed Interest Rate',
        current: '5.50%',
        previous: ['5.50%', '5.50%', '5.50%'],
        trend: 'STABLE',
        nextRelease: '2024-03-20',
        impact: 'HIGH',
        forecast: '5.50%',
      },
      {
        name: 'US 10Y Treasury Yield',
        current: '4.25%',
        previous: ['4.17%', '4.32%', '4.40%'],
        trend: 'DECREASING',
        nextRelease: 'Live',
        impact: 'HIGH',
      },
    ];

    const assetSpecificIndicators = {
      XAUUSD: [
        ...commonIndicators,
        {
          name: 'US Core PCE',
          current: '2.8%',
          previous: ['2.9%', '3.2%', '3.4%'],
          trend: 'DECREASING',
          nextRelease: '2024-02-29',
          impact: 'HIGH',
          forecast: '2.7%',
        },
      ],
      EURUSD: [
        ...commonIndicators,
        {
          name: 'ECB Interest Rate',
          current: '4.50%',
          previous: ['4.50%', '4.50%', '4.00%'],
          trend: 'STABLE',
          nextRelease: '2024-03-07',
          impact: 'HIGH',
          forecast: '4.50%',
        },
        {
          name: 'EU CPI (YoY)',
          current: '2.8%',
          previous: ['2.9%', '3.1%', '3.4%'],
          trend: 'DECREASING',
          nextRelease: '2024-03-01',
          impact: 'HIGH',
          forecast: '2.7%',
        },
      ],
      // Add more asset-specific indicators
    };

    return assetSpecificIndicators[symbol] || commonIndicators;
  };

  return {
    analysis: {
      symbol: asset.symbol,
      price: asset.symbol === 'XAUUSD' ? 2023.45 : 1.0876,
      aiAnalysis: {
        sentiment: config.sentiment,
        confidence: config.confidence,
        probabilityUp:
          config.sentiment.label === 'BULLISH'
            ? 75
            : config.sentiment.label === 'BEARISH'
            ? 25
            : 50,
        riskLevel: config.riskLevel,
        keyFactors: config.keyFactors,
        technicalIndicators: {
          trend: {
            macd: { value: 'NEUTRAL', strength: 50 },
            movingAverages: {
              value: 'NEUTRAL',
              strength: 50,
              ema50: asset.symbol === 'XAUUSD' ? 2018.5 : 1.085,
              interpretation: 'Price near EMA50, watching for direction',
            },
          },
          momentum: {
            rsi: { value: 50, interpretation: 'NEUTRAL' },
          },
          volatility: {
            atr: {
              value: asset.symbol === 'XAUUSD' ? 15.5 : 0.0055,
              interpretation: 'Normal Range',
              ma: asset.symbol === 'XAUUSD' ? 14.8 : 0.0048,
            },
          },
        },
        keyLevels: {
          resistance:
            asset.symbol === 'XAUUSD'
              ? ['2025.00', '2050.00', '2080.00']
              : ['1.0920', '1.0950', '1.1000'],
          support:
            asset.symbol === 'XAUUSD'
              ? ['1975.00', '1950.00', '1920.00']
              : ['1.0800', '1.0750', '1.0700'],
          pivotPoint: asset.symbol === 'XAUUSD' ? '2000.00' : '1.0850',
        },
      },
      indicators: {
        rsi: config.sentiment.value,
        sma_20: asset.symbol === 'XAUUSD' ? 2023.76 : 1.0876,
        sma_50: asset.symbol === 'XAUUSD' ? 2018.34 : 1.0834,
      },
      signals: {
        trend: {
          primary: config.sentiment.label,
          strength: config.confidence.value > 75 ? 'STRONG' : 'MODERATE',
        },
        momentum: {
          value:
            config.sentiment.label === 'BULLISH'
              ? 0.75
              : config.sentiment.label === 'BEARISH'
              ? -0.75
              : 0,
          signal: config.sentiment.label,
        },
      },
    },
    macro: {
      indicators: getEconomicIndicators(asset.symbol),
      aiAnalysis: {
        summary: config.sentiment.summary,
        recommendedStrategy: {
          direction: config.sentiment.label,
          entry: {
            price: asset.symbol === 'XAUUSD' ? '2025.00' : '1.0850',
            type: 'LIMIT',
            rationale:
              'Key technical support level with multiple confirmations',
          },
          stopLoss: {
            price: asset.symbol === 'XAUUSD' ? '1975.00' : '1.0800',
            rationale: 'Below major support level',
          },
          takeProfit: [
            {
              price: asset.symbol === 'XAUUSD' ? '2080.00' : '1.0920',
              rationale: 'First resistance level',
            },
            {
              price: asset.symbol === 'XAUUSD' ? '2150.00' : '1.1000',
              rationale: 'Major psychological level',
            },
          ],
          timeframe: term,
          confidence: config.confidence.value,
          keyRisks: ['Market uncertainty', 'Economic data volatility'],
        },
      },
    },
    tradeIdeas: [
      {
        title: `${asset.name} - Key Level Breakout Setup`,
        author: 'TradingView Analyst',
        timestamp: '2024-02-19T15:30:00Z',
        confidence: 'HIGH',
        direction: 'BULLISH',
        link: `https://www.tradingview.com/symbols/${asset.tradingViewSymbol}/`,
        summary:
          'Multiple technical indicators showing bullish convergence. Key resistance levels ahead.',
      },
      {
        title: `${asset.name} Technical Pattern Analysis`,
        author: 'Chart Master',
        timestamp: '2024-02-19T14:00:00Z',
        confidence: 'MEDIUM',
        direction: 'NEUTRAL',
        link: `https://www.tradingview.com/symbols/${asset.tradingViewSymbol}/`,
        summary:
          'Market in consolidation phase. Watch key levels for breakout direction.',
      },
      {
        title: `${asset.name} Fibonacci Retracement Study`,
        author: 'Technical Trader',
        timestamp: '2024-02-19T13:30:00Z',
        confidence: 'HIGH',
        direction: 'BULLISH',
        link: `https://www.tradingview.com/symbols/${asset.tradingViewSymbol}/`,
        summary:
          'Price finding support at key Fibonacci levels. Potential reversal zone identified.',
      },
      {
        title: `${asset.name} Elliott Wave Analysis`,
        author: 'Wave Analyst',
        timestamp: '2024-02-19T12:45:00Z',
        confidence: 'MEDIUM',
        direction: 'BEARISH',
        link: `https://www.tradingview.com/symbols/${asset.tradingViewSymbol}/`,
        summary:
          'Completing wave 5 of the current cycle. Expect correction in coming sessions.',
      },
    ],
    news: [
      {
        title: `${asset.name} Surges on Economic Data`,
        timestamp: '2024-02-19T14:30:00Z',
        impact: 'HIGH',
        sentiment: 'BULLISH',
        source: 'Yahoo Finance',
        link: getYahooFinanceLink(asset.symbol),
        summary: 'Latest economic indicators boost market confidence...',
      },
      {
        title: `Central Bank Policy Impact on ${asset.name}`,
        timestamp: '2024-02-19T13:15:00Z',
        impact: 'HIGH',
        sentiment: 'BEARISH',
        source: 'Yahoo Finance',
        link: getYahooFinanceLink(asset.symbol),
        summary: 'Policy makers signal potential shift in monetary stance...',
      },
      {
        title: `${asset.name} Technical Levels to Watch`,
        timestamp: '2024-02-19T12:00:00Z',
        impact: 'MEDIUM',
        sentiment: 'NEUTRAL',
        source: 'Yahoo Finance',
        link: getYahooFinanceLink(asset.symbol),
        summary: 'Key support and resistance levels identified by analysts...',
      },
      {
        title: `Market Sentiment Shift for ${asset.name}`,
        timestamp: '2024-02-19T11:30:00Z',
        impact: 'MEDIUM',
        sentiment: 'BULLISH',
        source: 'Yahoo Finance',
        link: getYahooFinanceLink(asset.symbol),
        summary: 'Institutional investors increase long positions...',
      },
    ],
  };
};

// Helper function to get Yahoo Finance links
const getYahooFinanceLink = (symbol) => {
  const symbolMap = {
    EURUSD: 'EUR=X',
    GBPUSD: 'GBP=X',
    USDJPY: 'JPY=X',
    AUDUSD: 'AUD=X',
    XAUUSD: 'GC=F',
    XAGUSD: 'SI=F',
    WTIUSD: 'CL=F',
    BTCUSD: 'BTC-USD',
    ETHUSD: 'ETH-USD',
    SPX: '^GSPC',
    NDX: '^IXIC',
    DJI: '^DJI',
    UK100: '^FTSE',
  };
  return `https://finance.yahoo.com/quote/${symbolMap[symbol] || symbol}`;
};

// Add at the top with other constants
const TRADING_TERMS = {
  INTRADAY: {
    label: 'Intraday (1-8 hours)',
    focus: 'Price action and momentum',
    keyLevels: true,
    indicators: ['RSI', 'MACD', 'Volume'],
    riskManagement: 'Tight stops, quick profit taking',
  },
  SWING: {
    label: 'Swing (2-5 days)',
    focus: 'Trend and momentum shifts',
    keyLevels: true,
    indicators: ['EMA', 'RSI', 'MACD'],
    riskManagement: 'Wider stops, trailing stops',
  },
  SHORT_TERM: {
    label: 'Short Term (1-4 weeks)',
    focus: 'Short-term trend following',
    keyLevels: true,
    indicators: ['EMA', 'RSI', 'MACD'],
    riskManagement: 'Position sizing based on volatility',
  },
  MEDIUM_TERM: {
    label: 'Medium Term (1-6 months)',
    focus: 'Intermediate trend following',
    keyLevels: true,
    indicators: ['EMA', 'RSI', 'MACD'],
    riskManagement: 'Pyramiding positions',
  },
  MEDIUM_LONG_TERM: {
    label: 'Medium-Long Term (6-12 months)',
    focus: 'Major trend following',
    keyLevels: true,
    indicators: ['EMA', 'RSI', 'MACD'],
    riskManagement: 'Core and satellite positions',
  },
  LONG_TERM: {
    label: 'Long Term (1+ years)',
    focus: 'Strategic positioning',
    keyLevels: true,
    indicators: ['EMA', 'RSI', 'MACD'],
    riskManagement: 'Portfolio balancing',
  },
};

const MarketIntelligence = () => {
  const [selectedAsset, setSelectedAsset] = useState(availableAssets.Forex[0]);
  const [selectedTerm, setSelectedTerm] = useState('SWING');
  const [economicData, setEconomicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEconomicData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'http://localhost:5002/api/economic-indicators'
        );
        const data = await response.json();

        if (data.error) {
          throw new Error(data.message || 'Failed to fetch economic data');
        }

        setEconomicData(data.economic_indicators);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch economic data');
        console.error('Economic Data Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEconomicData();
    // Refresh every hour
    const interval = setInterval(fetchEconomicData, 3600000);
    return () => clearInterval(interval);
  }, []);

  const mockData = generateMockData(selectedAsset, selectedTerm);

  const renderTabContent = () => {
    return (
      <div className='p-4 space-y-4 overflow-auto h-full'>
        {renderAssetSelector()}

        {/* Chart Section - Full Width */}
        <div className='bg-gray-800 rounded-lg p-4'>
          <div className='w-full h-[600px]'>
            <TradingViewChart symbol={selectedAsset.tradingViewSymbol} />
          </div>
        </div>

        {/* AI Analysis and Strategy Recommendation */}
        <div className='bg-gray-800 rounded-lg p-4 mb-4'>
          <h3 className='text-lg font-semibold text-blue-100 mb-4 flex justify-between items-center'>
            <span>AI Analysis & Strategy</span>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-400'>Timeframe:</span>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className='bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500'>
                  {Object.entries(TRADING_TERMS).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  mockData.macro.aiAnalysis.recommendedStrategy.direction ===
                  'BULLISH'
                    ? 'bg-green-900 text-green-200'
                    : mockData.macro.aiAnalysis.recommendedStrategy
                        .direction === 'BEARISH'
                    ? 'bg-red-900 text-red-200'
                    : 'bg-yellow-900 text-yellow-200'
                }`}>
                {mockData.macro.aiAnalysis.recommendedStrategy.direction}
              </span>
            </div>
          </h3>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* AI Summary */}
            <div className='bg-gray-700 rounded-lg p-4'>
              <h4 className='text-sm font-medium text-gray-300 mb-3'>
                Analysis Summary
              </h4>
              <p className='text-sm text-gray-300'>
                {mockData.macro.aiAnalysis.summary}
              </p>

              <div className='mt-4 space-y-2'>
                <h4 className='text-sm font-medium text-gray-300'>
                  Key Factors
                </h4>
                <ul className='list-disc list-inside text-sm text-gray-300 space-y-1'>
                  {mockData.analysis.aiAnalysis.keyFactors?.map(
                    (factor, idx) => (
                      <li key={idx}>{factor}</li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Trading Strategy */}
            <div className='bg-gray-700 rounded-lg p-4'>
              <div className='flex justify-between items-center mb-3'>
                <h4 className='text-sm font-medium text-gray-300'>
                  Recommended Strategy
                </h4>
                <span className='text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded'>
                  {selectedTerm}
                </span>
              </div>

              <div className='space-y-4'>
                {/* Entry */}
                <div className='bg-gray-800 rounded p-3'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-xs text-gray-400'>Entry</span>
                    <span className='text-sm font-medium text-green-400'>
                      {
                        mockData.macro.aiAnalysis.recommendedStrategy.entry
                          .price
                      }
                    </span>
                  </div>
                  <p className='text-xs text-gray-400'>
                    {
                      mockData.macro.aiAnalysis.recommendedStrategy.entry
                        .rationale
                    }
                  </p>
                </div>

                {/* Stop Loss */}
                <div className='bg-gray-800 rounded p-3'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-xs text-gray-400'>Stop Loss</span>
                    <span className='text-sm font-medium text-red-400'>
                      {
                        mockData.macro.aiAnalysis.recommendedStrategy.stopLoss
                          .price
                      }
                    </span>
                  </div>
                  <p className='text-xs text-gray-400'>
                    {
                      mockData.macro.aiAnalysis.recommendedStrategy.stopLoss
                        .rationale
                    }
                  </p>
                </div>

                {/* Take Profit Levels */}
                <div className='bg-gray-800 rounded p-3'>
                  <span className='text-xs text-gray-400 block mb-2'>
                    Take Profit Levels
                  </span>
                  <div className='space-y-2'>
                    {mockData.macro.aiAnalysis.recommendedStrategy.takeProfit.map(
                      (tp, idx) => (
                        <div
                          key={idx}
                          className='flex justify-between items-center'>
                          <span className='text-xs text-gray-400'>
                            TP {idx + 1}
                          </span>
                          <div className='text-right'>
                            <span className='text-sm font-medium text-green-400 block'>
                              {tp.price}
                            </span>
                            <span className='text-xs text-gray-400'>
                              {tp.rationale}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Risk Factors */}
                <div className='bg-gray-800 rounded p-3'>
                  <span className='text-xs text-gray-400 block mb-2'>
                    Key Risks
                  </span>
                  <ul className='list-disc list-inside text-xs text-gray-400 space-y-1'>
                    {mockData.macro.aiAnalysis.recommendedStrategy.keyRisks.map(
                      (risk, idx) => (
                        <li key={idx}>{risk}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Section - Combined Technical, Sentiment, and Timeframe */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4'>
          {/* Technical Analysis */}
          <div className='bg-gray-800 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-blue-100 mb-4'>
              Technical Analysis
            </h3>
            <div className='space-y-3'>
              {/* Moving Averages & MACD */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-gray-700 rounded-lg p-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-400'>Daily EMA 50</span>
                    <span
                      className={`text-xs ${
                        mockData.analysis.aiAnalysis.technicalIndicators.trend
                          .movingAverages.ema50 > mockData.analysis.price
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}>
                      {mockData.analysis.aiAnalysis.technicalIndicators.trend
                        .movingAverages.ema50 > mockData.analysis.price
                        ? 'Resistance'
                        : 'Support'}
                    </span>
                  </div>
                  <div className='text-lg font-medium mt-1'>
                    {
                      mockData.analysis.aiAnalysis.technicalIndicators.trend
                        .movingAverages.ema50
                    }
                  </div>
                </div>
                <div className='bg-gray-700 rounded-lg p-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-400'>MACD</span>
                    <span className='text-xs text-gray-400'>
                      {
                        mockData.analysis.aiAnalysis.technicalIndicators.trend
                          .macd.strength
                      }
                      %
                    </span>
                  </div>
                  <div
                    className={`text-lg font-medium mt-1 ${
                      mockData.analysis.aiAnalysis.technicalIndicators.trend
                        .macd.value === 'BULLISH'
                        ? 'text-green-400'
                        : mockData.analysis.aiAnalysis.technicalIndicators.trend
                            .macd.value === 'BEARISH'
                        ? 'text-red-400'
                        : 'text-gray-300'
                    }`}>
                    {
                      mockData.analysis.aiAnalysis.technicalIndicators.trend
                        .macd.value
                    }
                  </div>
                </div>
              </div>

              {/* RSI & ATR */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-gray-700 rounded-lg p-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-400'>RSI (14)</span>
                    <span className='text-xs text-gray-400'>
                      {
                        mockData.analysis.aiAnalysis.technicalIndicators
                          .momentum.rsi.value
                      }
                    </span>
                  </div>
                  <div
                    className={`text-lg font-medium mt-1 ${
                      mockData.analysis.aiAnalysis.technicalIndicators.momentum
                        .rsi.value > 70
                        ? 'text-red-400'
                        : mockData.analysis.aiAnalysis.technicalIndicators
                            .momentum.rsi.value < 30
                        ? 'text-green-400'
                        : 'text-gray-300'
                    }`}>
                    {mockData.analysis.aiAnalysis.technicalIndicators.momentum.rsi.interpretation.toUpperCase()}
                  </div>
                </div>
                <div className='bg-gray-700 rounded-lg p-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-400'>ATR (14)</span>
                    <span className='text-xs text-gray-400'>
                      {
                        mockData.analysis.aiAnalysis.technicalIndicators
                          .volatility.atr.value
                      }
                    </span>
                  </div>
                  <div
                    className={`text-lg font-medium mt-1 ${
                      mockData.analysis.aiAnalysis.technicalIndicators
                        .volatility.atr.interpretation === 'Normal Range'
                        ? 'text-gray-300'
                        : 'text-orange-400'
                    }`}>
                    {mockData.analysis.aiAnalysis.technicalIndicators.volatility.atr.interpretation.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Key Levels */}
              <div className='bg-gray-700 rounded-lg p-2'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <span className='text-xs text-gray-400'>Resistance</span>
                    <div className='space-y-1 mt-1'>
                      {mockData.analysis.aiAnalysis.keyLevels.resistance
                        ?.slice(0, 2)
                        .map((level, idx) => (
                          <div
                            key={idx}
                            className='flex justify-between items-center'>
                            <span className='text-xs text-red-400'>
                              R{idx + 1}
                            </span>
                            <span className='text-sm font-medium'>{level}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <span className='text-xs text-gray-400'>Support</span>
                    <div className='space-y-1 mt-1'>
                      {mockData.analysis.aiAnalysis.keyLevels.support
                        ?.slice(0, 2)
                        .map((level, idx) => (
                          <div
                            key={idx}
                            className='flex justify-between items-center'>
                            <span className='text-xs text-green-400'>
                              S{idx + 1}
                            </span>
                            <span className='text-sm font-medium'>{level}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Sentiment */}
          <div className='bg-gray-800 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-blue-100 mb-4'>
              Market Sentiment
            </h3>
            <div className='space-y-4'>
              {/* Overall Sentiment */}
              <div className='bg-gray-700 rounded-lg p-3'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-gray-300'>
                    Overall Sentiment
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      mockData.analysis.aiAnalysis.sentiment.label === 'BULLISH'
                        ? 'bg-green-900 text-green-200'
                        : mockData.analysis.aiAnalysis.sentiment.label ===
                          'BEARISH'
                        ? 'bg-red-900 text-red-200'
                        : 'bg-yellow-900 text-yellow-200'
                    }`}>
                    {mockData.analysis.aiAnalysis.sentiment.label}
                  </span>
                </div>
                <ProgressBar
                  value={mockData.analysis.aiAnalysis.sentiment.value}
                  label='Strength'
                  color='dynamic'
                />
              </div>

              {/* Confidence and Probability */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gray-700 rounded-lg p-3'>
                  <ProgressBar
                    value={mockData.analysis.aiAnalysis.confidence.value}
                    label='Confidence'
                    color='blue'
                  />
                </div>
                <div className='bg-gray-700 rounded-lg p-3'>
                  <ProgressBar
                    value={mockData.analysis.aiAnalysis.probabilityUp}
                    label='Probability Up'
                    color='green'
                  />
                </div>
              </div>

              {/* Risk and Volatility */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gray-700 rounded-lg p-3'>
                  <ProgressBar
                    value={100 - mockData.analysis.aiAnalysis.riskLevel.value}
                    label='Risk Level'
                    color='red'
                  />
                </div>
                <div className='bg-gray-700 rounded-lg p-3'>
                  <span className='text-xs text-gray-400 block mb-2'>
                    Volatility
                  </span>
                  <div className='text-sm font-medium'>
                    {
                      mockData.analysis.aiAnalysis.technicalIndicators
                        .volatility.atr.interpretation
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeframe Analysis */}
          <div className='bg-gray-800 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-blue-100 mb-4'>
              Timeframe Analysis
            </h3>
            <div className='space-y-3'>
              {/* Long Term */}
              <div className='bg-gray-700 rounded-lg p-3'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium'>long Term</span>
                  <div className='flex space-x-2'>
                    <span className='px-2 py-1 rounded text-xs bg-yellow-900 text-yellow-200'>
                      NEUTRAL
                    </span>
                    <span className='text-xs bg-gray-600 px-2 py-1 rounded'>
                      60% Prob
                    </span>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div className='bg-gray-800 rounded p-2'>
                    <span className='text-gray-400'>Target</span>
                    <div className='font-medium'>1.0950</div>
                  </div>
                  <div className='bg-gray-800 rounded p-2'>
                    <span className='text-gray-400'>Timeframe</span>
                    <div className='font-medium'>12-18 months</div>
                  </div>
                </div>
              </div>

              {/* Mid Term */}
              <div className='bg-gray-700 rounded-lg p-3'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium'>Mid Term</span>
                  <div className='flex space-x-2'>
                    <span className='px-2 py-1 rounded text-xs bg-yellow-900 text-yellow-200'>
                      NEUTRAL
                    </span>
                    <span className='text-xs bg-gray-600 px-2 py-1 rounded'>
                      55% Prob
                    </span>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div className='bg-gray-800 rounded p-2'>
                    <span className='text-gray-400'>Target</span>
                    <div className='font-medium'>1.0850</div>
                  </div>
                  <div className='bg-gray-800 rounded p-2'>
                    <span className='text-gray-400'>Timeframe</span>
                    <div className='font-medium'>3-6 months</div>
                  </div>
                </div>
              </div>

              {/* Short Term */}
              <div className='bg-gray-700 rounded-lg p-3'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium'>Short Term</span>
                  <div className='flex space-x-2'>
                    <span className='px-2 py-1 rounded text-xs bg-yellow-900 text-yellow-200'>
                      NEUTRAL
                    </span>
                    <span className='text-xs bg-gray-600 px-2 py-1 rounded'>
                      50% Prob
                    </span>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div className='bg-gray-800 rounded p-2'>
                    <span className='text-gray-400'>Target</span>
                    <div className='font-medium'>1.0800</div>
                  </div>
                  <div className='bg-gray-800 rounded p-2'>
                    <span className='text-gray-400'>Timeframe</span>
                    <div className='font-medium'>1-2 weeks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Ideas Section */}
        <div className='bg-gray-800 p-6 rounded-lg mb-4'>
          <h3 className='text-xl font-semibold text-blue-100 mb-4 flex justify-between items-center'>
            <span>TradingView Ideas</span>
            <button
              onClick={() =>
                shell.openExternal(
                  `https://www.tradingview.com/symbols/${selectedAsset.tradingViewSymbol}/ideas/`
                )
              }
              className='text-sm text-blue-400 hover:text-blue-300 transition-colors'>
              View All Ideas →
            </button>
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {mockData.tradeIdeas.map((idea, idx) => (
              <div
                key={idx}
                className='bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors'
                onClick={() => shell.openExternal(idea.link)}>
                <h4 className='text-lg font-semibold text-blue-100 mb-2'>
                  {idea.title}
                </h4>
                <p className='text-sm text-gray-300 mb-4'>{idea.summary}</p>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-400'>Author</span>
                  <span className='text-sm font-medium'>{idea.author}</span>
                </div>
                <div className='flex justify-between items-center mt-2'>
                  <span className='text-xs text-gray-400'>Confidence</span>
                  <span className='text-sm font-medium'>{idea.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market News Section */}
        <div className='bg-gray-800 p-6 rounded-lg'>
          <h3 className='text-xl font-semibold text-blue-100 mb-4 flex justify-between items-center'>
            <span>Market News</span>
            <button
              onClick={() =>
                shell.openExternal(getYahooFinanceLink(selectedAsset.symbol))
              }
              className='text-sm text-blue-400 hover:text-blue-300 transition-colors'>
              View More News →
            </button>
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {mockData.news.map((news, idx) => (
              <div
                key={idx}
                className='bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors'
                onClick={() => shell.openExternal(news.link)}>
                <h4 className='text-lg font-semibold text-blue-100 mb-2'>
                  {news.title}
                </h4>
                <p className='text-sm text-gray-300 mb-4'>{news.summary}</p>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-400'>Source</span>
                  <span className='text-sm font-medium'>{news.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Indicators Section */}
        {renderEconomicIndicators()}
      </div>
    );
  };

  const renderAssetSelector = () => (
    <div className='flex items-center space-x-4 mb-6'>
      <label className='text-gray-400'>Select Asset:</label>
      <select
        value={
          Object.entries(availableAssets).find(([_, assets]) =>
            assets.some((asset) => asset.symbol === selectedAsset.symbol)
          )?.[0] +
          '|' +
          selectedAsset.symbol
        }
        onChange={(e) => {
          const [category, symbol] = e.target.value.split('|');
          setSelectedAsset(
            availableAssets[category].find((asset) => asset.symbol === symbol)
          );
        }}
        className='bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 w-64'>
        {Object.entries(availableAssets).map(([category, assets]) => (
          <optgroup key={category} label={category}>
            {assets.map((asset) => (
              <option key={asset.symbol} value={`${category}|${asset.symbol}`}>
                {asset.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );

  const renderEconomicIndicators = () => {
    if (loading) {
      return (
        <div className='text-center py-4'>Loading economic indicators...</div>
      );
    }

    if (error) {
      return <div className='text-center text-red-500 py-4'>{error}</div>;
    }

    if (!economicData) {
      return <div className='text-center py-4'>No economic data available</div>;
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {economicData.map((indicator, idx) => (
          <div key={idx} className='bg-gray-800 p-4 rounded-lg'>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='text-lg font-semibold'>{indicator.name}</h3>
              {indicator.impact === 'HIGH' && (
                <span className='bg-red-500 text-xs px-2 py-1 rounded'>
                  High Impact
                </span>
              )}
            </div>
            <div className='text-2xl font-bold mb-2'>
              {indicator.current.value}
              <span className='text-sm ml-2'>
                {indicator.trend === 'INCREASING' ? '↑' : '↓'}
              </span>
            </div>
            <div className='text-xs text-green-400 font-medium'>
              Latest Release:{' '}
              {new Date(indicator.current.date).toLocaleDateString()}
            </div>
            <div className='mt-3 space-y-2'>
              <div className='text-sm font-medium text-gray-400'>
                Historical Data:
              </div>
              {indicator.previous.map((prev, i) => (
                <div key={i} className='text-sm text-gray-400'>
                  {prev.value}
                  <span className='text-xs text-gray-500 ml-2'>
                    ({new Date(prev.date).toLocaleDateString()})
                  </span>
                </div>
              ))}
            </div>
            {indicator.nextRelease && (
              <div className='text-xs text-blue-400 mt-3'>
                Next Release:{' '}
                {new Date(indicator.nextRelease).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='h-screen bg-gray-900 overflow-hidden'>
      {renderTabContent()}
    </div>
  );
};

export default MarketIntelligence;
