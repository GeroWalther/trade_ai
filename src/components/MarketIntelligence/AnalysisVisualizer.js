import React from 'react';
import TradingViewChart from './TradingViewChart';

const AnalysisVisualizer = ({ analysis }) => {
  if (!analysis) return null;

  const {
    symbol,
    indicators,
    signals,
    probability_up,
    confidence,
    recommendation,
    supporting_factors,
  } = analysis;

  // Convert OANDA symbol format to TradingView format
  const getTradingViewSymbol = (oandaSymbol) => {
    return oandaSymbol.replace('_', ''); // EUR_USD -> EURUSD
  };

  return (
    <div className='bg-[#1a1f3c] p-4 rounded-lg space-y-6'>
      <TradingViewChart
        symbol={`FX:${getTradingViewSymbol(symbol)}`}
        theme='dark'
      />

      {/* Probability and Confidence Gauge */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-[#232a4d] p-4 rounded'>
          <h4 className='text-sm text-blue-300 mb-2'>Probability Up</h4>
          <div className='relative h-4 bg-gray-700 rounded'>
            <div
              className='absolute h-full bg-green-500 rounded'
              style={{ width: `${probability_up}%` }}
            />
            <span className='absolute right-0 -top-6 text-sm'>
              {probability_up.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className='bg-[#232a4d] p-4 rounded'>
          <h4 className='text-sm text-blue-300 mb-2'>Confidence</h4>
          <div className='relative h-4 bg-gray-700 rounded'>
            <div
              className='absolute h-full bg-blue-500 rounded'
              style={{ width: `${confidence}%` }}
            />
            <span className='absolute right-0 -top-6 text-sm'>
              {confidence.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation Card */}
      <div className='bg-[#232a4d] p-4 rounded'>
        <h4 className='text-sm text-blue-300 mb-2'>Recommendation</h4>
        <div
          className={`text-xl font-bold mb-2 ${
            recommendation.includes('BUY')
              ? 'text-green-500'
              : recommendation.includes('SELL')
              ? 'text-red-500'
              : 'text-yellow-500'
          }`}>
          {recommendation}
        </div>
        <ul className='space-y-1'>
          {supporting_factors.map((factor, index) => (
            <li key={index} className='text-sm text-gray-300'>
              • {factor}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalysisVisualizer;
