/**
 * Try this for getting codec info
 * ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 udp://0.0.0.0:11111
 *
 * ffprobe output:
 * Stream #0:0: Video: h264 (Main), yuv420p(progressive), 960x720, 25 fps, 25 tbr, 1200k tbn, 50 tbc
 */
// ffmpeg -i udp://0.0.0.0:11111 -f sdl "window title"
// import * as readline from 'readline';
import * as url from 'url';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { httpsServer } from './server';
// import { map, take, tap, filter } from 'rxjs/operators';

import * as ws from 'ws';
import { Tello } from '../../dist';
import { IncomingMessage } from 'http';
import { Socket } from 'net';

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

const spawnEncoder = () => {
  return spawn(
    'ffmpeg',
    [
      '-fflags', 'nobuffer',
      '-f', 'h264',
      '-i', '-',
      '-r', '30',
      '-c:v', 'libx264',
      '-b:v', '3M',
      '-preset', 'ultrafast',
      '-tune', 'zerolatency',
      '-vsync', '0',
      '-async', '1',
      '-bsf:v', 'h264_mp4toannexb',
      '-x264-params', 'keyint=15:scenecut=0',
      '-movflags', 'frag_keyframe+empty_moov',
      '-an',
      '-f', 'h264',
      '-',
    ]
  );
};

(async () => {
  const wssVideoServer = new ws.Server({ noServer: true });
  const wssStateServer = new ws.Server({ noServer: true });
  const h264NalUnit = Buffer.from([0, 0, 0, 1]);
  httpsServer.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
    const pathname = url.parse(request.url!).pathname;

    if (pathname === '/video') {
      wssVideoServer.handleUpgrade(request, socket, head, clientSocket => {
        wssVideoServer.emit('connection', clientSocket, request);
      });
    }
    else if (pathname === '/state') {
      wssStateServer.handleUpgrade(request, socket, head, clientSocket => {
        wssStateServer.emit('connection', clientSocket, request);
      });
    }
    else {
      socket.destroy();
    }
  });

  wssVideoServer.on('connection', socket => {
    console.log('got a connection on the video server');
  });


  wssStateServer.on('connection', socket => {
    console.log('got a connection on the state server');
  });


  const broadcastVideo = createBroadcast(wssVideoServer);
  const broadcastState = createBroadcast(wssStateServer);

  const drone = new Tello({});
  const h264encoder = spawnEncoder();

  drone.videoStream.subscribe(chunk => h264encoder.stdin.write(chunk));

  let h264chunks: Buffer[] = [];

  h264encoder.stdout.on('data', (data: Buffer) => {
    const idx = data.indexOf(h264NalUnit);
    if (idx > -1 && h264chunks.length > 0) {
      h264chunks.push(data.slice(0, idx));
      broadcastVideo(Buffer.concat(h264chunks).toString('binary'));
      h264chunks = [];
      h264chunks.push(data.slice(idx));
    }
    else {
      h264chunks.push(data);
    }
  });


  drone.stateStream.subscribe(
    state => broadcastState(JSON.stringify(state))
  );


  drone.start();
})();
