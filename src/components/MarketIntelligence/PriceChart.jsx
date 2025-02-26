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

const PriceChart = ({ prices }) => {
  console.log('Prices received in chart:', prices); // Debug log

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

  return (
    <div className='h-[400px] w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={sortedPrices}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='timestamp'
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return `${date.getHours()}:${String(date.getMinutes()).padStart(
                2,
                '0'
              )}`;
            }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(value) => value.toFixed(4)}
          />
          <Tooltip
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
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
  );
};

export default PriceChart;
