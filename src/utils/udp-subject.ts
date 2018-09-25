import * as udp from 'dgram';
import { Subject } from 'rxjs';
import { AddressInfo } from 'net';


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
    target?: UdpTarget
  ): UdpSubject => {
    return new UdpSubject(client, target || null);
  }

  private socket: udp.Socket;
  private bytesSent = 0;
  private messagesSent = 0;
  // private target: UdpTarget | null = null;

  constructor(
    readonly client: UdpTarget,
    readonly target: UdpTarget | null
    // readonly socketType: udp.SocketType
  ) {
    super();
    this.socket = udp.createSocket('udp4');

    this.socket.on('close', () => super.complete());

    this.socket.on('error', this.handleSocketError.bind(this));

    this.socket.on('message', (msg, rinfo) => super.next(msg));

    // this.socket.on('listening', () => {
    // });
  }

  isListening(): null | AddressInfo {
    try {
      return this.socket.address() as AddressInfo;
    }
    catch (err) {
      return null;
    }
  }

  start(): this {
    if (this.isListening()) {
      console.warn(`already started!`);
    }
    else {
      this.socket.bind(this.client.port, this.client.address);
    }
    return this;
  }

  private handleSocketError(error: Error) {
    this.socket.close();
    super.error(error);
  }

  async next(sendable: UdpMessage): Promise<boolean> {
    if (!this.target) {
      return false;
    }

    return new Promise<boolean>((ok, err) => {
      this.socket.send(sendable, this.target!.port, this.target!.address, (error, bytes) => {
        if (error) {
          this.handleSocketError(error);
          ok(false);
        }
        else {
          this.messagesSent++;
          this.bytesSent += bytes;
          ok(true);
        }
      });
    });
  }

  complete() {
    this.socket.close();
    super.complete();
  }
}
