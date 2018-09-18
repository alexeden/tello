import * as udp from 'dgram';

import { TelloPort, TelloIP } from './constants';
import { fromUdpSocket } from './rx-dgram';
import { tag } from './tag.operator';


(async () => {
  const socket = udp.createSocket('udp4');

  // try {
  //   console.log(socket.address());
  // }
  // catch (error) {
  //   console.error(error);
  // }

  const sub = fromUdpSocket(socket).pipe(tag('udp')).subscribe();
  await new Promise((ok, err) => socket.bind(TelloPort.Client, TelloIP.Client, ok));

  socket.send(Buffer.from('command', 'utf8'), TelloPort.Commands, TelloIP.Host);

  setTimeout(() => sub.unsubscribe(), 10000);
})();
