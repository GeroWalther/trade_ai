import React, { useState, useEffect } from 'react';
import TradingViewChart from './TradingViewChart';
import { config } from '../../config';
import axios from 'axios';

const availableAssets = {
  Forex: [
    {
      symbol: 'EURUSD',
      name: 'EUR/USD',
      tradingViewSymbol: 'FX:EURUSD',
      category: 'Forex',
    },
    {
      symbol: 'GBPUSD',
      name: 'GBP/USD',
      tradingViewSymbol: 'FX:GBPUSD',
      category: 'Forex',
    },
    {
      symbol: 'USDJPY',
      name: 'USD/JPY',
      tradingViewSymbol: 'FX:USDJPY',
      category: 'Forex',
    },
    {
      symbol: 'AUDUSD',
      name: 'AUD/USD',
      tradingViewSymbol: 'FX:AUDUSD',
      category: 'Forex',
    },
  ],
  Commodities: [
    {
      symbol: 'XAUUSD',
      name: 'Gold',
      tradingViewSymbol: 'GOLD',
      category: 'Commodities',
    },
    {
      symbol: 'XAGUSD',
      name: 'Silver',
      tradingViewSymbol: 'SILVER',
      category: 'Commodities',
    },
    {
      symbol: 'WTIUSD',
      name: 'Crude Oil',
      tradingViewSymbol: 'USOIL',
      category: 'Commodities',
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

const MarketIntelligence = () => {
  const [selectedAsset, setSelectedAsset] = useState(availableAssets.Forex[0]);
  const [selectedTerm, setSelectedTerm] = useState('SWING');
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [loading, setLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');

  // Initialize analysis from localStorage if available
  const [analysis, setAnalysis] = useState(() => {
    const savedAnalysis = localStorage.getItem('marketAnalysis');
    if (savedAnalysis) {
      const parsed = JSON.parse(savedAnalysis);
      // Check if analysis is still valid (less than 1 hour old)
      if (Date.now() - parsed.timestamp < 3600000) {
        return parsed.data;
      }
    }
    return null;
  });

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
      console.log('Starting analysis request for:', selectedAsset.symbol);
      const response = await axios.post(
        `${config.api.baseUrl}/api/analyze-asset`,
        {
          asset: selectedAsset.symbol,
          timeframe: selectedTerm,
          risk_level: riskLevel,
          account_size: 10000,
        }
      );

      if (response.data.status === 'success') {
        setAnalysis(response.data.data);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
      setAnalysisStatus('');
    }
  };

  // Add a clear cache button
  const clearAnalysisCache = () => {
    localStorage.removeItem('marketAnalysis');
    setAnalysis(null);
  };

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
              onClick={clearAnalysisCache}
              className='text-gray-400 hover:text-gray-300 text-sm'>
              Clear Cache
            </button>
            {analysisStatus && (
              <span className='text-gray-400 text-sm'>{analysisStatus}</span>
            )}
          </div>
        </div>

        <div className='w-full h-[600px] bg-gray-800 rounded-lg p-4'>
          <TradingViewChart symbol={selectedAsset.tradingViewSymbol} />
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-gray-800 p-6 rounded-lg'>
            <h3 className='text-xl font-semibold text-blue-100 mb-4'>
              Market Analysis
            </h3>

            {/* Market Summary Section */}
            <div className='space-y-6'>
              <div>
                <h4 className='text-lg font-medium text-blue-200 mb-2'>
                  Market Summary
                </h4>
                <p className='text-gray-300'>
                  {(() => {
                    const text = analysis.macro.aiAnalysis.summary;
                    // Extract just the text content between the quotes, handling all TextBlock variations
                    const cleanText = text
                      .replace(
                        /\[TextBlock\((?:citations=None,\s*)?(?:text=|type='text',\s*text=)'(.*?)'(?:\s*,\s*type='text')?\)\]/s,
                        '$1'
                      )
                      // Clean up any escaped newlines
                      .replace(/\\n/g, '\n')
                      // Split into paragraphs
                      .split('\n\n');

                    return cleanText.map((paragraph, idx) => (
                      <span key={idx}>
                        {paragraph}
                        <br />
                        <br />
                      </span>
                    ));
                  })()}
                </p>
              </div>

              {/* Key Factors Section */}
              <div>
                <h4 className='text-lg font-medium text-blue-200 mb-2'>
                  Key Factors
                </h4>
                <ul className='list-disc list-inside text-gray-300 space-y-1'>
                  {analysis.macro.aiAnalysis.keyFactors?.map((factor, idx) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>

              {/* Trading Strategy Section */}
              <div>
                <h4 className='text-lg font-medium text-blue-200 mb-2'>
                  Trading Strategy
                </h4>
                <div className='text-gray-300 space-y-2'>
                  <p>
                    <span className='font-medium'>Direction: </span>
                    {analysis.macro.aiAnalysis.recommendedStrategy.direction}
                  </p>
                  <p>
                    <span className='font-medium'>Entry: </span>
                    {analysis.macro.aiAnalysis.recommendedStrategy.entry.price}
                    <span className='text-gray-400 ml-2'>
                      (
                      {
                        analysis.macro.aiAnalysis.recommendedStrategy.entry
                          .rationale
                      }
                      )
                    </span>
                  </p>
                  <p>
                    <span className='font-medium'>Stop Loss: </span>
                    {
                      analysis.macro.aiAnalysis.recommendedStrategy.stopLoss
                        .price
                    }
                    <span className='text-gray-400 ml-2'>
                      (
                      {
                        analysis.macro.aiAnalysis.recommendedStrategy.stopLoss
                          .rationale
                      }
                      )
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-gray-800 p-6 rounded-lg'>
            <h3 className='text-xl font-semibold text-blue-100 mb-4'>
              Latest News
            </h3>
            <div className='space-y-4'>
              {analysis.news?.map((item, idx) => (
                <div key={idx} className='bg-gray-700 p-4 rounded-lg'>
                  <h4 className='font-medium text-blue-100 mb-2'>
                    {item.title}
                  </h4>
                  <p className='text-sm text-gray-400'>{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketIntelligence;
