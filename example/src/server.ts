import * as express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import * as path from 'path';
import * as url from 'url';
import * as webpack from 'webpack';
import * as ws from 'ws';
import * as webpackDevMiddleware from 'webpack-dev-middleware';

// tslint:disable-next-line:no-var-requires
const config = require('./webpack.config');

const app = express();
const httpsPort = config.devServer.port as number;

const httpsServerOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '..', 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '..', 'server.crt')),
};

const compiler = webpack(config as webpack.Configuration);

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output!.publicPath!,
}));

app.use(express.static(path.resolve(__dirname, 'client'), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.wasm')) {
      res.setHeader('Content-Type',  'application/wasm');
    }
  },
}));

export const httpsServer = https.createServer(httpsServerOptions, app).listen(httpsPort);
export const videoWsServer = new ws.Server({ noServer: true });
export const rcWsServer = new ws.Server({ noServer: true });
export const stateWsServer = new ws.Server({ noServer: true });

httpsServer.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
  const pathname = url.parse(request.url!).pathname;
  let wssServer: ws.Server;

  switch (pathname) {
    case '/video':  wssServer = videoWsServer; break;
    case '/rc':     wssServer = rcWsServer; break;
    case '/state':  wssServer = stateWsServer; break;
    default: socket.destroy(); return;
  }

  wssServer.handleUpgrade(request, socket, head, clientSocket => {
    wssServer.emit('connection', clientSocket, request);
  });
});
