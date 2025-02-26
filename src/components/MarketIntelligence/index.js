import React, { useState, useEffect, useCallback } from 'react';
import TradingViewChart from './TradingViewChart';
import { config } from '../../config';
import axios from 'axios';
import analysisService from '../../services/analysis_service';
import { shell } from 'electron';
import IndicatorCard from './IndicatorCard.jsx';
import PriceChart from './PriceChart';
import { cacheService } from '../../services/cache_service';

// Define available assets with categories
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
  ],
  Crypto: [
    {
      symbol: 'BTC_USD',
      name: 'BTC/USD',
      tradingViewSymbol: 'BTCUSD',
      category: 'Crypto',
      type: 'Crypto',
    },
    {
      symbol: 'ETH_USD',
      name: 'ETH/USD',
      tradingViewSymbol: 'ETHUSD',
      category: 'Crypto',
      type: 'Crypto',
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
      symbol: 'DE40_EUR',
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
    type: 'Forex',
  });
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('SWING');
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [marketData, setMarketData] = useState({
    news: {},
    historicalPrices: {},
    technicalIndicators: {},
    macroIndicators: {},
    lastUpdate: null,
  });
  // const [pricesLoading, setPricesLoading] = useState(false);
  // const [lastFetch, setLastFetch] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Intraday');
  console.log('MARKET DATA: ', marketData);
  const fetchIndicators = async () => {
    try {
      setLoading(true);
      console.log(
        'Fetching data for',
        selectedAsset.symbol,
        'with timeframe',
        selectedTimeframe
      );

      const pricesResponse = await axios.get(
        `${config.api.baseUrl}/api/historical-prices/${selectedAsset.symbol}?timeframe=${selectedTimeframe}`
      );

      if (pricesResponse.data && Array.isArray(pricesResponse.data)) {
        setMarketData((prevData) => ({
          ...prevData,
          historicalPrices: {
            ...prevData.historicalPrices,
            [selectedAsset.symbol]: {
              ...prevData.historicalPrices[selectedAsset.symbol],
              [selectedTimeframe]: pricesResponse.data,
            },
          },
          lastUpdate: new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when asset or timeframe changes
  useEffect(() => {
    fetchIndicators();
  }, [selectedAsset.symbol, selectedTimeframe]);

  const handleClearCache = async () => {
    try {
      await axios.post(`${config.api.baseUrl}/api/clear-cache`);
      fetchIndicators();
    } catch (err) {
      setError(err.message);
    }
  };

  // Map trading asset categories to FRED categories
  // const getFredCategory = (assetCategory, assetType) => {
  //   switch (assetCategory.toLowerCase()) {
  //     case 'forex':
  //       return 'forex';
  //     case 'commodities':
  //       if (assetType === 'Gold' || assetType === 'Silver') {
  //         return 'precious_metals';
  //       }
  //       if (assetType === 'Oil') {
  //         return 'oil';
  //       }
  //       return 'commodities';
  //     case 'indices':
  //       return 'stocks';
  //     default:
  //       return assetCategory.toLowerCase();
  //   }
  // };

  // Filter indicators based on category
  const coreIndicators = indicators
    ? Object.entries(indicators)
        .filter(([key, value]) => value !== null && value.category === 'core')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    : null;

  // const assetIndicators = indicators
  //   ? Object.entries(indicators)
  //       .filter(
  //         ([key, value]) =>
  //           value !== null &&
  //           value.category ===
  //             getFredCategory(selectedAsset.category, selectedAsset.type)
  //       )
  //       .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  //   : null;

  // Add check before rendering
  // const hasValidCoreIndicators =
  //   coreIndicators && Object.keys(coreIndicators).length > 0;
  // const hasValidAssetIndicators =
  //   assetIndicators && Object.keys(assetIndicators).length > 0;

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
  // useEffect(() => {
  //   if (analysis) {
  //     localStorage.setItem(
  //       'marketAnalysis',
  //       JSON.stringify({
  //         data: analysis,
  //         timestamp: Date.now(),
  //         asset: selectedAsset.symbol,
  //         term: selectedTerm,
  //         risk: riskLevel,
  //       })
  //     );
  //   }
  // }, [analysis, selectedAsset.symbol, selectedTerm, riskLevel]);

  const handleAssetChange = async (asset) => {
    console.log('Asset selection changed to:', asset.symbol); // Debug log
    try {
      setSelectedAsset(asset);
      setLoading(true);

      const cacheKey = `indicators_${asset.symbol}`;
      const cachedData = cacheService.get(cacheKey);

      if (cachedData) {
        setMarketData(cachedData.marketData);
        setIndicators(cachedData.indicators);
        setLoading(false);
        return;
      }

      await fetchIndicators();
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    handleAssetChange(selectedAsset);
  }, []); // Only run on mount

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

  const handleTimeframeChange = (event) => {
    console.log('Timeframe changed to:', event.target.value);
    setSelectedTimeframe(event.target.value);
  };

  // Add this function to fetch macro indicators
  const fetchMacroIndicators = async () => {
    try {
      const response = await axios.get(
        `${config.api.baseUrl}/api/economic-indicators`
      );
      console.log('Macro Indicators Response:', response.data); // Add this debug log
      if (response.data) {
        // Set the macro indicators in state
        setIndicators(response.data);

        // Update marketData with macro indicators
        setMarketData((prev) => ({
          ...prev,
          macroIndicators: {
            ...prev.macroIndicators,
            ...response.data,
          },
        }));
      }
    } catch (err) {
      console.error('Error fetching macro indicators:', err);
      setError('Failed to load economic indicators');
    }
  };

  // Add useEffect to load macro indicators on mount
  useEffect(() => {
    fetchMacroIndicators();
  }, []); // Empty dependency array means this runs once on mount

  // Keep handleTestIndicators focused only on technical indicators
  const handleTestIndicators = async () => {
    try {
      setLoading(true);
      setAnalysisStatus('Testing indicators...');
      const symbol = selectedAsset.symbol;
      const response = await axios.get(
        `${config.api.baseUrl}/api/test-indicators/${symbol}`
      );

      if (response.data.status === 'success' && response.data.data) {
        const rawData = response.data.data;
        console.log('!!!!! Raw Technical Data:', rawData);

        // Update analysis state with raw data
        setAnalysis((prev) => ({
          ...prev,
          technical_indicators: rawData,
          timestamp: new Date().toISOString(),
        }));

        // Update marketData with validated technical indicators
        setMarketData((prev) => ({
          ...prev,
          technicalIndicators: {
            ...prev.technicalIndicators,
            [selectedAsset.symbol]: {
              ema: {
                value: rawData.EMA50?.value ?? 0,
                currentPrice: rawData.EMA50?.current_price ?? 0,
              },
              macd: {
                value: rawData.MACD?.value?.toFixed(6) ?? 0,
                trend: rawData.MACD?.trend ?? 'NEUTRAL',
                histogram: rawData.MACD?.hist.toFixed(6) ?? 0,
                signal: rawData.MACD?.signal.toFixed(6) ?? 0,
              },
              rsi: {
                strength: rawData.RSI?.strength || 50,
                value: rawData.RSI?.value || 50,
                signal: rawData.RSI?.signal ?? 'NEUTRAL',
              },
              atr: {
                value: rawData.ATR?.value || 0,
                status: rawData.ATR?.status || 'NORMAL RANGE',
              },
              levels: rawData.levels,
              timestamp: new Date().toISOString(),
            },
          },
        }));

        setAnalysisStatus('');
      }
    } catch (error) {
      console.error('Test error:', error);
      setAnalysisStatus('Failed to fetch indicators');
    } finally {
      setLoading(false);
    }
  };

  // News button handler
  const handleFetchNews = async () => {
    try {
      setLoading(true);
      setAnalysisStatus('Fetching news...');
      const symbol = selectedAsset.symbol;
      const response = await axios.get(
        `${config.api.baseUrl}/api/news/${symbol}`
      );
      // console.log('Raw News Response:', response.data);

      if (response.data.status === 'success') {
        const newsData = response.data.data;
        console.log('Processed News Data:', newsData); // Debug log

        // Update analysis state
        setAnalysis((prev) => ({
          ...prev,
          news: newsData,
          newsTimestamp: new Date().toISOString(),
        }));

        // Update marketData with structured news data
        setMarketData((prev) => ({
          ...prev,
          news: {
            ...prev.news,
            [selectedAsset.symbol]: {
              articles: newsData.map((article) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source,
                sentiment: article.sentiment,
                timestamp: article.timestamp,
              })),
              timestamp: new Date().toISOString(),
            },
          },
        }));
      }
    } catch (error) {
      console.error('News fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='market-intelligence p-4'>
      <h2 className='text-2xl font-bold mb-6'>Market Intelligence</h2>

      {/* Asset and Timeframe Selection */}
      <div className='flex gap-4 mb-4'>
        <select
          value={selectedAsset.symbol}
          onChange={(e) => setSelectedAsset({ symbol: e.target.value })}
          className='bg-gray-700 text-white px-4 py-2 rounded'>
          {Object.entries(availableAssets).map(([category, assets]) => (
            <optgroup key={category} label={category}>
              {assets.map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <select
          value={selectedTimeframe}
          onChange={handleTimeframeChange}
          className='bg-gray-700 text-white px-4 py-2 rounded'>
          <option value='Intraday'>Intraday (1-8h)</option>
          <option value='Swing'>Swing (2-5 days)</option>
          <option value='Position'>Position (1-4 weeks)</option>
        </select>
      </div>

      {/* Price Chart */}
      <div className='mt-4 bg-gray-800 rounded-lg p-4'>
        {loading ? (
          <div className='text-center p-4'>Loading price data...</div>
        ) : marketData?.historicalPrices?.[selectedAsset.symbol]?.[
            selectedTimeframe
          ]?.length > 0 ? (
          <PriceChart
            prices={
              marketData.historicalPrices[selectedAsset.symbol][
                selectedTimeframe
              ]
            }
            timeframe={selectedTimeframe}
          />
        ) : (
          <div className='text-center text-gray-500 p-4'>
            No price data available
          </div>
        )}
      </div>

      {/* Controls Row */}
      <div className='bg-gray-800 p-4 rounded-lg flex items-center gap-4'>
        {/* Term Selector */}
        {/* <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className='bg-gray-700 text-white px-4 py-2 rounded border border-gray-600'>
          <option value='INTRADAY'>Intraday (1-4h)</option>
          <option value='SWING'>Swing (2-5 days)</option>
          <option value='POSITION'>Position (1-4 weeks)</option>
        </select> */}

        {/* Risk Level Selector */}
        <div className='flex items-center gap-2'>
          <p className='text-white'>Risk Level</p>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className='bg-gray-700 text-white px-4 py-2 rounded border border-gray-600'>
            <option value='LOW'>Conservative</option>
            <option value='MEDIUM'>Moderate</option>
            <option value='HIGH'>Aggressive</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2 ml-auto'>
          <button
            onClick={handleAnalyze}
            className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'>
            AI Analysis
          </button>
          <button
            onClick={handleClearCache}
            className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded'>
            Clear Cache
          </button>
        </div>
      </div>

      {/* Display Asset-Specific Indicators first */}
      {loading ? (
        <div className='mt-6 bg-gray-800 rounded-lg p-6'>
          <div className='animate-pulse text-blue-300'>
            Loading indicators...
          </div>
        </div>
      ) : (
        <>
          {/* Technical Indicators Section */}
          {analysis?.technical_indicators && (
            <div className='bg-gray-800 p-6 rounded-lg mt-6'>
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
                    <h4 className='text-lg font-medium text-blue-200'>
                      RSI (14)
                    </h4>
                    <span className='text-sm text-gray-400'>
                      {analysis.technical_indicators.RSI?.strength || 50}
                    </span>
                  </div>
                  <div className='text-2xl text-white'>
                    {analysis.technical_indicators.RSI?.value?.toFixed(2) ||
                      'N/A'}
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
                    <h4 className='text-lg font-medium text-blue-200'>
                      ATR (14)
                    </h4>
                    <span className='text-sm text-gray-400'>
                      {analysis.technical_indicators.ATR?.value?.toFixed(4) ||
                        'N/A'}
                    </span>
                  </div>
                  <div
                    className={`text-2xl ${getATRColor(
                      analysis.technical_indicators.ATR?.status
                    )}`}>
                    {analysis.technical_indicators.ATR?.status ||
                      'NORMAL RANGE'}
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

          {/* Macro Indicators Section */}
          {Object.entries(groupedIndicators).map(
            ([category, categoryIndicators]) =>
              categoryIndicators.length > 0 ? (
                <div key={category} className='mt-6 bg-gray-800 rounded-lg p-6'>
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
                        trend={indicator.trend}
                      />
                    ))}
                  </div>
                </div>
              ) : null
          )}
        </>
      )}

      {/* Test button */}
      <div className='flex gap-4'>
        <button
          onClick={handleTestIndicators}
          disabled={loading}
          className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'>
          {loading ? 'Loading...' : 'Test Indicators'}
        </button>

        <button
          onClick={handleFetchNews}
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
    </div>
  );
};

export default MarketIntelligence;
