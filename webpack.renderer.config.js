const rules = require('./webpack.rules');

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules: [
      ...rules,
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    fallback: {
      path: false,
      fs: false,
      crypto: false,
    },
  },
  externals: {
    electron: 'commonjs electron',
  },
};
