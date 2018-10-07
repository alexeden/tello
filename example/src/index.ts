import { videoWsServer, stateWsServer } from './server';
import { SocketUtils, VideoUtils } from './utils';
import { Tello } from '../../dist';

(async () => {
  const drone = new Tello();

  const broadcastVideo = SocketUtils.createBroadcaster(videoWsServer);
  const h264encoder = VideoUtils.spawnEncoder();
  drone.videoStream.subscribe(chunk => h264encoder.stdin.write(chunk));
  videoWsServer.on('connection', () => console.log('got a connection on the video server'));
  VideoUtils.h264EncoderObservable(h264encoder).subscribe(frame => broadcastVideo(frame));

  const broadcastState = SocketUtils.createBroadcaster(stateWsServer);
  stateWsServer.on('connection', socket => {
    socket.on('message', data => {
      console.log('got message from client: ', data);
    });
    console.log('got a connection on the state server');
  });

  drone.stateStream.subscribe(state => broadcastState(JSON.stringify(state)));

  drone.start();
})();
