const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5002',
    tradingUrl: process.env.REACT_APP_TRADING_URL || 'http://localhost:5002',
    timeout: 5000,
  },
  app: {
    name: 'Trading Dashboard',
    version: process.env.npm_package_version,
  },
};

module.exports = { config };
