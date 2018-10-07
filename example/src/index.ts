/**
 * Try this for getting codec info
 * ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 udp://0.0.0.0:11111
 *
 * ffprobe output:
 * Stream #0:0: Video: h264 (Main), yuv420p(progressive), 960x720, 25 fps, 25 tbr, 1200k tbn, 50 tbc
 */
// ffmpeg -i udp://0.0.0.0:11111 -f sdl "window title"
import {
  httpsServer,
  videoWsServer,
  stateWsServer,
} from './server';
import { SocketUtils, VideoUtils } from './utils';
import { Tello } from '../../dist';

(async () => {

  const broadcastVideo = SocketUtils.createBroadcaster(videoWsServer);
  const broadcastState = SocketUtils.createBroadcaster(stateWsServer);

  const drone = new Tello();

  const h264encoder = VideoUtils.spawnEncoder();
  const h264NalUnit = Buffer.from([0, 0, 0, 1]);
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

  videoWsServer.on('connection', () => console.log('got a connection on the video server'));
  stateWsServer.on('connection', socket => {
    socket.on('message', data => {
      console.log('got message from client: ', data);
    });
    console.log('got a connection on the state server');
  });

  drone.videoStream.subscribe(chunk => h264encoder.stdin.write(chunk));
  drone.stateStream.subscribe(state => broadcastState(JSON.stringify(state)));

  drone.start();
})();
