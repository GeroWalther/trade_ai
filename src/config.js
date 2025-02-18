export const config = {
  api: {
    baseUrl: 'http://localhost:5003',
    tradingUrl: 'http://localhost:5004',
    botUrl: 'http://localhost:5004',
    timeout: 5000,
  },
  app: {
    name: 'Trading Dashboard',
    version: process.env.npm_package_version,
  },
};
