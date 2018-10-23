const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'web',
  mode: 'development',
  context: path.resolve(__dirname, 'client'),
  entry: './app.ts',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.html'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  devServer: {
    host: 'localhost',
    port: 4000,
    https: true,
    historyApiFallback: true,
    contentBase: [ path.resolve(__dirname, 'client') ],
  },
  output: {
    filename: 'app.js',
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
  ],
  module: {
    rules: [
      {
        test: /worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: {
            // inline: true,
            name: 'worker.[hash].js',
          },
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [], // 'absolute/path/a', 'absolute/path/b']
            }
        }]
      },
      {
        test: /\.wasm$/,
        type: 'javascript/auto', /** this disabled webpacks default handling of wasm */
        use: [
          {
            loader: 'file-loader',
            options: {
              // name: 'wasm/[name].[hash].[ext]',
              // publicPath: '../'
            }
          }
        ]
      }
    ],
  },
};
