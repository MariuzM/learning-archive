const path = require('path')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: 'development',
  // target: 'web',

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../build'),
    publicPath: '/',
  },
  devServer: {
    // port: 9000,
    writeToDisk: true,
    historyApiFallback: true,
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

    // proxy: {
    //   '/.netlify': {
    //     target: 'http://localhost:9000',
    //     pathRewrite: { '^/.netlify/functions': '' },
    //   },
    // },

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
      // {
      //   test: /\.(css|scss)$/,
      //   use: ['style-loader', 'css-loader', 'sass-loader'],
      // },
      // {
      //   test: /\.css$/,
      //   use: [
      //     'style-loader',
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         importLoaders: 1,
      //         modules: true,
      //       },
      //     },
      //   ],
      //   include: /\.module\.css$/,
      // },
      // {
      //   test: /\.css$/,
      //   use: ['style-loader', 'css-loader'],
      //   exclude: /\.module\.css$/,
      // },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
    ],
  },
})
