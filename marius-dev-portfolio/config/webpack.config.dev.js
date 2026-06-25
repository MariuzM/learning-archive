const path = require('path')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: 'development',

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../../server/public'),
    // publicPath: '/',
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
    historyApiFallback: true,
    writeToDisk: true,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // favicon: './src/favicon.ico'
    }),
    new Dotenv(),
  ],

  module: {
    rules: [
      // {
      //   test: /\.scss$/,
      //   use: ['style-loader', 'css-loader', 'sass-loader'],
      // },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
    ],
  },
})
