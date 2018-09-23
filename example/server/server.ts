import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as ws from 'ws';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';

const app = express();
const httpsPort = 4000;

const httpsServerOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

// tslint:disable-next-line:no-var-requires
const webpackConfig = require('./webpack.config.js');
const compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
}));

// app.use(express.static(path.resolve(__dirname, '..', 'client')));


const httpsServer = https.createServer(httpsServerOptions, app).listen(httpsPort);
const wsServer = new ws.Server({ server: httpsServer });

wsServer.on('connection', (socket, request) => {
  console.log('incoming connection!');

});
