const path = require('path');
const common = require('./webpack.common');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  target: 'web',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  devServer: {
    stats: 'minimal',
    overlay: true,
    historyApiFallback: true
  },
  optimization: {
    minimizer: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: { removeAttributeQuotes: false, collapseWhitespace: false, removeComments: true }
      })
    ]
  }
});
