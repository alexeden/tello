import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as ws from 'ws';
import { config } from './webpack.config';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import { error } from 'util';

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
export const wssServer = new ws.Server({ server: httpsServer });
export const broadcast = <T>(data: T): T => {
  wssServer.clients.forEach(client => {
    if (client.readyState === ws.OPEN) {
      try {
        client.send(data);
      }
      catch (error) {
        console.error(`Failed to send to WSS client with url ${client.url}`, error);
      }
    }
  });
  return data;
};
