import React, { useEffect, useRef } from 'react';

const TradingViewChart = ({ symbol, theme = 'dark' }) => {
  const container = useRef();

  useEffect(() => {
    const widgetConfig = {
      width: '100%',
      height: '800',
      symbol: symbol,
      interval: '15',
      timezone: 'exchange',
      theme: theme,
      style: '1',
      locale: 'en',
      enable_publishing: false,
      hide_top_toolbar: false,
      allow_symbol_change: true,
      save_image: true,
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      details: true,
      hotlist: true,
      calendar: true,
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
      drawings: {
        access: 'all',
        tools: [
          { name: 'measure' },
          { name: 'regression_trend' },
          { name: 'horz_line' },
          { name: 'horz_ray' },
          { name: 'vert_line' },
          { name: 'trend_line' },
          { name: 'arrow_up' },
          { name: 'arrow_down' },
          { name: 'price_label' },
          { name: 'text' },
        ],
      },
      studies: [
        'MASimple@tv-basicstudies',
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies',
      ],
      container_id: 'tradingview_chart',
      allow_script_access: true,
    };

    if (container.current) {
      // Clear previous content
      container.current.innerHTML = '';

      // Create widget container with specific ID
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';

      // Create the container for the chart with proper permissions
      const chartContainer = document.createElement('div');
      chartContainer.id = 'tradingview_chart';
      chartContainer.setAttribute('allow', 'fullscreen; clipboard-write');
      widgetContainer.appendChild(chartContainer);

      // Create and append the script with proper attributes
      const script = document.createElement('script');
      script.src =
        'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.innerHTML = JSON.stringify(widgetConfig);

      // Append elements to the container
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
    <div
      ref={container}
      className='tradingview-chart'
      style={{
        width: '100%',
        height: 'calc(100vh - 100px)',
        minHeight: '800px',
      }}
    />
  );
};

export default TradingViewChart;
