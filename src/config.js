export const config = {
  api: {
    baseUrl: 'http://localhost:5003', // AI Analysis server
    tradingUrl: 'http://localhost:5002', // Trading server
    timeout: 5000,
  },
  app: {
    name: 'Trading Dashboard',
    version: process.env.npm_package_version,
  },
  wsUrl: 'ws://localhost:5002', // WebSocket for real-time updates
};
