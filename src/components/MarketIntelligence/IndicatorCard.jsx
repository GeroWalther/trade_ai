import React from 'react';

const IndicatorCard = ({ indicator }) => {
  if (!indicator) return null;

  const {
    name = 'Unknown',
    description = '',
    value = '0.00',
    trend = 'neutral',
    date = '',
    latest_release = '',
    historical_data = [],
  } = indicator;

  // Format the value
  const formattedValue = isNaN(value) ? value : Number(value).toFixed(2);

  // Format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get trend arrow
  const getTrendArrow = (trend) => {
    switch (trend) {
      case 'up':
        return <span className='text-green-400 ml-2'>↑</span>;
      case 'down':
        return <span className='text-red-400 ml-2'>↓</span>;
      default:
        return null;
    }
  };

  // Skip price-only indicators
  if (
    name.toLowerCase().includes('price') ||
    name.toLowerCase().includes('sp500')
  ) {
    return null;
  }

  return (
    <div className='bg-gray-700 p-4 rounded-lg hover:ring-1 hover:ring-blue-400 transition-all'>
      <div className='flex flex-col mb-2'>
        <h4 className='text-lg font-medium text-blue-100 mb-1'>{name}</h4>
        <div className='flex items-center justify-between'>
          <span className='text-2xl font-bold text-yellow-300'>
            {formattedValue}
            {getTrendArrow(trend)}
          </span>
        </div>
      </div>

      <div className='text-green-400 text-sm mb-2'>
        Latest Release: {formatDate(date)}
      </div>

      {/* Historical Data */}
      <div className='mt-2 text-sm text-gray-400'>
        <p>Historical Data:</p>
        {historical_data.slice(1).map((data, index) => (
          <div key={index} className='flex justify-between items-center'>
            <span>{formatDate(data.date)}</span>
            <span className='text-yellow-300'>
              {Number(data.value).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicatorCard;
