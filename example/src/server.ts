import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as ws from 'ws';
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
export const wssStateServer = new ws.Server({ server: httpsServer, path: '/state' });
export const wssVideoServer = new ws.Server({ server: httpsServer, path: '/video' });

const createBroadcast = (server: ws.Server) => {
  return <T>(data: T): T => {
    server.clients.forEach(client => {
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
};

export const broadcastVideo = createBroadcast(wssVideoServer);
export const broadcastState = createBroadcast(wssStateServer);
