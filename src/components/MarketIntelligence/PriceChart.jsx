import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PriceChart = ({ prices, timeframe }) => {
  console.log('Prices received in chart:', prices, 'timeframe:', timeframe);

  if (!prices || prices.length === 0) {
    return (
      <div className='text-center text-gray-500 p-4'>
        No price data available
      </div>
    );
  }

  // Sort prices by timestamp
  const sortedPrices = [...prices].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Format time based on timeframe
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    switch (timeframe) {
      case 'Intraday':
        return `${date.getHours()}:${String(date.getMinutes()).padStart(
          2,
          '0'
        )}`;
      case 'Swing':
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
      case 'Position':
        return `${date.getMonth() + 1}/${date.getDate()}`;
      default:
        return date.toLocaleString();
    }
  };

  // Get candle timeframe label
  const getCandleLabel = (timeframe) => {
    switch (timeframe) {
      case 'Intraday':
        return 'M15 candles';
      case 'Swing':
        return 'H1 candles';
      case 'Position':
        return '1D candles';
      default:
        return 'M15 candles';
    }
  };

  return (
    <div className='space-y-2'>
      <div className='h-[400px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={sortedPrices}
            margin={{
              top: 5,
              right: 30,
              left: 60,
              bottom: 5,
            }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='timestamp' tickFormatter={formatTime} height={40} />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(4)}
              width={50}
              tickMargin={5}
            />
            <Tooltip
              labelFormatter={(timestamp) =>
                new Date(timestamp).toLocaleString()
              }
              formatter={(value) => [value.toFixed(4), 'Price']}
            />
            <Line
              type='monotone'
              dataKey='price'
              stroke='#8884d8'
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Add timeframe label */}
      <div className='text-center text-sm text-gray-400'>
        {getCandleLabel(timeframe)}
      </div>
    </div>
  );
};

export default PriceChart;
