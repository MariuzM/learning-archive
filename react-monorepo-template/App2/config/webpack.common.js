// const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: { main: './src/index.jsx' },

  // plugins: [new CopyWebpackPlugin([{ from: 'src/projects', to: 'projects' }])],

  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },

  module: {
    rules: [
      // {
      //   test: /\.html$/,
      //   use: ['html-loader'],
      // },
      // {
      //   test: /\.css$/,
      //   use: [
      //     'style-loader',
      //     { loader: 'css-loader', options: { importLoaders: 1, modules: true } },
      //   ],
      //   include: /\.module\.css$/,
      // },
      // {
      //   test: /\.css$/,
      //   use: ['style-loader', 'css-loader'],
      //   exclude: /\.module\.css$/,
      // },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(svg|png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          // options: { name: '[name].[ext]' },
          options: { name: '[hash].[ext]', outputPath: 'img' },
        },
      },
      {
        test: /\.(eot|woff|woff2|ttf)([?]?.*)$/,
        use: {
          loader: 'file-loader',
          options: { outputPath: 'fonts' },
        },
      },
      // {
      //   test: /\.svg$/,
      //   loader: 'react-inlinesvg'
      // }
    ],
  },
}
