import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';

const app = express();
const port = 4000;

app.use(express.static(path.resolve(__dirname, '..', 'client')));

const serverOptions: https.ServerOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, 'server.crt')),
};

https.createServer(serverOptions, app).listen(port);
