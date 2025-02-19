import React from 'react';
const ProgressBar = ({ value, label, color = 'blue' }) => {
  const getColor = () => {
    if (color === 'dynamic') {
      if (value >= 70) return 'bg-green-500';
      if (value >= 30) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    return `bg-${color}-500`;
  };

  return (
    <div className='w-full'>
      <div className='flex justify-between mb-1'>
        <span className='text-sm text-gray-300'>{label}</span>
        <span className='text-sm text-gray-300'>{value}%</span>
      </div>
      <div className='w-full bg-gray-600 rounded-full h-2.5'>
        <div
          className={`${getColor()} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
