import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import { config } from './webpack.config';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';

const app = express();
const httpsPort = config.devServer.port as number;

const httpsServerOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output!.publicPath!,
}));

export const httpsServer = https.createServer(httpsServerOptions, app).listen(httpsPort);
