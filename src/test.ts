import {
  map,
  take,
  tap,
  filter,
} from 'rxjs/operators';
import { Tello } from './tello';
import { tag } from './utils';
import { TelloPacket } from './protocol';

const seen = new Set<any>();

(async () => {
  const drone = new Tello();
  // const commandStream =
  drone.packetStream.pipe(
    // tap(packet => seen.add(packet.command))
    // tag('command')
  )
  .subscribe();

  drone.messageStream.pipe(
    // tap(packet => seen.add(packet.command))
    // tag('message')
  )
  .subscribe();

  // setInterval(() => console.log(Array.from(seen)), 1000);

  drone.start();


})();
