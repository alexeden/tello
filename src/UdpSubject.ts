import * as udp from 'dgram';
import { Observable, Subscriber, Subject } from 'rxjs';


export interface UdpSocketData {
  msg: string;
  rinfo: udp.RemoteInfo;
}

export class UdpSubject extends Subject<UdpSocketData> {
  // tslint:disable-next-line:ban-types
  static create: Function = <T>(): UdpSubject => {
    return new UdpSubject();
  }

  constructor() {
    super();
  }
}
export function fromUdpSocket(socket: udp.Socket): Observable<UdpSocketData> {
  return Observable.create((subsriber: Subscriber<UdpSocketData>) => {
    socket.on('listening', () => console.log('socket is listening'));

    socket.on('message', (msg, rinfo) => subsriber.next({
      msg: msg.toString(),
      rinfo,
    }));

    socket.on('error', error => subsriber.error(error));

    socket.on('close', () => subsriber.complete());

    return () => {
      console.log('closing socket');
      socket.close();
    };
  });
}
