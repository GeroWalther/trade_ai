import React, { useState, useRef, useEffect } from 'react';
import analysisService from '../services/analysis_service';

export const AIAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isMockData, setIsMockData] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceValidation, setPriceValidation] = useState(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const cooldownTimerRef = useRef(null);
  const isRequestPendingRef = useRef(false);

  // Add state for user selections
  const [selectedAsset, setSelectedAsset] = useState('Nasdaq');
  const [selectedTerm, setSelectedTerm] = useState('Swing trade');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('aggressive');

  // Available options for dropdowns
  const assetOptions = [
    { value: 'Nasdaq', label: 'Nasdaq (NAS100/USD)' },
    { value: 'S&P500', label: 'S&P 500 (SPX500/USD)' },
    { value: 'Gold', label: 'Gold (XAU/USD)' },
    { value: 'EUR/USD', label: 'EUR/USD' },
    { value: 'USD/JPY', label: 'USD/JPY' },
    { value: 'BTCUSD', label: 'Bitcoin (BTC/USD)' },
  ];

  const termOptions = [
    { value: 'Day trade', label: 'Day Trade (1-2 days)' },
    { value: 'Swing trade', label: 'Swing Trade (1-2 weeks)' },
    { value: 'Position trade', label: 'Position Trade (1-3 months)' },
  ];

  const riskLevelOptions = [
    { value: 'conservative', label: 'Conservative' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'aggressive', label: 'Aggressive' },
  ];

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Start cooldown timer function
  const startCooldown = (seconds = 60) => {
    setCooldownActive(true);
    setCooldownTime(seconds);

    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setInterval(() => {
      setCooldownTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(cooldownTimerRef.current);
          setCooldownActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Validate if the trading strategy makes sense given current market prices
  const validatePricePoints = (strategy, currentMarketPrice) => {
    if (!strategy || !currentMarketPrice) return null;

    // Parse price strings to numbers for comparison
    const entryPrice = parseFloat(strategy.entry.price.replace(/,/g, ''));
    const stopLossPrice = parseFloat(
      strategy.stop_loss.price.replace(/,/g, '')
    );
    const takeProfit1Price = parseFloat(
      strategy.take_profit_1.price.replace(/,/g, '')
    );
    const takeProfit2Price = parseFloat(
      strategy.take_profit_2.price.replace(/,/g, '')
    );

    // Calculate percentage differences
    const entryDiff =
      ((entryPrice - currentMarketPrice) / currentMarketPrice) * 100;

    let validationMessage = '';
    let isValid = true;

    // Check if entry point is realistic (within 5% of current price)
    if (Math.abs(entryDiff) > 5) {
      validationMessage += `Entry price (${strategy.entry.price}) is ${Math.abs(
        entryDiff
      ).toFixed(2)}% ${
        entryDiff < 0 ? 'below' : 'above'
      } current market price. `;
      isValid = false;
    }

    // For LONG strategy
    if (strategy.direction === 'LONG') {
      // Stop loss should be below entry
      if (stopLossPrice >= entryPrice) {
        validationMessage +=
          'For a LONG position, stop loss should be below entry price. ';
        isValid = false;
      }

      // Take profits should be above entry
      if (takeProfit1Price <= entryPrice) {
        validationMessage +=
          'For a LONG position, take profit targets should be above entry price. ';
        isValid = false;
      }
    }
    // For SHORT strategy
    else if (strategy.direction === 'SHORT') {
      // Stop loss should be above entry
      if (stopLossPrice <= entryPrice) {
        validationMessage +=
          'For a SHORT position, stop loss should be above entry price. ';
        isValid = false;
      }

      // Take profits should be below entry
      if (takeProfit1Price >= entryPrice) {
        validationMessage +=
          'For a SHORT position, take profit targets should be below entry price. ';
        isValid = false;
      }
    }

    return {
      isValid,
      message:
        validationMessage ||
        'Price points appear valid based on current market conditions.',
      currentMarketPrice,
    };
  };

  const analyzeMarket = async () => {
    // Prevent multiple clicks or requests in progress
    if (isRequestPendingRef.current || loading || cooldownActive) {
      console.log(
        'Request already in progress or cooldown active, ignoring click'
      );
      return;
    }

    try {
      isRequestPendingRef.current = true;
      setLoading(true);
      setError(null);
      setIsMockData(false);
      setPriceValidation(null);
      setCurrentPrice(null);

      // Use selected values from dropdowns instead of hardcoded values
      const asset = selectedAsset;
      const term = selectedTerm;
      const riskLevel = selectedRiskLevel;

      console.log(
        `Starting market analysis for ${asset} (${term}, ${riskLevel})...`
      );

      // Call the advanced market analysis service - backend will fetch the price
      const result = await analysisService.advancedMarketAnalysis(
        asset,
        term,
        riskLevel
      );

      if (result.status === 'success') {
        setAnalysis(result.data);
        console.log('Full analysis data:', result.data);

        // Check if this is mock data
        if (result.mock) {
          setIsMockData(true);
          console.log('Displaying mock data');
        }

        // Get current price from the response
        if (result.data.current_market_price) {
          const price = result.data.current_market_price;
          console.log(
            `Current ${asset} price from backend:`,
            price,
            typeof price
          );

          // Ensure price is a number
          const numericPrice =
            typeof price === 'string'
              ? parseFloat(price.replace(/,/g, ''))
              : price;
          console.log('Numeric price:', numericPrice);

          if (!isNaN(numericPrice)) {
            setCurrentPrice(numericPrice);

            // Validate the strategy against the current price
            const validation = validatePricePoints(
              result.data.trading_strategy,
              numericPrice
            );
            setPriceValidation(validation);
          } else {
            console.error('Invalid price format received:', price);
            setError('Invalid price data received from server');
          }
        } else {
          console.warn('No current market price in the response');
        }
      } else {
        // Handle error from backend
        console.error('Error from backend:', result.message);
        setError(result.message || 'Failed to analyze market');

        // If there's a specific error about rate limiting or market data
        if (
          result.isRateLimit ||
          (result.message && result.message.includes('Rate limit exceeded'))
        ) {
          setError(
            'Yahoo Finance API rate limit exceeded. Please try again in 60 seconds.'
          );
          // Start a cooldown timer to prevent further requests
          startCooldown(60);
        } else if (result.message && result.message.includes('market data')) {
          setError(
            'Unable to fetch current market data. Please try again later or check the console for more information.'
          );
        }
      }
    } catch (err) {
      console.error('Error analyzing market:', err);

      // Handle timeout errors specifically
      if (err.code === 'ECONNABORTED') {
        setError('The analysis is taking too long. Please try again later.');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
      isRequestPendingRef.current = false;
    }
  };

  // Helper function to render trading strategy details
  const renderTradingStrategy = (strategy) => {
    if (!strategy) return null;

    return (
      <div className='mt-4 bg-[#1a1f3c] p-4 rounded-lg'>
        <h4 className='text-xl font-semibold text-blue-300 mb-2'>
          Trading Strategy
          <span className='text-xs text-gray-400 ml-2 font-normal'>
            Generated on {new Date().toLocaleString()}
          </span>
        </h4>
        <div className='mb-2'>
          <span className='text-gray-300 font-medium'>Direction: </span>
          <span
            className={`font-bold ${
              strategy.direction === 'LONG' ? 'text-green-400' : 'text-red-400'
            }`}>
            {strategy.direction}
          </span>
        </div>
        <p className='text-gray-300 mb-3'>{strategy.rationale}</p>

        {currentPrice && (
          <div className='mb-3 bg-blue-900/30 p-2 rounded border border-blue-700'>
            <span className='text-blue-300 font-medium'>
              Current Market Price:{' '}
            </span>
            <span className='text-white font-bold'>
              {typeof currentPrice === 'number'
                ? currentPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : currentPrice}
            </span>
            <p className='text-gray-400 text-sm mt-1'>
              All price targets are relative to this current market price.
            </p>
          </div>
        )}

        {priceValidation && !priceValidation.isValid && (
          <div className='mb-3 bg-yellow-900/30 p-2 rounded border border-yellow-700'>
            <p className='text-yellow-300 font-medium'>
              Price Validation Warning:
            </p>
            <p className='text-yellow-100'>{priceValidation.message}</p>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-[#232a4d] p-3 rounded'>
            <h5 className='text-blue-300 font-medium'>Entry</h5>
            <div className='text-white font-bold'>{strategy.entry.price}</div>
            <p className='text-gray-400 text-sm'>{strategy.entry.rationale}</p>
          </div>

          <div className='bg-[#232a4d] p-3 rounded'>
            <h5 className='text-red-300 font-medium'>Stop Loss</h5>
            <div className='text-white font-bold'>
              {strategy.stop_loss.price}
            </div>
            <p className='text-gray-400 text-sm'>
              {strategy.stop_loss.rationale}
            </p>
          </div>

          <div className='bg-[#232a4d] p-3 rounded'>
            <h5 className='text-green-300 font-medium'>Take Profit 1</h5>
            <div className='text-white font-bold'>
              {strategy.take_profit_1.price}
            </div>
            <p className='text-gray-400 text-sm'>
              {strategy.take_profit_1.rationale}
            </p>
          </div>

          <div className='bg-[#232a4d] p-3 rounded'>
            <h5 className='text-green-300 font-medium'>Take Profit 2</h5>
            <div className='text-white font-bold'>
              {strategy.take_profit_2.price}
            </div>
            <p className='text-gray-400 text-sm'>
              {strategy.take_profit_2.rationale}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='bg-[#232a4d] p-6 rounded-lg'>
      <h2 className='text-2xl font-bold text-blue-300 mb-4'>
        AI Market Analysis
      </h2>
      <div className='bg-[#1a1f3c] p-6 rounded-lg mb-6'>
        <p className='text-gray-300 mb-4'>
          Get advanced market insights powered by our AI algorithms. Analyze
          trends, patterns, and potential trading opportunities.
        </p>

        {/* Add selection dropdowns */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div>
            <label className='block text-gray-300 mb-2'>Asset</label>
            <select
              className='w-full bg-[#2d3867] text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              disabled={loading || cooldownActive}>
              {assetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-gray-300 mb-2'>Trading Term</label>
            <select
              className='w-full bg-[#2d3867] text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              disabled={loading || cooldownActive}>
              {termOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-gray-300 mb-2'>Risk Level</label>
            <select
              className='w-full bg-[#2d3867] text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              disabled={loading || cooldownActive}>
              {riskLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className={`${
            loading
              ? 'bg-blue-800'
              : cooldownActive
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white py-2 px-4 rounded transition-colors flex items-center`}
          onClick={analyzeMarket}
          disabled={loading || cooldownActive}>
          {loading ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              Analyzing...
            </>
          ) : cooldownActive ? (
            <>
              <svg
                className='animate-pulse -ml-1 mr-3 h-5 w-5 text-white'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              Cooldown: {cooldownTime}s
            </>
          ) : (
            'Run AI Analysis'
          )}
        </button>
      </div>

      {error && (
        <div className='bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-6'>
          <p className='font-medium'>Error: {error}</p>
          {error.includes('Rate limit exceeded') && (
            <div className='mt-2 text-sm'>
              <p>
                Yahoo Finance limits the number of requests we can make to their
                API. This helps us:
              </p>
              <ul className='list-disc pl-5 mt-1'>
                <li>Avoid being blocked by their servers</li>
                <li>Ensure fair usage of their free data service</li>
                <li>Maintain reliable access for all users</li>
              </ul>
              <p className='mt-2'>
                The cooldown timer will let you know when it's safe to try
                again.
              </p>
            </div>
          )}
        </div>
      )}

      {analysis && !error && (
        <div className='bg-[#1a1f3c] p-6 rounded-lg'>
          {isMockData && (
            <div className='bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-3 rounded-lg mb-4'>
              <p className='font-medium'>
                Note: This is simulated data for demonstration purposes.
              </p>
            </div>
          )}

          <h3 className='text-xl font-bold text-blue-300 mb-3'>
            Market Analysis Results
          </h3>

          {/* Display metadata about the analysis sources */}
          {analysis.meta && (
            <div className='mb-4 bg-indigo-900/30 p-3 rounded border border-indigo-700'>
              <p className='text-indigo-300 font-medium'>
                Analysis Information
              </p>
              <p className='text-gray-300 text-sm mt-1'>
                Generated on:{' '}
                {analysis.meta.generated_at || new Date().toLocaleString()}
              </p>
              <p className='text-gray-300 text-sm'>
                Model: {analysis.meta.model || 'AI Analysis'}
              </p>
              {analysis.meta.note && (
                <p className='text-gray-300 text-sm mt-1'>
                  {analysis.meta.note}
                </p>
              )}
            </div>
          )}

          {currentPrice && (
            <div className='mb-4 bg-blue-900/30 p-3 rounded border border-blue-700'>
              <span className='text-blue-300 font-medium'>
                Analysis based on current{' '}
                {analysis.meta?.asset || selectedAsset} price:{' '}
              </span>
              <span className='text-white font-bold'>
                {typeof currentPrice === 'number'
                  ? currentPrice.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })
                  : currentPrice}
              </span>
              <p className='text-gray-400 text-sm mt-1'>
                Analysis generated on {new Date().toLocaleString()}
              </p>
            </div>
          )}

          <div className='mb-4'>
            <h4 className='text-lg font-semibold text-blue-300 mb-2'>
              Market Summary
            </h4>
            <p className='text-gray-300'>{analysis.market_summary}</p>
          </div>

          <div className='mb-4'>
            <h4 className='text-lg font-semibold text-blue-300 mb-2'>
              Key Drivers
            </h4>
            <ul className='list-disc pl-5'>
              {analysis.key_drivers.map((driver, index) => (
                <li key={index} className='text-gray-300 mb-1'>
                  {driver}
                </li>
              ))}
            </ul>
          </div>

          <div className='mb-4'>
            <h4 className='text-lg font-semibold text-blue-300 mb-2'>
              Technical Analysis
            </h4>
            <p className='text-gray-300'>{analysis.technical_analysis}</p>
          </div>

          <div className='mb-4'>
            <h4 className='text-lg font-semibold text-blue-300 mb-2'>
              Risk Assessment
            </h4>
            <p className='text-gray-300'>{analysis.risk_assessment}</p>
          </div>

          {renderTradingStrategy(analysis.trading_strategy)}
        </div>
      )}
    </div>
  );
};
