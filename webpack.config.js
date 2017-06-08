var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

module.exports = [{
  entry: {
    horizontal: './shim/horizontal.js',
    vertical: './shim/vertical.js'
  },
  output: {
    library: 'PXTBlockly',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  }
}, {
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'gh-pages')
  },
  plugins: [
      new CopyWebpackPlugin([{
        from: 'node_modules/google-closure-library',
        to: 'closure-library'
      }, {
        from: 'blocks',
        to: 'playgrounds/blocks',
      }, {
        from: 'core',
        to: 'playgrounds/core'
      }, {
        from: 'media',
        to: 'playgrounds/media'
      }, {
        from: 'msg',
        to: 'playgrounds/msg'
      }, {
        from: 'tests',
        to: 'playgrounds/tests'
      }, {
        from: '*.js',
        ignore: 'webpack.config.js',
        to: 'playgrounds'
      }])
  ]
}];
