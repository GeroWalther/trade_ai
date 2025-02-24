import React from 'react';

const IndicatorCard = ({ indicator }) => (
  <div className='bg-gray-800 p-4 rounded-lg'>
    <div className='flex justify-between items-start'>
      <h3 className='text-lg font-semibold text-blue-200'>{indicator.name}</h3>
      <span className='text-gray-400'>Importance: {indicator.importance}%</span>
    </div>
    <p className='text-gray-400 text-sm'>{indicator.description}</p>
    <div className='mt-4'>
      <div className='flex items-baseline'>
        <span className='text-3xl font-bold text-white'>{indicator.value}</span>
        <span
          className={`text-xl ml-2 ${
            indicator.trend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
          {indicator.trend === 'up' ? '↑' : '↓'}
        </span>
      </div>
    </div>
    <div className='mt-4 text-green-400'>
      Latest Release: {indicator.latest_release}
    </div>
    <div className='text-blue-400'>Correlation: {indicator.correlation}%</div>
    {indicator.historical_data && (
      <div className='mt-4'>
        <div className='text-gray-400'>Historical Data:</div>
        {indicator.historical_data.map((data, idx) => (
          <div key={idx} className='text-gray-400'>
            {data.value.toFixed(2)}% ({data.date})
          </div>
        ))}
      </div>
    )}
  </div>
);

export default IndicatorCard;
