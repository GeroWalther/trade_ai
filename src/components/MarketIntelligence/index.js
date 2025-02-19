import React, { useState } from 'react';
import TradingViewChart from './TradingViewChart';

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
      sentiment: 'BULLISH',
      confidence: 85,
      riskLevel: 'MEDIUM',
      recommendation: 'STRONG_BUY',
      price: 2023.76,
      keyFactors: [
        'Geopolitical tensions increasing safe-haven demand',
        'Weakening USD outlook',
        'Central bank gold buying remains strong',
        'Technical breakout above key resistance',
      ],
      riskFactors: ['Potential Fed hawkish stance', 'Rising real yields'],
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
  };

  // Default configuration for other assets
  const defaultConfig = {
    sentiment: 'NEUTRAL',
    confidence: 60,
    riskLevel: 'MEDIUM',
    recommendation: 'HOLD',
    keyFactors: [
      'Mixed technical signals',
      'Balanced risk-reward ratio',
      'Moderate market volatility',
    ],
    riskFactors: ['Market uncertainty', 'Economic data volatility'],
  };

  const config = assetConfig[asset.symbol] || defaultConfig;

  return {
    analysis: {
      symbol: asset.symbol,
      indicators: {
        rsi:
          config.sentiment === 'BULLISH'
            ? 65.5
            : config.sentiment === 'BEARISH'
            ? 35.5
            : 50.5,
        sma_20: asset.symbol === 'XAUUSD' ? 2023.76 : 1.0876,
        sma_50: asset.symbol === 'XAUUSD' ? 2018.34 : 1.0834,
      },
      signals: {
        trend: {
          primary: config.sentiment,
          strength: config.confidence > 75 ? 'STRONG' : 'MODERATE',
        },
        momentum: {
          value:
            config.sentiment === 'BULLISH'
              ? 0.75
              : config.sentiment === 'BEARISH'
              ? -0.75
              : 0,
          signal: config.sentiment,
        },
      },
      aiAnalysis: {
        sentiment: config.sentiment,
        confidence: config.confidence,
        riskLevel: config.riskLevel,
        recommendation: config.recommendation,
        keyFactors: config.keyFactors,
        riskFactors: config.riskFactors,
        probabilityUp:
          config.sentiment === 'BULLISH'
            ? 75
            : config.sentiment === 'BEARISH'
            ? 25
            : 50,
        riskRewardRatio:
          config.sentiment === 'BULLISH'
            ? 2.5
            : config.sentiment === 'BEARISH'
            ? 0.5
            : 1,
      },
      probability_up:
        config.sentiment === 'BULLISH'
          ? 75
          : config.sentiment === 'BEARISH'
          ? 25
          : 50,
      confidence: config.confidence,
      recommendation: config.recommendation,
      supporting_factors: config.keyFactors,
    },
    macro: {
      indicators:
        asset.symbol === 'XAUUSD'
          ? [
              {
                name: 'US Interest Rates',
                current: '5.5%',
                trend: 'STABLE',
                nextRelease: '2024-03-20',
                impact: 'HIGH',
                forecast: '5.5%',
              },
              {
                name: 'US Inflation',
                current: '3.1%',
                trend: 'DECREASING',
                nextRelease: '2024-03-12',
                impact: 'HIGH',
                forecast: '3.0%',
              },
              {
                name: 'Global Risk Sentiment',
                current: 'MODERATE',
                trend: 'INCREASING',
                impact: 'HIGH',
              },
            ]
          : [
              {
                name: 'US CPI (YoY)',
                current: '3.1%',
                trend: 'DECREASING',
                nextRelease: '2024-03-12',
                impact: 'HIGH',
                forecast: '3.0%',
              },
              {
                name: 'EUR Interest Rate',
                current: '4.5%',
                trend: 'STABLE',
                nextRelease: '2024-03-07',
                impact: 'HIGH',
                forecast: '4.5%',
              },
            ],
    },
    news:
      asset.symbol === 'XAUUSD'
        ? [
            {
              title: 'Gold Hits New High on Geopolitical Tensions',
              timestamp: '2024-02-19T14:30:00Z',
              impact: 'HIGH',
              sentiment: 'BULLISH',
              source: 'Reuters',
            },
            {
              title: 'Fed Comments Weigh on Gold Prices',
              timestamp: '2024-02-19T13:30:00Z',
              impact: 'MEDIUM',
              sentiment: 'BEARISH',
              source: 'Bloomberg',
            },
          ]
        : [
            {
              title: 'ECB Minutes Show Concern Over Persistent Inflation',
              timestamp: '2024-02-19T14:30:00Z',
              impact: 'HIGH',
              sentiment: 'BEARISH',
              source: 'Reuters',
            },
            {
              title: 'US Retail Sales Beat Expectations',
              timestamp: '2024-02-19T13:30:00Z',
              impact: 'MEDIUM',
              sentiment: 'BULLISH',
              source: 'Bloomberg',
            },
          ],
  };
};

const MarketIntelligence = () => {
  const [selectedAsset, setSelectedAsset] = useState(availableAssets.Forex[0]);
  const mockData = generateMockData(selectedAsset);

  const renderTabContent = () => {
    return (
      <div className='p-4 space-y-4 overflow-auto h-full'>
        {renderAssetSelector()}
        <div className='h-[500px]'>
          <TradingViewChart symbol={selectedAsset.tradingViewSymbol} />
        </div>
        <div className='bg-gray-800 p-4 rounded-lg'>
          <h3 className='text-xl font-semibold text-blue-100 mb-4'>
            AI Market Analysis
          </h3>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            <div className='bg-gray-700 p-4 rounded-lg'>
              <h4 className='font-medium mb-3'>AI Sentiment Analysis</h4>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span>Market Sentiment:</span>
                  <span
                    className={`font-medium ${
                      mockData.analysis.aiAnalysis.sentiment === 'BULLISH'
                        ? 'text-green-400'
                        : mockData.analysis.aiAnalysis.sentiment === 'BEARISH'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}>
                    {mockData.analysis.aiAnalysis.sentiment}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Confidence:</span>
                  <span>{mockData.analysis.aiAnalysis.confidence}%</span>
                </div>
                <div className='flex justify-between'>
                  <span>Risk Level:</span>
                  <span
                    className={`font-medium ${
                      mockData.analysis.aiAnalysis.riskLevel === 'HIGH'
                        ? 'text-red-400'
                        : mockData.analysis.aiAnalysis.riskLevel === 'LOW'
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }`}>
                    {mockData.analysis.aiAnalysis.riskLevel}
                  </span>
                </div>
              </div>
            </div>
            <div className='bg-gray-700 p-4 rounded-lg'>
              <h4 className='font-medium mb-3'>Trading Recommendation</h4>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span>Action:</span>
                  <span
                    className={`font-medium ${
                      mockData.analysis.aiAnalysis.recommendation.includes(
                        'BUY'
                      )
                        ? 'text-green-400'
                        : mockData.analysis.aiAnalysis.recommendation.includes(
                            'SELL'
                          )
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}>
                    {mockData.analysis.aiAnalysis.recommendation}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Probability Up:</span>
                  <span>{mockData.analysis.aiAnalysis.probabilityUp}%</span>
                </div>
                <div className='flex justify-between'>
                  <span>Risk/Reward:</span>
                  <span>{mockData.analysis.aiAnalysis.riskRewardRatio}</span>
                </div>
              </div>
            </div>
          </div>
          <div className='space-y-4'>
            <div className='bg-gray-700 p-4 rounded-lg'>
              <h4 className='font-medium mb-2'>Key Factors</h4>
              <ul className='list-disc list-inside space-y-1 text-sm'>
                {mockData.analysis.aiAnalysis.keyFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
            <div className='bg-gray-700 p-4 rounded-lg'>
              <h4 className='font-medium mb-2'>Risk Factors</h4>
              <ul className='list-disc list-inside space-y-1 text-sm text-red-300'>
                {mockData.analysis.aiAnalysis.riskFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className='bg-gray-800 p-4 rounded-lg mb-6'>
          <h3 className='text-xl font-semibold text-blue-100 mb-4'>
            Relevant Economic Indicators
          </h3>
          <div className='space-y-4'>
            {mockData.macro.indicators.map((indicator, idx) => (
              <div
                key={idx}
                className='bg-gray-700 p-4 rounded-lg flex justify-between items-center'>
                <div>
                  <h4 className='font-medium'>{indicator.name}</h4>
                  <p className='text-sm text-gray-400'>
                    Current: {indicator.current}
                  </p>
                </div>
                <div className='text-right'>
                  {indicator.nextRelease && (
                    <p className='text-sm'>Next: {indicator.nextRelease}</p>
                  )}
                  <p
                    className={`text-sm ${
                      indicator.trend === 'INCREASING'
                        ? 'text-green-400'
                        : indicator.trend === 'DECREASING'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}>
                    {indicator.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-gray-800 p-4 rounded-lg'>
          <h3 className='text-xl font-semibold text-blue-100 mb-4'>
            Related News
          </h3>
          <div className='space-y-4'>
            {mockData.news.map((news, idx) => (
              <div key={idx} className='bg-gray-700 p-4 rounded-lg'>
                <div className='flex justify-between items-start mb-2'>
                  <h4 className='font-medium'>{news.title}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      news.sentiment === 'BULLISH'
                        ? 'bg-green-900 text-green-200'
                        : news.sentiment === 'BEARISH'
                        ? 'bg-red-900 text-red-200'
                        : 'bg-yellow-900 text-yellow-200'
                    }`}>
                    {news.sentiment}
                  </span>
                </div>
                <div className='flex justify-between text-sm text-gray-400'>
                  <span>{news.source}</span>
                  <span>{new Date(news.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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

  return (
    <div className='h-screen bg-gray-900 overflow-hidden'>
      {renderTabContent()}
    </div>
  );
};

export default MarketIntelligence;
