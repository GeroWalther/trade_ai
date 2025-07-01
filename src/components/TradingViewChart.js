import React, { useRef, useEffect, useState } from 'react';

const TradingViewChart = ({ symbol, theme = 'dark' }) => {
  const containerRef = useRef();
  const [widgetId] = useState(
    () => `tradingview_${Math.random().toString(36).substr(2, 9)}`
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Add a random delay to prevent simultaneous initialization
    const initDelay = Math.random() * 300 + 100;

    const timer = setTimeout(() => {
      try {
        const widgetContainer = containerRef.current.querySelector(
          '.tradingview-widget-container__widget'
        );
        if (!widgetContainer) return;

        // Clear any existing content in the widget container
        widgetContainer.innerHTML = '';

        // Create script element
        const script = document.createElement('script');
        script.src =
          'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.type = 'text/javascript';

        // Configuration for the widget
        const config = {
          autosize: true,
          symbol: symbol,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          calendar: false,
          support_host: 'https://www.tradingview.com',
        };

        // Add configuration as script content
        script.innerHTML = JSON.stringify(config);

        // Handle load events
        script.onload = () => {
          console.log(`TradingView widget loaded for ${symbol}`);
          setTimeout(() => setIsLoaded(true), 1000); // Give it time to render
        };

        script.onerror = (err) => {
          console.warn(`TradingView widget failed to load for ${symbol}:`, err);
          setError(true);
        };

        // Append script to the widget container (this is what TradingView expects)
        widgetContainer.appendChild(script);
      } catch (error) {
        console.warn('Error initializing TradingView widget:', error);
        setError(true);
      }
    }, initDelay);

    return () => {
      clearTimeout(timer);
      setIsLoaded(false);
      setError(false);
    };
  }, [symbol, theme, widgetId]);

  // Show error state if widget fails to load
  if (error) {
    return (
      <div
        className='tradingview-widget-container'
        style={{ height: '400px', width: '100%' }}>
        <div className='flex items-center justify-center h-full bg-gray-800 rounded border border-red-500'>
          <div className='text-center text-red-400'>
            <div className='text-4xl mb-2'>⚠️</div>
            <p className='text-sm'>Failed to load {symbol} chart</p>
            <p className='text-xs text-gray-500 mt-1'>
              Check network connection
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className='tradingview-widget-container'
      ref={containerRef}
      style={{ height: '400px', width: '100%', position: 'relative' }}>
      {/* Widget container */}
      <div
        className='tradingview-widget-container__widget'
        id={widgetId}
        style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>

      {/* Copyright */}
      <div
        className='tradingview-widget-copyright'
        style={{
          fontSize: '13px',
          lineHeight: '32px',
          textAlign: 'center',
          verticalAlign: 'middle',
          color: '#9598A1',
        }}>
        <a
          href={`https://www.tradingview.com/symbols/${symbol}/`}
          rel='noopener nofollow'
          target='_blank'
          style={{ color: '#9598A1', textDecoration: 'none' }}>
          <span style={{ color: '#1848CC' }}>{symbol} Chart</span>
        </a>{' '}
        by TradingView
      </div>

      {/* Loading overlay */}
      {!isLoaded && !error && (
        <div
          className='absolute inset-0 flex items-center justify-center bg-gray-800 rounded'
          style={{ backgroundColor: 'rgba(26, 31, 60, 0.9)' }}>
          <div className='text-center text-gray-400'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2'></div>
            <p className='text-sm'>Loading {symbol}...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingViewChart;
