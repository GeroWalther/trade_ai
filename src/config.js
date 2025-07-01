export const config = {
  api: {
    baseUrl: 'http://0.0.0.0:5004', // Master Trading Bot server
    backendUrl: 'http://0.0.0.0:5004/api', // Backend API base URL
    customBotsUrl: 'http://0.0.0.0:5004/api/custom-bots', // Custom Bots API
    timeout: 30000, // 30 seconds for AI analysis
  },
  app: {
    name: 'Master Trading Bot',
    version: process.env.npm_package_version,
  },
  wsUrl: 'ws://0.0.0.0:5004', // WebSocket for real-time updates
};
