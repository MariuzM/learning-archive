const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  webpack: {
    configure: (webpackConfig) => ({
      ...webpackConfig,
      optimization: {
        ...webpackConfig.optimization,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              output: { comments: false },
            },
            extractComments: false,
          }),
        ],
      },
    }),
  },
}
