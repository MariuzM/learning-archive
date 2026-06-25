const path = require('path')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: 'production',

  output: {
    filename: '[contentHash].js',
    path: path.resolve(__dirname, '../build'),
  },

  stats: {
    all: false,
    modules: true,
    moduleTrace: true,
    timings: true,
    errors: true,
    errorDetails: true,
  },

  optimization: {
    minimizer: [
      new OptimizeCssAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      }),
      new TerserPlugin({
        terserOptions: { output: { comments: false } },
        extractComments: false,
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true,
        },
      }),
    ],

    // splitChunks: {
    //   chunks: 'all',
    //   maxInitialRequests: Infinity,
    //   minSize: 0,
    //   cacheGroups: {
    //     vendor: {
    //       test: /[\\/]node_modules[\\/]/,
    //       name(module) {
    //         const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
    //         return `main.${packageName.replace('@', '')}`
    //       },
    //     },
    //   },
    // },
  },

  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[contentHash].css',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
})
