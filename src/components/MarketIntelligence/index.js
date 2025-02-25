import React, { useState, useEffect } from 'react';
import TradingViewChart from './TradingViewChart';
import { config } from '../../config';
import axios from 'axios';
import analysisService from '../../services/analysis_service';
import { shell } from 'electron';
import IndicatorCard from './IndicatorCard.jsx';

const availableAssets = {
  Forex: [
    {
      symbol: 'EUR_USD',
      name: 'EUR/USD',
      tradingViewSymbol: 'FX:EURUSD',
      category: 'Forex',
      type: 'Forex',
    },
    {
      symbol: 'GBP_USD',
      name: 'GBP/USD',
      tradingViewSymbol: 'FX:GBPUSD',
      category: 'Forex',
      type: 'Forex',
    },
    {
      symbol: 'USD_JPY',
      name: 'USD/JPY',
      tradingViewSymbol: 'FX:USDJPY',
      category: 'Forex',
      type: 'Forex',
    },
    {
      symbol: 'USD_CHF',
      name: 'USD/CHF',
      tradingViewSymbol: 'FX:USDCHF',
      category: 'Forex',
      type: 'Forex',
    },
    {
      symbol: 'AUD_USD',
      name: 'AUD/USD',
      tradingViewSymbol: 'FX:AUDUSD',
      category: 'Forex',
      type: 'Forex',
    },
    {
      symbol: 'USD_CAD',
      name: 'USD/CAD',
      tradingViewSymbol: 'FX:USDCAD',
      category: 'Forex',
      type: 'Forex',
    },
    {
      symbol: 'NZD_USD',
      name: 'NZD/USD',
      tradingViewSymbol: 'FX:NZDUSD',
      category: 'Forex',
      type: 'Forex',
    },
    {
      symbol: 'EUR_GBP',
      name: 'EUR/GBP',
      tradingViewSymbol: 'FX:EURGBP',
      category: 'Forex',
      type: 'Forex',
    },
    {
      symbol: 'EUR_JPY',
      name: 'EUR/JPY',
      tradingViewSymbol: 'FX:EURJPY',
      category: 'Forex',
      type: 'Forex',
    },
    {
      symbol: 'GBP_JPY',
      name: 'GBP/JPY',
      tradingViewSymbol: 'FX:GBPJPY',
      category: 'Forex',
      type: 'Forex',
    },
  ],
  Commodities: [
    {
      symbol: 'XAU_USD',
      name: 'Gold',
      tradingViewSymbol: 'GOLD',
      category: 'Commodities',
      type: 'Gold',
    },
    {
      symbol: 'XAG_USD',
      name: 'Silver',
      tradingViewSymbol: 'SILVER',
      category: 'Commodities',
      type: 'Metal',
    },
    {
      symbol: 'BCO_USD',
      name: 'Brent Crude Oil',
      tradingViewSymbol: 'UKOIL',
      category: 'Commodities',
      type: 'Oil',
    },
  ],
  Indices: [
    {
      symbol: 'SPX500_USD',
      name: 'S&P 500',
      tradingViewSymbol: 'SP500',
      category: 'Indices',
      type: 'Index',
    },
    {
      symbol: 'NAS100_USD',
      name: 'Nasdaq 100',
      tradingViewSymbol: 'NASDAQ100',
      category: 'Indices',
      type: 'Index',
    },
    {
      symbol: 'JP225_USD',
      name: 'Nikkei 225',
      tradingViewSymbol: 'NKY',
      category: 'Indices',
      type: 'Index',
    },
    {
      symbol: 'DE30_EUR',
      name: 'DAX 40',
      tradingViewSymbol: 'DAX',
      category: 'Indices',
      type: 'Index',
    },
  ],
};

const TRADING_TERMS = {
  INTRADAY: 'Intraday (1-8 hours)',
  SWING: 'Swing (2-5 days)',
  SHORT_TERM: 'Short Term (1-4 weeks)',
  MEDIUM_TERM: 'Medium Term (1-6 months)',
};

const RISK_LEVELS = {
  LOW: 'Conservative',
  MEDIUM: 'Balanced',
  HIGH: 'Aggressive',
};

// Add asset type mapping
const ASSET_TYPES = {
  EURUSD: 'Forex',
  GBPUSD: 'Forex',
  USDJPY: 'Forex',
  XAU: 'Gold',
  // Add more as needed
};

const formatPrice = (price, assetType) => {
  if (!price) return 'N/A';
  if (assetType === 'Gold') {
    return price.toFixed(2); // Gold typically shows 2 decimal places
  }
  return price.toFixed(4); // Forex typically shows 4 decimal places
};

// Add color helper functions
const getMACDColor = (trend) => {
  switch (trend) {
    case 'BULLISH':
      return 'text-green-400';
    case 'BEARISH':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

const getRSIColor = (signal) => {
  switch (signal) {
    case 'OVERBOUGHT':
      return 'text-orange-400';
    case 'OVERSOLD':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

const getATRColor = (status) => {
  switch (status) {
    case 'HIGH VOLATILITY':
      return 'text-orange-400';
    case 'LOW VOLATILITY':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

const getEMAColor = (signal) => {
  switch (signal) {
    case 'Support':
      return 'text-green-400';
    case 'Resistance':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

const getEMASignal = (ema, currentPrice) => {
  if (!ema || !currentPrice) return 'N/A';
  return currentPrice > ema ? 'Support' : 'Resistance';
};

// Helper function to get relevant indicators based on asset type
const getRelevantIndicators = (indicators, asset) => {
  if (!indicators || !asset) return {};

  // Core indicators always shown
  const coreIndicators = [
    'cpi', // CPI
    'core_cpi', // Core CPI
    'fed_rate', // Fed Funds Rate
    'unemployment', // Unemployment Rate
    'nfp', // Non-Farm Payrolls
    'consumer_conf', // Consumer Confidence
    'repo_liquidity', // Repo Market Liquidity
  ];

  // Asset-specific indicators
  const assetSpecificIndicators = {
    Forex: [
      'trade_balance', // Trade Balance
      'ecb_rate', // ECB Rate
      'boj_rate', // Japan Rate
      'current_account', // Current Account
    ],
    Gold: [
      'real_rate', // Real Interest Rate
      'dxy_index', // Dollar Index
      'inflation_exp_5y', // 5Y Inflation Expectations
      'm2_supply', // M2 Money Supply
    ],
    Oil: [
      'oil_inventory', // EIA Crude Inventories
      'industrial_prod', // Industrial Production
      'global_gdp', // Global GDP Growth
      'dxy_index', // Dollar Strength
    ],
  };

  // Combine core and asset-specific indicators
  const relevantIds = [
    ...coreIndicators,
    ...(assetSpecificIndicators[asset.type] || []),
  ];

  return Object.entries(indicators)
    .filter(([key]) => relevantIds.includes(key))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
};

const MarketIntelligence = () => {
  const [selectedAsset, setSelectedAsset] = useState({
    symbol: 'EUR_USD',
    name: 'EUR/USD',
    category: 'Forex',
  });
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('SWING');
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [marketData, setMarketData] = useState({
    trends: {},
    lastUpdate: null,
    historicalData: {},
  });

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.api.baseUrl}/api/economic-indicators`
      );

      // Process and store market data
      const trends = {};
      const historical = {};

      Object.entries(response.data).forEach(([key, indicator]) => {
        trends[key] = indicator.trend;
        historical[key] = indicator.historical_data;

        // Log changes to console
        if (indicator.historical_data && indicator.historical_data.length > 1) {
          const current = parseFloat(indicator.value);
          const previous = parseFloat(indicator.historical_data[1].value);
          const change = (((current - previous) / previous) * 100).toFixed(2);
          console.log(
            `${indicator.name}: ${indicator.trend.toUpperCase()} (${change}%)`
          );
        }
      });

      setMarketData({
        trends,
        historicalData: historical,
        lastUpdate: new Date().toISOString(),
      });

      setIndicators(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching indicators:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  const handleClearCache = async () => {
    try {
      await axios.post(`${config.api.baseUrl}/api/clear-cache`);
      fetchIndicators();
    } catch (err) {
      setError(err.message);
    }
  };

  // Map trading asset categories to FRED categories
  const getFredCategory = (assetCategory, assetType) => {
    switch (assetCategory.toLowerCase()) {
      case 'forex':
        return 'forex';
      case 'commodities':
        if (assetType === 'Gold' || assetType === 'Silver') {
          return 'precious_metals';
        }
        if (assetType === 'Oil') {
          return 'oil';
        }
        return 'commodities';
      case 'indices':
        return 'stocks';
      default:
        return assetCategory.toLowerCase();
    }
  };

  // Filter indicators based on category
  const coreIndicators = indicators
    ? Object.entries(indicators)
        .filter(([key, value]) => value !== null && value.category === 'core')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    : null;

  const assetIndicators = indicators
    ? Object.entries(indicators)
        .filter(
          ([key, value]) =>
            value !== null &&
            value.category ===
              getFredCategory(selectedAsset.category, selectedAsset.type)
        )
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    : null;

  // Add check before rendering
  const hasValidCoreIndicators =
    coreIndicators && Object.keys(coreIndicators).length > 0;
  const hasValidAssetIndicators =
    assetIndicators && Object.keys(assetIndicators).length > 0;

  const [analysisStatus, setAnalysisStatus] = useState('');
  const [analysis, setAnalysis] = useState(null);

  // Initialize analysis from localStorage if available
  useEffect(() => {
    const fetchAnalysis = async () => {
      const savedAnalysis = localStorage.getItem('marketAnalysis');
      if (savedAnalysis) {
        const parsed = JSON.parse(savedAnalysis);
        if (
          parsed.asset === selectedAsset.symbol &&
          parsed.term === selectedTerm &&
          parsed.risk === riskLevel &&
          Date.now() - parsed.timestamp < 3600000 // Less than 1 hour old
        ) {
          setAnalysis(parsed.data);
        } else {
          setAnalysis(null);
        }
      }
    };

    fetchAnalysis();
  }, [selectedAsset.symbol, selectedTerm, riskLevel]);

  // Save analysis to localStorage whenever it changes
  useEffect(() => {
    if (analysis) {
      localStorage.setItem(
        'marketAnalysis',
        JSON.stringify({
          data: analysis,
          timestamp: Date.now(),
          asset: selectedAsset.symbol,
          term: selectedTerm,
          risk: riskLevel,
        })
      );
    }
  }, [analysis, selectedAsset.symbol, selectedTerm, riskLevel]);

  const handleAssetChange = (e) => {
    const [category, symbol] = e.target.value.split('|');
    const newAsset = availableAssets[category].find(
      (asset) => asset.symbol === symbol
    );
    setSelectedAsset(newAsset);

    // Check if we have recent analysis for this asset
    const savedAnalysis = localStorage.getItem('marketAnalysis');
    if (savedAnalysis) {
      const parsed = JSON.parse(savedAnalysis);
      if (
        parsed.asset === symbol &&
        parsed.term === selectedTerm &&
        parsed.risk === riskLevel &&
        Date.now() - parsed.timestamp < 3600000 // Less than 1 hour old
      ) {
        setAnalysis(parsed.data);
      } else {
        setAnalysis(null);
      }
    } else {
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisStatus('Starting analysis...');
    try {
      const result = await analysisService.analyzeAsset(
        selectedAsset.symbol,
        selectedTerm,
        riskLevel
      );

      if (result.status === 'success') {
        setAnalysis(result.data);
        setAnalysisStatus('');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisStatus(
        error.type === 'NETWORK_ERROR'
          ? 'Unable to connect to analysis server'
          : 'Analysis failed'
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if asset is Forex
  const isForexPair = (asset) => {
    return asset?.type === 'Forex';
  };

  const groupIndicatorsByCategory = (indicators) => {
    // Initialize all possible categories
    const categories = {
      market_liquidity: [],
      credit_markets: [],
      market_breadth: [],
      valuations: [],
      sentiment: [],
      forex_rates: [],
      central_banks: [],
      exchange_rates: [],
      capital_flows: [],
      forex_risk: [],
      positioning: [],
      energy_markets: [],
      precious_metals: [],
      real_rates: [],
      currency_strength: [],
      global_demand: [],
      other: [], // Important: Add 'other' category for uncategorized indicators
    };

    if (!indicators) return categories;

    Object.entries(indicators).forEach(([key, indicator]) => {
      const category = indicator.category || 'other';
      // Ensure category exists, fallback to 'other' if not
      if (!categories[category]) {
        categories[category] = [];
        console.warn(`Unknown category: ${category} for indicator: ${key}`);
      }
      categories[category].push({ key, ...indicator });
    });

    return categories;
  };

  const categoryTitles = {
    market_liquidity: 'Market Liquidity',
    credit_markets: 'Credit Markets',
    market_breadth: 'Market Breadth',
    valuations: 'Valuations & Growth',
    sentiment: 'Market Sentiment',
    forex_rates: 'Interest Rate Differentials',
    central_banks: 'Central Bank Balance Sheets',
    exchange_rates: 'Exchange Rate Metrics',
    capital_flows: 'Capital Flows & Holdings',
    forex_risk: 'Risk & Uncertainty',
    positioning: 'Market Positioning',
    energy_markets: 'Energy Markets',
    precious_metals: 'Precious Metals',
    real_rates: 'Real Interest Rates',
    currency_strength: 'Currency Strength',
    global_demand: 'Global Demand',
    other: 'Macro Economic Indicators', // Add title for 'other' category
  };

  const categoryDescriptions = {
    forex_rates: 'Key interest rates from major central banks',
    central_banks: 'Total assets and monetary policy actions',
    exchange_rates: 'Real effective exchange rates and trade-weighted indices',
    capital_flows: 'International capital movements and treasury holdings',
    forex_risk: 'Geopolitical and policy uncertainty metrics',
    positioning: 'Commitment of Traders and speculative positions',
    energy_markets: 'Oil inventories, production, and rig counts',
    precious_metals: 'Gold and silver prices, ETF holdings, and reserves',
    real_rates: 'Inflation-adjusted interest rates and breakeven rates',
    currency_strength: 'Dollar indices and major currency pairs',
    global_demand: 'Global trade and major economies import data',
    other: 'Additional market indicators', // Add description for 'other' category
  };

  const groupedIndicators = groupIndicatorsByCategory(indicators);

  return (
    <div className='p-4 space-y-6 bg-gray-900'>
      {/* Asset Selector and Controls */}
      <div className='grid grid-cols-1 gap-6'>
        <div className='bg-gray-800 p-4 rounded-lg flex justify-between items-center'>
          <div className='flex gap-4 items-center'>
            <select
              value={`${selectedAsset.category}|${selectedAsset.symbol}`}
              onChange={handleAssetChange}
              className='bg-gray-700 text-white px-4 py-2 rounded border border-gray-600'>
              {Object.entries(availableAssets).map(([category, assets]) => (
                <optgroup key={category} label={category}>
                  {assets.map((asset) => (
                    <option
                      key={asset.symbol}
                      value={`${category}|${asset.symbol}`}>
                      {asset.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className='bg-gray-700 text-white px-4 py-2 rounded border border-gray-600'>
              {Object.entries(TRADING_TERMS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className='bg-gray-700 text-white px-4 py-2 rounded border border-gray-600'>
              {Object.entries(RISK_LEVELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center gap-4'>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'>
              {loading ? 'Analyzing...' : 'AI Analysis'}
            </button>
            <button
              onClick={handleClearCache}
              className='text-gray-400 hover:text-gray-300 text-sm'>
              Clear Cache
            </button>
            {analysisStatus && (
              <span className='text-gray-400 text-sm'>{analysisStatus}</span>
            )}
          </div>
        </div>

        {/* Display Asset-Specific Indicators first */}
        {loading ? (
          <div className='mt-6 bg-gray-800 rounded-lg p-6'>
            <div className='animate-pulse text-blue-300'>
              Loading indicators...
            </div>
          </div>
        ) : hasValidAssetIndicators ? (
          <div className='mt-6 bg-gray-800 rounded-lg p-6'>
            <h3 className='text-xl font-bold text-blue-100 mb-4'>
              {selectedAsset.name} Specific Indicators
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {Object.entries(assetIndicators).map(([key, indicator]) => (
                <IndicatorCard key={key} indicator={indicator} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Display Core Indicators below */}
        {!loading && hasValidCoreIndicators && (
          <div className='mt-6 bg-gray-800 rounded-lg p-6'>
            <h3 className='text-xl font-bold text-blue-100 mb-4'>
              Macro Economic Indicators
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {Object.entries(coreIndicators).map(([key, indicator]) => (
                <IndicatorCard
                  key={key}
                  indicator={indicator}
                  trend={marketData.trends[key]}
                />
              ))}
            </div>
          </div>
        )}

        {/* <div className='w-full h-[800px] bg-gray-800 rounded-lg p-4'>
          <TradingViewChart symbol={selectedAsset.tradingViewSymbol} 
        </div>/> */}
      </div>

      {/* Only render macro analysis if it exists */}
      {analysis?.macro && (
        <div className='space-y-6'>
          <div className='bg-gray-800 p-6 rounded-lg'>
            <div className='space-y-6'>
              <div>
                <h4 className='text-lg font-medium text-blue-200 mb-2'>
                  Market Summary
                </h4>
                <p className='text-gray-300'>
                  {analysis.macro.aiAnalysis?.summary || 'No summary available'}
                </p>
              </div>

              <div>
                <h4 className='text-lg font-medium text-blue-200 mb-2'>
                  Trading Strategy
                </h4>
                <div className='text-gray-300 space-y-2'>
                  <p>
                    <span className='font-medium'>Direction: </span>
                    {analysis.macro.aiAnalysis?.recommendedStrategy
                      ?.direction || 'NEUTRAL'}
                  </p>
                  <p>
                    <span className='font-medium'>Entry: </span>
                    {analysis.macro.aiAnalysis?.recommendedStrategy?.entry
                      ?.price || 'N/A'}
                    <span className='text-gray-400 ml-2'>
                      (
                      {analysis.macro.aiAnalysis?.recommendedStrategy?.entry
                        ?.rationale || 'No rationale available'}
                      )
                    </span>
                  </p>
                  <p>
                    <span className='font-medium'>Stop Loss: </span>
                    {analysis.macro.aiAnalysis?.recommendedStrategy?.stopLoss
                      ?.price || 'N/A'}
                    <span className='text-gray-400 ml-2'>
                      (
                      {analysis.macro.aiAnalysis?.recommendedStrategy?.stopLoss
                        ?.rationale || 'No rationale available'}
                      )
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* News section */}
          {analysis.news && analysis.news.length > 0 && (
            <div className='bg-gray-800 p-6 rounded-lg'>
              <h3 className='text-xl font-semibold text-blue-100 mb-4'>
                Latest News
              </h3>
              <div className='space-y-4'>
                {analysis.news.map((item, idx) => (
                  <div key={idx} className='bg-gray-700 p-4 rounded-lg'>
                    <h4 className='font-medium text-blue-100 mb-2'>
                      {item.title}
                    </h4>
                    <p className='text-sm text-gray-400'>{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Technical Analysis Display */}
      {analysis?.technical_indicators && (
        <div className='bg-gray-800 p-6 rounded-lg'>
          <h3 className='text-xl font-semibold text-blue-100 mb-4'>
            Technical Analysis
          </h3>
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-gray-700 p-4 rounded'>
              <div className='flex justify-between items-center mb-2'>
                <h4 className='text-lg font-medium text-blue-200'>
                  Daily EMA 50
                </h4>
                <span
                  className={getEMAColor(
                    getEMASignal(
                      analysis.technical_indicators.EMA50?.value,
                      analysis.technical_indicators.EMA50?.current_price
                    )
                  )}>
                  {getEMASignal(
                    analysis.technical_indicators.EMA50?.value,
                    analysis.technical_indicators.EMA50?.current_price
                  )}
                </span>
              </div>
              <div className='text-2xl text-white'>
                {formatPrice(
                  analysis.technical_indicators.EMA50?.value,
                  selectedAsset.type
                )}
              </div>
              <div className='text-sm text-gray-400'>
                Current:{' '}
                {formatPrice(
                  analysis.technical_indicators.EMA50?.current_price,
                  selectedAsset.type
                )}
              </div>
            </div>

            <div className='bg-gray-700 p-4 rounded'>
              <div className='flex justify-between items-center mb-2'>
                <h4 className='text-lg font-medium text-blue-200'>MACD</h4>
                <span className='text-sm text-gray-400'>
                  {analysis.technical_indicators.MACD?.value?.toFixed(4) ||
                    'N/A'}
                </span>
              </div>
              <div
                className={`text-2xl ${getMACDColor(
                  analysis.technical_indicators.MACD?.trend
                )}`}>
                {analysis.technical_indicators.MACD?.trend || 'NEUTRAL'}
              </div>
            </div>

            <div className='bg-gray-700 p-4 rounded'>
              <div className='flex justify-between items-center mb-2'>
                <h4 className='text-lg font-medium text-blue-200'>RSI (14)</h4>
                <span className='text-sm text-gray-400'>
                  {analysis.technical_indicators.RSI?.strength || 50}
                </span>
              </div>
              <div className='text-2xl text-white'>
                {analysis.technical_indicators.RSI?.value?.toFixed(2) || 'N/A'}
              </div>
              <div
                className={`text-lg ${getRSIColor(
                  analysis.technical_indicators.RSI?.signal
                )}`}>
                {analysis.technical_indicators.RSI?.signal || 'NEUTRAL'}
              </div>
            </div>

            <div className='bg-gray-700 p-4 rounded'>
              <div className='flex justify-between items-center mb-2'>
                <h4 className='text-lg font-medium text-blue-200'>ATR (14)</h4>
                <span className='text-sm text-gray-400'>
                  {analysis.technical_indicators.ATR?.value?.toFixed(4) ||
                    'N/A'}
                </span>
              </div>
              <div
                className={`text-2xl ${getATRColor(
                  analysis.technical_indicators.ATR?.status
                )}`}>
                {analysis.technical_indicators.ATR?.status || 'NORMAL RANGE'}
              </div>
            </div>

            <div className='col-span-2 bg-gray-700 p-4 rounded'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='text-lg font-medium text-blue-200 mb-2'>
                    Resistance
                  </h4>
                  <div className='space-y-2'>
                    {analysis.technical_indicators.levels?.resistance?.map(
                      (level, i) => (
                        <div key={i} className='flex justify-between'>
                          <span className='text-red-400'>R{i + 1}</span>
                          <span className='text-red-400'>
                            {formatPrice(level, selectedAsset.type)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h4 className='text-lg font-medium text-blue-200 mb-2'>
                    Support
                  </h4>
                  <div className='space-y-2'>
                    {analysis.technical_indicators.levels?.support?.map(
                      (level, i) => (
                        <div key={i} className='flex justify-between'>
                          <span className='text-green-400'>S{i + 1}</span>
                          <span className='text-green-400'>
                            {formatPrice(level, selectedAsset.type)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test button */}
      <div className='flex gap-4'>
        <button
          onClick={async () => {
            try {
              setLoading(true);
              setAnalysisStatus('Fetching indicators...');
              const symbol = selectedAsset.symbol;
              const response = await axios.get(
                `${config.api.baseUrl}/api/test-indicators/${symbol}`
              );
              console.log('Technical Indicators Response:', response.data);

              if (response.data.status === 'success') {
                setAnalysis({
                  technical_indicators: response.data.data,
                  timestamp: new Date().toISOString(),
                });
                setAnalysisStatus('');
              } else {
                const message = response.data.message;
                setAnalysisStatus(
                  message.includes('Invalid or unsupported symbol')
                    ? `Asset ${selectedAsset.name} not supported`
                    : message || 'Failed to get indicators'
                );
              }
            } catch (error) {
              console.error('Test error:', error);
              setAnalysisStatus(
                error.response?.data?.message ||
                  error.message ||
                  'Failed to fetch indicators'
              );
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'>
          {loading ? 'Loading...' : 'Test Indicators'}
        </button>

        <button
          onClick={async () => {
            try {
              setLoading(true);
              setAnalysisStatus('Fetching news...');
              const symbol = selectedAsset.symbol;
              const response = await axios.get(
                `${config.api.baseUrl}/api/news/${symbol}`
              );
              console.log('News Response:', response.data);

              if (response.data.status === 'success') {
                setAnalysis((prev) => ({
                  ...prev,
                  news: response.data.data,
                  newsTimestamp: new Date().toISOString(),
                }));
                setAnalysisStatus('');
              } else {
                setAnalysisStatus(
                  response.data.message || 'Failed to fetch news'
                );
              }
            } catch (error) {
              console.error('News fetch error:', error);
              setAnalysisStatus(
                error.response?.data?.message ||
                  error.message ||
                  'Failed to fetch news'
              );
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'>
          {loading ? 'Loading...' : 'Fetch News'}
        </button>
      </div>

      {/* News Display Section */}
      {analysis?.news && analysis.news.length > 0 && (
        <div className='bg-gray-800 p-6 rounded-lg mt-6'>
          <h3 className='text-xl font-semibold text-blue-100 mb-4'>
            Market News
          </h3>
          <div className='space-y-4'>
            {analysis.news.map((article, idx) => (
              <div key={idx} className='bg-gray-700 p-4 rounded'>
                <div className='flex justify-between items-start gap-4'>
                  <h4 className='text-lg font-medium text-blue-200 mb-2'>
                    {article.title}
                  </h4>
                  <button
                    onClick={() => shell.openExternal(article.url)}
                    className='text-blue-400 hover:text-blue-300 text-sm whitespace-nowrap'>
                    Read More →
                  </button>
                </div>
                <p className='text-gray-300 mb-2'>{article.description}</p>
                <div className='flex justify-between items-center text-sm'>
                  <span
                    className={`px-2 py-1 rounded ${
                      article.sentiment > 0
                        ? 'bg-green-900 text-green-200'
                        : article.sentiment < 0
                        ? 'bg-red-900 text-red-200'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                    Sentiment:{' '}
                    {article.sentiment > 0
                      ? 'Positive'
                      : article.sentiment < 0
                      ? 'Negative'
                      : 'Neutral'}
                  </span>
                  <div className='text-gray-400 flex flex-col items-end'>
                    <span>{article.source}</span>
                    <span>{article.formatted_date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400'></div>
        </div>
      ) : (
        Object.entries(groupedIndicators).map(
          ([category, categoryIndicators]) =>
            categoryIndicators.length > 0 && (
              <div key={category} className='mb-8'>
                <div className='mb-4'>
                  <h3 className='text-xl font-semibold text-blue-100'>
                    {categoryTitles[category] ||
                      category.replace('_', ' ').title()}
                  </h3>
                  {categoryDescriptions[category] && (
                    <p className='text-sm text-gray-400 mt-1'>
                      {categoryDescriptions[category]}
                    </p>
                  )}
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {categoryIndicators.map((indicator) => (
                    <IndicatorCard
                      key={indicator.key}
                      indicator={indicator}
                      trend={marketData.trends[indicator.key]}
                    />
                  ))}
                </div>
              </div>
            )
        )
      )}
    </div>
  );
};

export default MarketIntelligence;
