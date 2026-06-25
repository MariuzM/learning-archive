const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: { main: './src/index.js' },
  plugins: [new CopyWebpackPlugin([{ from: 'src/assets/img', to: 'assets/img' }])],
  module: {
    rules: [
      // {
      //   test: /\.html$/,
      //   use: ['html-loader']
      // },
      {
        test: /\.(svg|png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: { name: '[name].[ext]' },
          // options: { name: '[name].[hash].[ext]', outputPath: 'img' }
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(eot|woff|woff2|ttf)([?]?.*)$/,
        // test: /\.(eot|woff|woff2|ttf)([\?]?.*)$/,
        use: ['file-loader'],
      },
      // {
      //   test: /\.svg$/,
      //   loader: 'react-inlinesvg'
      // }
    ],
  },

  resolve: { extensions: ['*', '.js', '.jsx'] },
}
