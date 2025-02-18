const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5001', // Changed to 5001 to match api_server.py
    timeout: 5000,
  },
  app: {
    name: 'Trading Dashboard',
    version: process.env.npm_package_version,
  },
};

module.exports = { config };
