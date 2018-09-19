import { map } from 'rxjs/operators';
import { TelloPort, TelloIP, TelloControlCommands, TelloReadCommands } from './constants';
import { tag } from './tag.operator';
import { UdpSubject } from './udp-subject';
import { TelloUtils } from './utils';

(async () => {
  const commandSocket = UdpSubject.create(
    { port: TelloPort.Client, address: TelloIP.Client },
    { port: TelloPort.Commands, address: TelloIP.Host }
  );

  const stateSocket = UdpSubject.create(
    { port: TelloPort.State, address: TelloIP.Client },
    { port: TelloPort.State, address: TelloIP.Host }
  );

  commandSocket.pipe(
    map(msg => msg.toString()),
    tag('command')
  ).subscribe();

  stateSocket.pipe(
    map(msg => msg.toString()),
    map(TelloUtils.parseState),
    tag('state', true)
  ).subscribe();

  setInterval(() => console.log(JSON.stringify(commandSocket.state, null, 2)), 5000);

  commandSocket.next(TelloControlCommands.Start());
  commandSocket.next(TelloReadCommands.Battery);
})();
