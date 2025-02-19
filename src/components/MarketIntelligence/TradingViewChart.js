import React, { useEffect, useRef } from 'react';

const TradingViewChart = ({ symbol, theme = 'dark' }) => {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: '500',
      symbol: `FX:${symbol}`,
      interval: '15',
      timezone: 'exchange',
      theme: theme,
      style: '1',
      locale: 'en',
      enable_publishing: false,
      hide_top_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      studies: [
        'MASimple@tv-basicstudies',
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies',
      ],
      container_id: 'tradingview_chart',
    });

    if (container.current) {
      // Clear previous content
      container.current.innerHTML = '';

      // Create widget container with specific ID
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';
      widgetContainer.innerHTML = '<div id="tradingview_chart"></div>';

      container.current.appendChild(widgetContainer);
      widgetContainer.appendChild(script);
    }

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div className='tradingview-chart bg-[#1a1f3c] p-4 rounded-lg'>
      <div ref={container} style={{ height: '500px' }} />
    </div>
  );
};

export default TradingViewChart;
