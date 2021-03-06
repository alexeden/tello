import { rcWsServer, stateWsServer, videoWsServer } from './server';
import { sample, startWith, switchMapTo, map } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
import { SocketUtils, VideoUtils } from './utils';
import { Tello, Command } from '../../dist';

enum MessageType {
  Command = 'command',
  State = 'state',
  Error = 'error',
}

interface CommandMessage {
  type: MessageType.Command;
  command: Command;
  data: object | null;
}

const isCommand = (value: any): value is Command => typeof Command[value] === 'string';

(async () => {
  const drone = new Tello();

  const broadcastVideo = SocketUtils.createBroadcaster(videoWsServer);
  const h264encoder = VideoUtils.spawnEncoder();
  drone.videoStream.subscribe(chunk => h264encoder.stdin.write(chunk));
  videoWsServer.on('connection', () => console.log('got a connection on the video server'));
  VideoUtils.h264EncoderObservable(h264encoder).subscribe(frame => broadcastVideo(frame));

  const broadcastState = SocketUtils.createBroadcaster(stateWsServer);
  const handleCommandMessage = ({ command }: CommandMessage) => {
    switch (command) {
      case Command.DoConnect:
        drone.start();
        break;
      case Command.DoTakeoff:
        drone.takeoff();
        break;
      case Command.DoLand:
        drone.land();
        break;
    }
  };

  stateWsServer.on('connection', socket => {
    socket.on('message', data => {
      const msg = typeof data === 'string' ? JSON.parse(data) : {};
      if (!isCommand(msg.command)) return;
      handleCommandMessage(msg);
    });
  });

  rcWsServer.on('connection', socket => {
    socket.on('message', data => {
      const msg = typeof data === 'string' ? JSON.parse(data) : {};
      console.log('stick update sent: ', msg);
      drone.updateRemoteControl(msg);
    });
  });

  merge(
    drone.stateStream,
    fromEvent(stateWsServer, 'connection').pipe(switchMapTo(drone.stateStream))
  )
  .pipe(map(state => JSON.stringify(state)))
  .subscribe(broadcastState);

  drone.start();
})();
