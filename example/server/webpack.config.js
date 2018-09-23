const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'web',
  context: path.resolve(__dirname, 'client'),
  entry: './index.js',
  devServer: {
    host: 'localhost',
    port: 4001,
    https: true,
    historyApiFallback: true,
    contentBase: [ path.resolve(__dirname, 'client') ]
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      showErrors: true,
      inject: 'body',
      chunksSortMode: 'dependency',
      minify: false,
    }),
  ]

};
