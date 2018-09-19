import * as udp from 'dgram';
import { Subject } from 'rxjs';


export interface UdpSocketData {
  msg: Buffer;
  rinfo: udp.RemoteInfo;
}

export interface UdpTarget {
  port: number;
  address: string;
}

export type UdpMessage = Buffer; // | string | Uint8Array | any[];

export class UdpSubject extends Subject<UdpMessage> {
  static create = (
    client: UdpTarget,
    host: UdpTarget,
    type: udp.SocketType = 'udp4'
  ): UdpSubject => {
    return new UdpSubject(client, host, type);
  }

  private socket: udp.Socket;
  private bound = false;
  private queue: UdpMessage[] = [];
  private bytesSent = 0;
  private messagesSent = 0;

  constructor(
    readonly client: UdpTarget,
    readonly host: UdpTarget,
    readonly socketType: udp.SocketType
  ) {
    super();
    this.socket = udp.createSocket(this.socketType);

    this.socket.on('close', () => super.complete());

    this.socket.on('error', this.handleSocketError.bind(this));

    this.socket.on('message', (msg, rinfo) => super.next(msg));

    this.socket.unref();

    this.socket.on('listening', () => {
      console.log('listening!');
      this.bound = true;
      this.flush();
    });

    this.socket.bind(this.client.port, this.client.address);
  }

  private handleSocketError(error: Error) {
    this.socket.close();
    super.error(error);
  }

  get state() {
    return {
      queued: this.queue.length,
      bound: this.bound,
      messages: this.messagesSent,
      bytes: this.bytesSent,
    };
  }

  get queued() {
    return this.queue.length;
  }

  async flush(): Promise<any> {
    if (this.bound && this.queue.length > 0) {
      const msg = this.queue.pop()!;
      console.log('flush!');
      await new Promise((ok, err) => {
        this.socket.send(msg, this.host.port, this.host.address, (error, bytes) => {
          if (error) {
            this.handleSocketError(error);
            err(error);
          }
          else {
            this.messagesSent++;
            this.bytesSent += bytes;
            ok();
          }
        });
      });
      return this.flush();
    }
    else {
      return;
    }
  }

  async next(sendable: UdpMessage) {
    this.queue.unshift(sendable);
    await this.flush();
  }

  complete() {
    this.socket.close();
    super.complete();
  }
}


// export function fromUdpSocket(socket: udp.Socket): Observable<UdpSocketData> {
//   return Observable.create((subsriber: Subscriber<UdpSocketData>) => {
//     socket.on('listening', () => console.log('socket is listening'));

//     socket.on('message', (msg, rinfo) => subsriber.next({
//       msg: msg.toString(),
//       rinfo,
//     }));

//     socket.on('error', error => subsriber.error(error));

//     socket.on('close', () => subsriber.complete());

//     return () => {
//       console.log('closing socket');
//       socket.close();
//     };
//   });
// }
