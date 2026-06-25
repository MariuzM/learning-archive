module.exports = {
  // babel: {
  //   loaderOptions: {
  //     babelrc: true,
  //   },
  // },

  babel: require(__dirname + '/../.babelrc.js'),

  devServer: {
    writeToDisk: false,
  },
}
