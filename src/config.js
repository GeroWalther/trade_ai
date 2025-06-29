export const config = {
  api: {
    baseUrl: 'http://localhost:5003', // Master Trading Bot server
    tradingUrl: 'http://localhost:5003', // Master Trading Bot server
    timeout: 30000, // 30 seconds for AI analysis
  },
  app: {
    name: 'Master Trading Bot',
    version: process.env.npm_package_version,
  },
  wsUrl: 'ws://localhost:5003', // WebSocket for real-time updates
};
