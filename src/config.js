export const config = {
  api: {
    baseUrl: 'http://localhost:5002',
    tradingUrl: 'http://localhost:5002',
    timeout: 5000,
  },
  app: {
    name: 'Trading Dashboard',
    version: process.env.npm_package_version,
  },
};
