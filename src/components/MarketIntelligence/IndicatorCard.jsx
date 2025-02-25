import React from 'react';

const IndicatorCard = ({ indicator }) => {
  // Add defensive check
  if (!indicator) {
    return null; // Or return a loading/error state
  }

  const {
    name = 'Unknown',
    description = '',
    value = '0.00%',
    trend = 'neutral',
    importance = 0,
    correlation = 0,
    latest_release = '',
    historical_data = [],
  } = indicator;

  return (
    <div className='bg-gray-700 p-4 rounded-lg'>
      <div className='flex justify-between items-start mb-2'>
        <h4 className='text-lg font-medium text-blue-200'>{name}</h4>
        <span
          className={`px-2 py-1 rounded text-sm ${
            trend === 'up'
              ? 'bg-green-900 text-green-200'
              : trend === 'down'
              ? 'bg-red-900 text-red-200'
              : 'bg-gray-600 text-gray-300'
          }`}>
          {value}
        </span>
      </div>
      <p className='text-gray-400 text-sm mb-2'>{description}</p>
      <div className='flex justify-between text-sm text-gray-400'>
        <span>Importance: {importance}</span>
        <span>Correlation: {correlation}%</span>
      </div>
      {latest_release && (
        <div className='text-xs text-gray-500 mt-2'>
          Last updated: {latest_release}
        </div>
      )}
    </div>
  );
};

export default IndicatorCard;
