import React from 'react';
import AnalysisVisualizer from './AnalysisVisualizer';

// Mock data for testing and styling
const mockData = {
  symbol: 'EUR_USD',
  indicators: {
    rsi: 58.5,
    sma_20: 1.0876,
    sma_50: 1.0834,
  },
  signals: {
    trend: {
      primary: 'BULLISH',
      strength: 'STRONG',
    },
    momentum: {
      value: 0.75,
      signal: 'POSITIVE',
    },
  },
  probability_up: 65,
  confidence: 80,
  recommendation: 'BUY',
  supporting_factors: [
    'Strong upward trend',
    'Positive momentum',
    'RSI in neutral zone',
  ],
};

const MarketIntelligence = () => {
  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-blue-100'>Market Intelligence</h2>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <AnalysisVisualizer analysis={mockData} />
      </div>
    </div>
  );
};

export default MarketIntelligence;
