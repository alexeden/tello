import * as path from 'path';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

export const config: webpack.Configuration & { devServer: any } = {
  target: 'web',
  mode: 'development',
  context: path.resolve(__dirname, 'client'),
  entry: './app.ts',
  devServer: {
    host: 'localhost',
    port: 4000,
    https: true,
    historyApiFallback: true,
    contentBase: [ path.resolve(__dirname, 'client') ],
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
  ],
};
