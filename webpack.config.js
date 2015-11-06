const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    './client',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot', 'babel'],
      exclude: [/node_modules/, /worker/],
      include: __dirname,
    }, {
      test: /\.js$/,
      loaders: ['serviceworker'],
      include: path.join(__dirname, 'src', 'worker'),
    }, {
      test: /\.css?$/,
      loaders: ['style', 'raw'],
      include: __dirname,
    }],
  },
};
