import React, { useState, useEffect } from 'react';
import marketIntelligenceService from '../services/market_intelligence';

const TrendIndicator = ({ trend }) => {
  const color = trend.includes('↗')
    ? 'text-green-400'
    : trend.includes('↘')
    ? 'text-red-400'
    : 'text-blue-300';
  return <span className={color}>{trend}</span>;
};

const DataCard = ({ title, data, className = '' }) => (
  <div className={`bg-[#232a4d] p-4 rounded-lg ${className}`}>
    <h3 className='text-blue-300 text-sm mb-3'>{title}</h3>
    {data}
  </div>
);

const NewsCard = ({ article, showRelatedData = false }) => (
  <div className='bg-[#232a4d] rounded-lg overflow-hidden hover:bg-[#2a325a] transition-colors'>
    <a
      onClick={(e) => {
        e.preventDefault();
        // Check if electron bridge is available, otherwise fallback to window.open
        if (window.electron) {
          window.electron.openExternal(article.url);
        } else {
          window.open(article.url, '_blank', 'noopener,noreferrer');
        }
      }}
      href={article.url} // Keep href for accessibility and right-click options
      className='block'>
      {/* Remove image to avoid 404s */}
      <div className='p-4'>
        <h4 className='text-lg font-semibold text-blue-100 mb-2'>
          {article.headline}
        </h4>
        <p className='text-sm text-gray-300 mb-3'>{article.summary}</p>
        <div className='flex justify-between items-center text-xs text-gray-400'>
          <span>{new Date(article.timestamp).toLocaleString()}</span>
          <div className='flex items-center space-x-2'>
            <span className='text-xs font-medium px-2 py-1 rounded-full bg-blue-500/80 text-white'>
              {article.source}
            </span>
            <span className='text-blue-300 hover:text-blue-200'>
              Read more →
            </span>
          </div>
        </div>
      </div>
    </a>

    {showRelatedData && article.related_data && (
      <div className='px-4 pb-4 border-t border-blue-900/30 mt-2 pt-2'>
        <div className='text-xs text-gray-400 space-y-1'>
          {Object.entries(article.related_data).map(([key, value]) => (
            <div key={key} className='flex justify-between'>
              <span className='capitalize'>{key.replace('_', ' ')}:</span>
              <span className='text-blue-300'>{value}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const SkeletonCard = () => (
  <div className='bg-[#232a4d] p-4 rounded-lg animate-pulse'>
    <div className='h-3 w-24 bg-blue-900/50 rounded mb-4'></div>
    <div className='space-y-3'>
      <div className='h-4 bg-blue-900/50 rounded w-full'></div>
      <div className='h-4 bg-blue-900/50 rounded w-5/6'></div>
      <div className='h-4 bg-blue-900/50 rounded w-4/6'></div>
    </div>
  </div>
);

const NewsSkeletonCard = () => (
  <div className='bg-[#232a4d] rounded-lg overflow-hidden animate-pulse'>
    <div className='aspect-video bg-blue-900/50'></div>
    <div className='p-4 space-y-3'>
      <div className='h-4 bg-blue-900/50 rounded w-3/4'></div>
      <div className='h-3 bg-blue-900/50 rounded w-full'></div>
      <div className='h-3 bg-blue-900/50 rounded w-5/6'></div>
      <div className='flex justify-between'>
        <div className='h-2 bg-blue-900/50 rounded w-20'></div>
        <div className='h-2 bg-blue-900/50 rounded w-16'></div>
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className='bg-[#1a1f3c] p-6 rounded-lg space-y-6'>
    {/* Fake tabs */}
    <div className='flex space-x-4 border-b border-blue-900'>
      {['Overview', 'Markets', 'Economy', 'News', 'Global', 'Commodities'].map(
        (tab) => (
          <div key={tab} className='px-4 py-2'>
            <div className='h-2 w-16 bg-blue-900/50 rounded animate-pulse'></div>
          </div>
        )
      )}
    </div>

    {/* Loading grid */}
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <div className='md:col-span-2 lg:col-span-3'>
        <SkeletonCard />
      </div>
      <div className='lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4'>
        <NewsSkeletonCard />
        <NewsSkeletonCard />
        <NewsSkeletonCard />
      </div>
    </div>
  </div>
);

const LoadingIndicator = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-32 w-32 border-4',
  };

  return (
    <div className='flex items-center justify-center p-4'>
      <div
        className={`animate-spin rounded-full border-b-blue-500 ${sizeClasses[size]}`}></div>
    </div>
  );
};

const DailyMovers = ({ data }) => {
  if (!data) return null; // Don't render if no data

  return (
    <div className='space-y-6'>
      {/* Stocks */}
      {data.stocks && ( // Check if stocks data exists
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {data.stocks.gainers?.length > 0 && ( // Check if gainers exist
            <DataCard
              title='Top Gainers'
              data={
                <div className='space-y-2'>
                  {data.stocks.gainers.map((stock) => (
                    <div
                      key={stock.symbol}
                      className='group hover:bg-blue-900/30 p-2 rounded transition-colors'>
                      <div className='flex justify-between items-center'>
                        <div>
                          <span className='font-medium'>{stock.symbol}</span>
                          <span className='text-xs text-gray-400 ml-2'>
                            {stock.sector}
                          </span>
                        </div>
                        <div className='text-green-400'>+{stock.change}%</div>
                      </div>
                      <div className='text-xs text-gray-400 mt-1 flex justify-between'>
                        <span>${stock.price}</span>
                        <span>Vol: {stock.volume}</span>
                      </div>
                      <div className='text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors'>
                        {stock.news}
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          )}

          {data.stocks.losers?.length > 0 && ( // Check if losers exist
            <DataCard
              title='Top Losers'
              data={
                <div className='space-y-2'>
                  {data.stocks.losers.map((stock) => (
                    <div
                      key={stock.symbol}
                      className='group hover:bg-blue-900/30 p-2 rounded transition-colors'>
                      <div className='flex justify-between items-center'>
                        <div>
                          <span className='font-medium'>{stock.symbol}</span>
                          <span className='text-xs text-gray-400 ml-2'>
                            {stock.sector}
                          </span>
                        </div>
                        <div className='text-red-400'>{stock.change}%</div>
                      </div>
                      <div className='text-xs text-gray-400 mt-1 flex justify-between'>
                        <span>${stock.price}</span>
                        <span>Vol: {stock.volume}</span>
                      </div>
                      <div className='text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors'>
                        {stock.news}
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          )}
        </div>
      )}

      {/* Forex & Crypto */}
      {(data.forex?.movers?.length > 0 || data.crypto?.movers?.length > 0) && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {data.forex?.movers?.length > 0 && (
            <DataCard
              title='Forex Movers'
              data={
                <div className='space-y-2'>
                  {data.forex.movers.map((pair) => (
                    <div
                      key={pair.pair}
                      className='flex justify-between items-center p-2 hover:bg-blue-900/30 rounded'>
                      <div>
                        <span className='font-medium'>{pair.pair}</span>
                        <span className='text-xs text-gray-400 ml-2'>
                          ({pair.volatility})
                        </span>
                      </div>
                      <div>
                        <span
                          className={
                            pair.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }>
                          {pair.change >= 0 ? '+' : ''}
                          {pair.change}%
                        </span>
                        <span className='text-xs text-gray-400 ml-2'>
                          {pair.event}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          )}

          {data.crypto?.movers?.length > 0 && (
            <DataCard
              title='Crypto Movers'
              data={
                <div className='space-y-2'>
                  {data.crypto.movers.map((crypto) => (
                    <div
                      key={crypto.symbol}
                      className='flex justify-between items-center p-2 hover:bg-blue-900/30 rounded'>
                      <div>
                        <span className='font-medium'>{crypto.name}</span>
                        <span className='text-xs text-gray-400 ml-2'>
                          ${crypto.price.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span
                          className={
                            crypto.change >= 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }>
                          {crypto.change >= 0 ? '+' : ''}
                          {crypto.change}%
                        </span>
                        <span className='text-xs text-gray-400 ml-2'>
                          {crypto.event}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

const MarketIntelligence = () => {
  const [marketData, setMarketData] = useState({
    market_data: {
      indices: {},
      indicators: {},
      volatility: {},
      market_breadth: {},
      sectors: {},
    },
    next_events: [],
    analysis: '',
    global_data: {
      currencies: {},
      currency_strength: {},
      indices: {},
    },
    daily_movers: null,
    news: {
      featured_news: [],
      categories: {
        markets: [],
        economy: [],
        global: [],
        commodities: [],
        crypto: [],
      },
    },
    commodities_data: {
      indices: {},
      growth: {},
      inflation: {},
      ai_analysis: '',
    },
    timestamp: null,
    next_update: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sectionLoading, setSectionLoading] = useState({
    overview: false,
    markets: false,
    economy: false,
    global: false,
    commodities: false,
  });

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const data = await marketIntelligenceService.getMarketAnalysis();
      setMarketData(data);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId);
    setSectionLoading((prev) => ({ ...prev, [tabId]: true }));
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSectionLoading((prev) => ({ ...prev, [tabId]: false }));
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className='bg-rose-900 p-6 rounded-lg space-y-4'>
        <h3 className='text-xl font-bold text-rose-200'>Error</h3>
        <div className='space-y-2 text-rose-200'>
          <p className='font-semibold'>{error.message}</p>
          {error.response?.data && (
            <div className='mt-4'>
              <p className='text-sm text-rose-300 mb-2'>Details:</p>
              <pre className='bg-rose-950 p-4 rounded overflow-x-auto text-sm'>
                {JSON.stringify(error.response.data, null, 2)}
              </pre>
            </div>
          )}
          <button
            onClick={fetchMarketData}
            className='mt-4 px-4 py-2 bg-rose-800 hover:bg-rose-700 rounded text-rose-100'>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'markets', label: 'Markets & Stocks' },
    { id: 'economy', label: 'Economy' },
    { id: 'global', label: 'Global' },
    { id: 'commodities', label: 'Commodities & Crypto' },
  ];

  const renderOverviewTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <DataCard
          title='Market Summary'
          data={
            <div className='space-y-2'>
              {marketData?.market_data?.indices ? (
                Object.entries(marketData.market_data.indices).map(
                  ([index, data]) => (
                    <div
                      key={index}
                      className='flex justify-between items-center'>
                      <span>{index}</span>
                      <div>
                        <span
                          className={
                            data.value >= 0 ? 'text-green-400' : 'text-red-400'
                          }>
                          {data.value.toFixed(2)}
                        </span>
                        <TrendIndicator trend={data.trend} />
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className='text-gray-400'>Loading market data...</div>
              )}
            </div>
          }
        />

        <DataCard
          title='Key Indicators'
          data={
            <div className='space-y-2'>
              {marketData?.market_data?.indicators ? (
                Object.entries(marketData.market_data.indicators).map(
                  ([name, data]) => (
                    <div
                      key={name}
                      className='flex justify-between items-center'>
                      <span>{name}</span>
                      <div>
                        <span>{data.value.toFixed(1)}%</span>
                        <TrendIndicator trend={data.trend} />
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className='text-gray-400'>Loading indicators...</div>
              )}
            </div>
          }
        />

        <DataCard
          title='Next Events'
          data={
            <div className='space-y-2'>
              {marketData?.next_events ? (
                marketData.next_events.map((event, index) => (
                  <div key={index} className='text-sm'>
                    <div className='flex justify-between'>
                      <span>{event.event}</span>
                      <span className='text-blue-300'>
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='text-xs text-gray-400'>
                      Current: {event.current} → Expected: {event.expected}
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-gray-400'>Loading events...</div>
              )}
            </div>
          }
        />

        {/* Analysis Card */}
        {marketData?.analysis && (
          <DataCard
            title='Analysis'
            className='md:col-span-2 lg:col-span-3'
            data={
              <div className='prose prose-invert max-w-none'>
                <div
                  dangerouslySetInnerHTML={{ __html: marketData.analysis }}
                />
              </div>
            }
          />
        )}

        {/* Forex Card */}
        {marketData?.global_data?.currencies && (
          <DataCard
            title='Major Forex Pairs'
            data={
              <div className='space-y-2'>
                {Object.entries(marketData.global_data.currencies).map(
                  ([pair, data]) => (
                    <div
                      key={pair}
                      className='flex justify-between items-center'>
                      <span className='flex items-center'>
                        {pair}
                        <span className='text-xs text-gray-400 ml-2'>
                          ({data.volatility})
                        </span>
                      </span>
                      <div>
                        <span
                          className={
                            data.trend.includes('↗')
                              ? 'text-green-400'
                              : 'text-red-400'
                          }>
                          {data.value.toFixed(4)}
                        </span>
                        <TrendIndicator trend={data.trend} />
                      </div>
                    </div>
                  )
                )}
              </div>
            }
          />
        )}
      </div>

      {/* Featured News Section - Now with 4 articles */}
      {marketData?.news?.featured_news?.length > 0 && (
        <div className='border-t border-blue-900/50 pt-6 mt-6'>
          <h2 className='text-xl font-semibold text-blue-200 mb-4'>
            Featured News
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {marketData.news.featured_news.slice(0, 4).map((article, index) => (
              <NewsCard key={index} article={article} showRelatedData={true} />
            ))}
          </div>
        </div>
      )}

      {/* Daily Movers Section */}
      {marketData?.daily_movers && (
        <div className='border-t border-blue-900/50 pt-6 mt-6'>
          <h2 className='text-xl font-semibold text-blue-200 mb-4'>
            Daily Top Movers
          </h2>
          <DailyMovers data={marketData.daily_movers} />
        </div>
      )}
    </div>
  );

  const renderMarketsTab = () => (
    <div className='space-y-6'>
      {/* Market Performance */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <DataCard
          title='Major Indices'
          data={
            <div className='space-y-2'>
              {marketData?.market_data?.indices ? (
                Object.entries(marketData.market_data.indices).map(
                  ([index, data]) => (
                    <div
                      key={index}
                      className='flex justify-between items-center'>
                      <span>{index}</span>
                      <div>
                        <span
                          className={
                            data.value >= 0 ? 'text-green-400' : 'text-red-400'
                          }>
                          {data.value.toFixed(2)}
                        </span>
                        <span className='text-gray-400 text-sm ml-2'>
                          PE: {data.pe_ratio}
                        </span>
                        <TrendIndicator trend={data.trend} />
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className='text-gray-400'>Loading indices data...</div>
              )}
            </div>
          }
        />

        <DataCard
          title='Sector Performance'
          data={
            <div className='space-y-2'>
              {marketData?.market_data?.sectors ? (
                Object.entries(marketData.market_data.sectors).map(
                  ([sector, data]) => (
                    <div
                      key={sector}
                      className='flex justify-between items-center'>
                      <span className='capitalize'>{sector}</span>
                      <div>
                        <span
                          className={
                            data.performance >= 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }>
                          {data.performance.toFixed(1)}%
                        </span>
                        <TrendIndicator trend={data.trend} />
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className='text-gray-400'>Loading sector data...</div>
              )}
            </div>
          }
        />

        <DataCard
          title='Market Conditions'
          data={
            <div className='space-y-2'>
              {marketData?.market_data?.volatility?.VIX ? (
                <>
                  <div className='flex justify-between items-center'>
                    <span>VIX</span>
                    <div>
                      <span>{marketData.market_data.volatility.VIX.value}</span>
                      <TrendIndicator
                        trend={marketData.market_data.volatility.VIX.trend}
                      />
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Adv/Decl Ratio</span>
                    <span>
                      {marketData.market_data.market_breadth?.advance_decline ||
                        'N/A'}
                    </span>
                  </div>
                </>
              ) : (
                <div className='text-gray-400'>
                  Loading market conditions...
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Market Analysis */}
      {marketData?.market_data?.ai_analysis && (
        <DataCard
          title='Market Analysis'
          className='lg:col-span-3'
          data={
            <div className='prose prose-invert max-w-none'>
              <div
                dangerouslySetInnerHTML={{
                  __html: marketData.market_data.ai_analysis,
                }}
              />
            </div>
          }
        />
      )}

      {/* Market News - At least 2 articles */}
      {marketData?.news?.categories?.markets?.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {marketData.news.categories.markets
            .slice(0, 2)
            .map((article, index) => (
              <NewsCard key={index} article={article} showRelatedData={true} />
            ))}
        </div>
      )}
    </div>
  );

  const renderEconomyTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <DataCard
          title='Growth & Employment'
          data={
            <div className='space-y-2'>
              {marketData?.gdp && marketData?.employment ? (
                <>
                  <div className='flex justify-between items-center'>
                    <span>GDP Growth</span>
                    <div>
                      <span>{marketData.gdp.growth_rate.value}%</span>
                      <TrendIndicator
                        trend={marketData.gdp.growth_rate.trend}
                      />
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Unemployment</span>
                    <div>
                      <span>
                        {marketData.employment.unemployment_rate.value}%
                      </span>
                      <TrendIndicator
                        trend={marketData.employment.unemployment_rate.trend}
                      />
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Wage Growth</span>
                    <div>
                      <span>{marketData.employment.wage_growth.value}%</span>
                      <TrendIndicator
                        trend={marketData.employment.wage_growth.trend}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className='text-gray-400'>Loading economic data...</div>
              )}
            </div>
          }
        />

        <DataCard
          title='Inflation Metrics'
          data={
            <div className='space-y-2'>
              {marketData?.inflation ? (
                Object.entries(marketData.inflation).map(([metric, data]) => (
                  <div
                    key={metric}
                    className='flex justify-between items-center'>
                    <span className='capitalize'>
                      {metric.replace('_', ' ')}
                    </span>
                    <div>
                      <span>{data.value}%</span>
                      <TrendIndicator trend={data.trend} />
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-gray-400'>Loading inflation data...</div>
              )}
            </div>
          }
        />

        <DataCard
          title='Consumer Health'
          data={
            <div className='space-y-2'>
              {marketData?.consumer ? (
                Object.entries(marketData.consumer).map(([metric, data]) => (
                  <div
                    key={metric}
                    className='flex justify-between items-center'>
                    <span className='capitalize'>
                      {metric.replace('_', ' ')}
                    </span>
                    <div>
                      <span>{data.value}</span>
                      <TrendIndicator trend={data.trend} />
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-gray-400'>Loading consumer data...</div>
              )}
            </div>
          }
        />
      </div>

      {/* Economic News */}
      {marketData?.news?.categories?.economy?.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {marketData.news.categories.economy.map((article, index) => (
            <NewsCard key={index} article={article} showRelatedData={true} />
          ))}
        </div>
      )}
    </div>
  );

  const renderGlobalTab = () => (
    <div className='space-y-6'>
      {/* Currency Markets Section */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* Major Pairs */}
        <DataCard
          title='Major Currency Pairs'
          data={
            <div className='space-y-2'>
              {marketData?.global_data?.currencies ? (
                Object.entries(marketData.global_data.currencies)
                  .filter(([pair]) =>
                    ['EUR', 'JPY', 'GBP', 'CHF'].includes(pair)
                  )
                  .map(([pair, data]) => (
                    <div
                      key={pair}
                      className='flex justify-between items-center p-2 hover:bg-blue-900/30 rounded'>
                      <span className='flex items-center'>
                        {pair}/USD
                        <span
                          className={`text-xs ml-2 ${
                            data.volatility === 'high'
                              ? 'text-red-400'
                              : data.volatility === 'medium'
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}>
                          Vol: {data.volatility}
                        </span>
                      </span>
                      <div className='flex items-center space-x-2'>
                        <span>{data.value.toFixed(4)}</span>
                        <TrendIndicator trend={data.trend} />
                        <span className='text-xs text-gray-400'>
                          ({data.daily_change}%)
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className='text-gray-400'>Loading currency data...</div>
              )}
            </div>
          }
        />

        {/* Asian & Emerging Pairs */}
        <DataCard
          title='Asian & Emerging Markets'
          data={
            <div className='space-y-2'>
              {marketData?.global_data?.currencies ? (
                Object.entries(marketData.global_data.currencies)
                  .filter(([pair]) =>
                    ['CNY', 'AUD', 'NZD', 'SGD', 'INR', 'KRW'].includes(pair)
                  )
                  .map(([pair, data]) => (
                    <div
                      key={pair}
                      className='flex justify-between items-center p-2 hover:bg-blue-900/30 rounded'>
                      <span className='flex items-center'>
                        {pair}/USD
                        <span
                          className={`text-xs ml-2 ${
                            data.volatility === 'high'
                              ? 'text-red-400'
                              : data.volatility === 'medium'
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}>
                          Vol: {data.volatility}
                        </span>
                      </span>
                      <div className='flex items-center space-x-2'>
                        <span>{data.value.toFixed(4)}</span>
                        <TrendIndicator trend={data.trend} />
                        <span className='text-xs text-gray-400'>
                          ({data.daily_change}%)
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className='text-gray-400'>Loading currency data...</div>
              )}
            </div>
          }
        />

        {/* Currency Strength with Enhanced Visualization */}
        <DataCard
          title='Currency Strength'
          data={
            <div className='space-y-2'>
              {marketData?.global_data?.currency_strength ? (
                Object.entries(marketData.global_data.currency_strength).map(
                  ([currency, data]) => (
                    <div
                      key={currency}
                      className='flex justify-between items-center p-2 hover:bg-blue-900/30 rounded'>
                      <div className='flex items-center space-x-2'>
                        <span>{currency}</span>
                        <TrendIndicator trend={data.trend} />
                      </div>
                      <div className='flex items-center space-x-2'>
                        <div className='w-24 bg-gray-700 rounded-full h-2'>
                          <div
                            className={`h-full rounded-full ${
                              data.strength > 66
                                ? 'bg-green-500'
                                : data.strength > 33
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${data.strength}%` }}
                          />
                        </div>
                        <span className='text-xs'>{data.strength}%</span>
                        <span className='text-xs text-gray-400'>
                          ({data.weekly_change}%)
                        </span>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className='text-gray-400'>Loading strength data...</div>
              )}
            </div>
          }
        />
      </div>

      {/* Global Economic Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <DataCard
          title='Global Growth'
          data={
            <div className='space-y-2'>
              {marketData?.global_data?.growth ? (
                Object.entries(marketData.global_data.growth).map(
                  ([region, data]) => (
                    <div
                      key={region}
                      className='flex justify-between items-center p-2 hover:bg-blue-900/30 rounded'>
                      <span className='capitalize'>
                        {region.replace('_', ' ')}
                      </span>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={
                            data.value >= 0 ? 'text-green-400' : 'text-red-400'
                          }>
                          {data.value}%
                        </span>
                        <TrendIndicator trend={data.trend} />
                        <span className='text-xs text-gray-400'>
                          (Forecast: {data.forecast}%)
                        </span>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className='text-gray-400'>Loading growth data...</div>
              )}
            </div>
          }
        />

        <DataCard
          title='Global Trade'
          data={
            <div className='space-y-2'>
              {marketData?.global_data?.trade ? (
                Object.entries(marketData.global_data.trade).map(
                  ([metric, data]) => (
                    <div
                      key={metric}
                      className='flex justify-between items-center p-2 hover:bg-blue-900/30 rounded'>
                      <span className='capitalize'>
                        {metric.replace('_', ' ')}
                      </span>
                      <div className='flex items-center space-x-2'>
                        <span>{data.value}</span>
                        <TrendIndicator trend={data.trend} />
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className='text-gray-400'>Loading trade data...</div>
              )}
            </div>
          }
        />

        <DataCard
          title='Central Bank Rates'
          data={
            <div className='space-y-2'>
              {marketData?.global_data?.central_banks ? (
                Object.entries(marketData.global_data.central_banks).map(
                  ([bank, data]) => (
                    <div
                      key={bank}
                      className='flex justify-between items-center p-2 hover:bg-blue-900/30 rounded'>
                      <span>{bank}</span>
                      <div className='flex items-center space-x-2'>
                        <span>{data.rate}%</span>
                        <span className='text-xs text-gray-400'>
                          Next:{' '}
                          {new Date(data.next_meeting).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className='text-gray-400'>Loading bank data...</div>
              )}
            </div>
          }
        />
      </div>

      {/* Rest of the Global tab content */}
    </div>
  );

  const renderCommoditiesTab = () => (
    <div className='space-y-6'>
      {/* Commodities Performance */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <DataCard
          title='Commodities'
          data={
            <div className='space-y-2'>
              {marketData?.commodities_data?.indices ? (
                Object.entries(marketData.commodities_data.indices).map(
                  ([index, data]) => (
                    <div
                      key={index}
                      className='flex justify-between items-center'>
                      <span>{index}</span>
                      <div>
                        <span
                          className={
                            data.value >= 0 ? 'text-green-400' : 'text-red-400'
                          }>
                          {data.value.toFixed(2)}
                        </span>
                        <TrendIndicator trend={data.trend} />
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className='text-gray-400'>Loading commodities data...</div>
              )}
            </div>
          }
        />

        <DataCard
          title='Commodities Conditions'
          data={
            <div className='space-y-2'>
              {marketData?.commodities_data?.growth ? (
                <>
                  <div className='flex justify-between items-center'>
                    <span>Commodities Growth</span>
                    <div>
                      <span>{marketData.commodities_data.growth.value}%</span>
                      <TrendIndicator
                        trend={marketData.commodities_data.growth.trend}
                      />
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span>Commodities Inflation</span>
                    <div>
                      <span>
                        {marketData.commodities_data.inflation.value}%
                      </span>
                      <TrendIndicator
                        trend={marketData.commodities_data.inflation.trend}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className='text-gray-400'>Loading conditions data...</div>
              )}
            </div>
          }
        />
      </div>

      {/* Commodities Analysis */}
      {marketData?.commodities_data?.ai_analysis && (
        <DataCard
          title='Commodities Analysis'
          className='lg:col-span-3'
          data={
            <div className='prose prose-invert max-w-none'>
              <div
                dangerouslySetInnerHTML={{
                  __html: marketData.commodities_data.ai_analysis,
                }}
              />
            </div>
          }
        />
      )}

      {/* Commodities News */}
      {marketData?.news?.categories?.commodities?.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {marketData.news.categories.commodities.map((article, index) => (
            <NewsCard key={index} article={article} showRelatedData={true} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className='bg-[#1a1f3c] p-6 rounded-lg space-y-6'>
      {/* Tab Navigation */}
      <div className='flex space-x-4 border-b border-blue-900'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-blue-300 border-b-2 border-blue-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => handleTabChange(tab.id)}
            disabled={loading}>
            <div className='flex items-center space-x-2'>
              {tab.label}
              {sectionLoading[tab.id] && <LoadingIndicator size='small' />}
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='mt-6 relative'>
        {sectionLoading[activeTab] ? (
          <LoadingState />
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'markets' && renderMarketsTab()}
            {activeTab === 'economy' && renderEconomyTab()}
            {activeTab === 'global' && renderGlobalTab()}
            {activeTab === 'commodities' && renderCommoditiesTab()}
          </>
        )}
      </div>

      {/* Refresh Button & Update Time */}
      <div className='flex justify-between items-center text-xs text-gray-400 mt-4'>
        <div>
          Last updated: {new Date(marketData.timestamp).toLocaleString()}
          <br />
          Next update: {new Date(marketData.next_update).toLocaleString()}
        </div>
        <button
          onClick={fetchMarketData}
          className='flex items-center space-x-2 px-3 py-1 bg-blue-900/30 hover:bg-blue-900/50 rounded'
          disabled={loading}>
          {loading ? <LoadingIndicator size='small' /> : '↻'}
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default MarketIntelligence;
