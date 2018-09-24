import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as ws from 'ws';
import { config } from './webpack.config';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';

const app = express();
const httpsPort = 4000;

const httpsServerOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

// tslint:disable-next-line:no-var-requires
// const webpackConfig = require('./webpack.config.js');
const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output!.publicPath!,
}));

export const httpsServer = https.createServer(httpsServerOptions, app).listen(httpsPort);
export const wssServer = new ws.Server({ server: httpsServer });
