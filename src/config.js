export const config = {
  api: {
    baseUrl: 'http://localhost:5005', // AI Analysis server
    tradingUrl: 'http://localhost:5002', // Trading server
    timeout: 30000, // Increased from 5000 to 30000 (30 seconds) for AI analysis
  },
  app: {
    name: 'Trading Dashboard',
    version: process.env.npm_package_version,
  },
  wsUrl: 'ws://localhost:5002', // WebSocket for real-time updates
};
