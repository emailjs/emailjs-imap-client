const path = require('path')

module.exports = {
  entry: './src/compression-worker.js',
  output: {
    path: path.resolve(__dirname, 'res'),
    filename: 'compression.worker.js'
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['babel-preset-env']
        }
      }
    }]
  }
}
