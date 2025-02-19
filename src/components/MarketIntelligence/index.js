import React, { useState } from 'react';
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
const generateMockData = (asset) => {
  // Asset-specific configurations
  const assetConfig = {
    XAUUSD: {
      sentiment: {
        value: 85,
        label: 'BULLISH',
        summary: 'Strong bullish momentum with solid fundamental support',
      },
      confidence: {
        value: 85,
        summary: 'High confidence based on multiple confirming signals',
      },
      riskLevel: {
        value: 45,
        label: 'MEDIUM',
        summary: 'Moderate risk due to potential Fed policy shifts',
      },
      timeframes: {
        longTerm: {
          outlook: 'BULLISH',
          target: '2250.00',
          probability: 75,
          timeframe: '12-18 months',
          keyLevels: {
            resistance: ['2080.00', '2150.00', '2250.00'],
            support: ['1920.00', '1880.00', '1810.00'],
          },
        },
        midTerm: {
          outlook: 'BULLISH',
          target: '2080.00',
          probability: 70,
          timeframe: '3-6 months',
          keyLevels: {
            resistance: ['2050.00', '2080.00', '2100.00'],
            support: ['1950.00', '1920.00', '1880.00'],
          },
        },
        shortTerm: {
          outlook: 'NEUTRAL',
          target: '2000.00',
          probability: 60,
          timeframe: '1-2 weeks',
          keyLevels: {
            resistance: ['2000.00', '2025.00', '2050.00'],
            support: ['1975.00', '1950.00', '1920.00'],
          },
        },
      },
      technicalIndicators: {
        trend: {
          macd: { value: 'BULLISH', strength: 85 },
          movingAverages: { value: 'BULLISH', strength: 80 },
          trendStrength: { value: 'STRONG', adx: 28 },
        },
        momentum: {
          rsi: { value: 65, interpretation: 'BULLISH' },
          stochastic: { value: 75, interpretation: 'BULLISH' },
          cci: { value: 125, interpretation: 'BULLISH' },
        },
        volatility: {
          bollinger: {
            value: 'EXPANDING',
            interpretation: 'INCREASING VOLATILITY',
          },
          atr: { value: 25.5, interpretation: 'HIGH VOLATILITY' },
        },
      },
      recommendation: 'STRONG_BUY',
      price: 2023.76,
      keyFactors: [
        'Geopolitical tensions increasing safe-haven demand',
        'Weakening USD outlook',
        'Central bank gold buying remains strong',
        'Technical breakout above key resistance',
        'Inflation concerns persist globally',
        'Strong institutional accumulation',
      ],
      riskFactors: [
        'Potential Fed hawkish stance',
        'Rising real yields',
        'Technical overbought conditions',
        'Profit taking at psychological levels',
      ],
      aiSummary: `Gold maintains a strong bullish bias with multiple supporting factors across different timeframes. Technical indicators show robust momentum with the MACD and RSI both in bullish territory. The long-term outlook is particularly positive, supported by persistent geopolitical tensions and central bank buying. However, traders should monitor Fed policy developments and manage risk around key psychological levels. The risk/reward ratio remains favorable for long positions with proper risk management.`,
    },
    BTCUSD: {
      sentiment: 'BEARISH',
      confidence: 75,
      riskLevel: 'HIGH',
      recommendation: 'SELL',
      price: 52145.3,
      keyFactors: [
        'Overbought technical conditions',
        'Institutional profit taking',
        'Regulatory concerns emerging',
        'Declining network activity',
      ],
      riskFactors: [
        'High market volatility',
        'Regulatory uncertainty',
        'Leveraged positions unwinding',
      ],
    },
    default: {
      sentiment: {
        value: 50,
        label: 'NEUTRAL',
        summary: 'Mixed signals with balanced risk-reward ratio',
      },
      confidence: {
        value: 60,
        summary: 'Moderate confidence based on mixed signals',
      },
      riskLevel: {
        value: 50,
        label: 'MEDIUM',
        summary: 'Standard market risk level',
      },
      timeframes: {
        longTerm: {
          outlook: 'NEUTRAL',
          target: '1.0950',
          probability: 60,
          timeframe: '12-18 months',
        },
        midTerm: {
          outlook: 'NEUTRAL',
          target: '1.0850',
          probability: 55,
          timeframe: '3-6 months',
        },
        shortTerm: {
          outlook: 'NEUTRAL',
          target: '1.0800',
          probability: 50,
          timeframe: '1-2 weeks',
        },
      },
      technicalIndicators: {
        trend: {
          macd: { value: 'NEUTRAL', strength: 50 },
          movingAverages: { value: 'NEUTRAL', strength: 50 },
          trendStrength: { value: 'MODERATE', adx: 15 },
        },
        momentum: {
          rsi: { value: 50, interpretation: 'NEUTRAL' },
          stochastic: { value: 50, interpretation: 'NEUTRAL' },
          cci: { value: 0, interpretation: 'NEUTRAL' },
        },
        volatility: {
          bollinger: { value: 'NORMAL', interpretation: 'AVERAGE VOLATILITY' },
          atr: { value: 15.5, interpretation: 'NORMAL VOLATILITY' },
        },
      },
      recommendation: 'HOLD',
      price: 0,
      keyFactors: [
        'Market in consolidation phase',
        'Mixed technical signals',
        'Awaiting clear directional bias',
      ],
      riskFactors: ['Market uncertainty', 'Economic data volatility'],
      aiSummary:
        'Market showing mixed signals with balanced risk-reward ratio. Monitor key levels for directional bias.',
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
      aiAnalysis: {
        sentiment: config.sentiment,
        confidence: config.confidence,
        timeframes: config.timeframes,
        technicalIndicators: config.technicalIndicators,
        probabilityUp:
          config.sentiment.label === 'BULLISH'
            ? 75
            : config.sentiment.label === 'BEARISH'
            ? 25
            : 50,
        riskLevel: config.riskLevel,
        summary: config.aiSummary,
      },
    },
    macro: {
      indicators: getEconomicIndicators(asset.symbol),
      aiAnalysis: {
        summary: config.aiSummary,
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
          timeframe: 'MEDIUM_TERM',
          confidence: config.confidence.value,
          keyRisks: config.riskFactors,
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

const MarketIntelligence = () => {
  const [selectedAsset, setSelectedAsset] = useState(availableAssets.Forex[0]);
  const mockData = generateMockData(selectedAsset);

  const renderTabContent = () => {
    return (
      <div className='p-4 space-y-4 overflow-auto h-full'>
        {renderAssetSelector()}

        {/* Chart Section - Full Width */}
        <div className='bg-gray-800 rounded-lg p-4 h-[500px]'>
          <TradingViewChart symbol={selectedAsset.tradingViewSymbol} />
        </div>

        {/* AI Analysis and Strategy Recommendation */}
        <div className='bg-gray-800 rounded-lg p-4 mb-4'>
          <h3 className='text-lg font-semibold text-blue-100 mb-4 flex justify-between items-center'>
            <span>AI Analysis & Strategy</span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                mockData.macro.aiAnalysis.recommendedStrategy.direction ===
                'BULLISH'
                  ? 'bg-green-900 text-green-200'
                  : mockData.macro.aiAnalysis.recommendedStrategy.direction ===
                    'BEARISH'
                  ? 'bg-red-900 text-red-200'
                  : 'bg-yellow-900 text-yellow-200'
              }`}>
              {mockData.macro.aiAnalysis.recommendedStrategy.direction}
            </span>
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
                  {mockData.macro.aiAnalysis.recommendedStrategy.timeframe}
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
            <div className='space-y-4'>
              {/* Trend Analysis */}
              <div className='bg-gray-700 rounded-lg p-3'>
                <h4 className='text-sm font-medium text-gray-300 mb-2'>
                  Trend Analysis
                </h4>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-gray-800 rounded p-2'>
                    <span className='text-xs text-gray-400'>MACD</span>
                    <div
                      className={`text-sm font-medium ${
                        mockData.analysis.aiAnalysis.technicalIndicators.trend
                          .macd.value === 'BULLISH'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                      {
                        mockData.analysis.aiAnalysis.technicalIndicators.trend
                          .macd.value
                      }
                    </div>
                  </div>
                  <div className='bg-gray-800 rounded p-2'>
                    <span className='text-xs text-gray-400'>ATR (14)</span>
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium'>
                        {
                          mockData.analysis.aiAnalysis.technicalIndicators
                            .volatility.atr.value
                        }
                      </span>
                      <span className='text-xs text-gray-400'>
                        {
                          mockData.analysis.aiAnalysis.technicalIndicators
                            .volatility.atr.interpretation
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Momentum Indicators */}
              <div className='bg-gray-700 rounded-lg p-3'>
                <h4 className='text-sm font-medium text-gray-300 mb-2'>
                  Momentum
                </h4>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-400'>RSI (14)</span>
                    <span className='text-sm font-medium'>
                      {
                        mockData.analysis.aiAnalysis.technicalIndicators
                          .momentum.rsi.value
                      }
                    </span>
                  </div>
                  {/* Add more momentum indicators */}
                </div>
              </div>

              {/* Key Levels */}
              <div className='bg-gray-700 rounded-lg p-3'>
                <h4 className='text-sm font-medium text-gray-300 mb-2'>
                  Key Levels
                </h4>
                <div className='space-y-2'>
                  <div className='flex justify-between text-xs'>
                    <span className='text-red-400'>Resistance</span>
                    <span>
                      {
                        mockData.analysis.aiAnalysis.timeframes.shortTerm
                          .keyLevels?.resistance?.[0]
                      }
                    </span>
                  </div>
                  <div className='flex justify-between text-xs'>
                    <span className='text-green-400'>Support</span>
                    <span>
                      {
                        mockData.analysis.aiAnalysis.timeframes.shortTerm
                          .keyLevels?.support?.[0]
                      }
                    </span>
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
              {Object.entries(mockData.analysis.aiAnalysis.timeframes).map(
                ([timeframe, data]) => (
                  <div key={timeframe} className='bg-gray-700 rounded-lg p-3'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-medium'>
                        {timeframe.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className='flex space-x-2'>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            data.outlook === 'BULLISH'
                              ? 'bg-green-900 text-green-200'
                              : data.outlook === 'BEARISH'
                              ? 'bg-red-900 text-red-200'
                              : 'bg-yellow-900 text-yellow-200'
                          }`}>
                          {data.outlook}
                        </span>
                        <span className='text-xs bg-gray-600 px-2 py-1 rounded'>
                          {data.probability}% Prob
                        </span>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <div className='bg-gray-800 rounded p-2'>
                        <span className='text-gray-400'>Target</span>
                        <div className='font-medium'>{data.target}</div>
                      </div>
                      <div className='bg-gray-800 rounded p-2'>
                        <span className='text-gray-400'>Timeframe</span>
                        <div className='font-medium'>{data.timeframe}</div>
                      </div>
                    </div>
                  </div>
                )
              )}
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
        {renderEconomicIndicators(mockData.macro.indicators)}
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

  const renderEconomicIndicators = (indicators) => {
    const getPercentageChange = (current, previous) => {
      // Remove % signs and convert to numbers
      const currentVal = parseFloat(current.replace('%', ''));
      const previousVal = parseFloat(previous.replace('%', ''));
      const change = currentVal - previousVal;
      return {
        value: Math.abs(change).toFixed(1),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      };
    };

    return (
      <div className='bg-gray-800 rounded-lg p-4 mb-4'>
        <h3 className='text-lg font-semibold text-blue-100 mb-4'>
          Economic Indicators
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {indicators.map((indicator, idx) => {
            const change = getPercentageChange(
              indicator.current,
              indicator.previous[0]
            );

            return (
              <div key={idx} className='bg-gray-700 rounded-lg p-3'>
                <div className='flex justify-between items-start mb-2'>
                  <h4 className='text-sm font-medium text-gray-300'>
                    {indicator.name}
                    {indicator.impact === 'HIGH' && (
                      <span className='ml-2 text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded'>
                        High Impact
                      </span>
                    )}
                  </h4>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-400'>Current</span>
                    <div className='flex items-center space-x-2'>
                      <span className='text-sm font-medium'>
                        {indicator.current}
                      </span>
                      {change.direction !== 'neutral' && (
                        <div
                          className={`flex items-center text-xs ${
                            change.direction === 'up'
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}>
                          {change.direction === 'up' ? (
                            <ArrowUpIcon className='w-3 h-3 mr-0.5' />
                          ) : (
                            <ArrowDownIcon className='w-3 h-3 mr-0.5' />
                          )}
                          {change.value}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-400'>Previous</span>
                    <div className='text-right space-y-1'>
                      {indicator.previous.map((value, i) => (
                        <div
                          key={i}
                          className={`text-sm ${
                            i === 0
                              ? 'text-gray-300'
                              : i === 1
                              ? 'text-gray-400'
                              : 'text-gray-500'
                          }`}>
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                  {indicator.forecast && (
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-400'>Forecast</span>
                      <div className='flex items-center space-x-2'>
                        <span className='text-sm font-medium'>
                          {indicator.forecast}
                        </span>
                        {(() => {
                          const forecastChange = getPercentageChange(
                            indicator.forecast,
                            indicator.current
                          );
                          return (
                            forecastChange.direction !== 'neutral' && (
                              <div
                                className={`flex items-center text-xs ${
                                  forecastChange.direction === 'up'
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`}>
                                {forecastChange.direction === 'up' ? (
                                  <ArrowUpIcon className='w-3 h-3 mr-0.5' />
                                ) : (
                                  <ArrowDownIcon className='w-3 h-3 mr-0.5' />
                                )}
                                {forecastChange.value}%
                              </div>
                            )
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-400'>Next Release</span>
                    <span className='text-sm'>{indicator.nextRelease}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
