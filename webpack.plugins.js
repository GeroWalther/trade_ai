const webpack = require('webpack');

module.exports = [
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
]; 