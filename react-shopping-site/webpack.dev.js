const path = require('path')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: 'development',
  // target: 'web',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    stats: {
      all: false,
      modules: true,
      maxModules: 0,
      warnings: true,
      moduleTrace: true,
      timings: true,
      errors: true,
      errorDetails: true,
    },
    // overlay: true,
    // historyApiFallback: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // favicon: './src/favicon.ico'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
})
