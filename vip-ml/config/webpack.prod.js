const TerserPlugin = require('terser-webpack-plugin')
// const RemovePlugin = require('remove-files-webpack-plugin')

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

    // plugins: [
    //   new RemovePlugin({
    //     after: {
    //       root: './build',
    //       include: ['asset-manifest.json', 'service-worker.js'],
    //       trash: true,
    //     },
    //   }),
    // ],
  },
}
