import React, { useRef, useEffect } from 'react';

const TradingViewChart = ({ symbol, theme = 'dark' }) => {
  const container = useRef();

  useEffect(() => {
    // Only load the widget if we're in the browser environment
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src =
        'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "${theme}",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`;

      // Clear any existing content
      if (container.current) {
        container.current.innerHTML = '';
        container.current.appendChild(script);
      }
    }
  }, [symbol, theme]);

  return (
    <div
      className='tradingview-widget-container'
      ref={container}
      style={{ height: '400px', width: '100%' }}>
      <div
        className='tradingview-widget-container__widget'
        style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
      <div className='tradingview-widget-copyright'>
        <a
          href={`https://www.tradingview.com/symbols/${symbol}/`}
          rel='noopener nofollow'
          target='_blank'>
          <span className='blue-text'>{symbol} Chart</span>
        </a>{' '}
        by TradingView
      </div>
    </div>
  );
};

export default TradingViewChart;
