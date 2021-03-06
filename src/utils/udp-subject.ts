import * as fs from 'fs';
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

export class UdpSubject extends Subject<Buffer> {
  static create = (
    client: UdpTarget,
    target?: UdpTarget
  ): UdpSubject => {
    return new UdpSubject(client, target || null);
  }

  private socket: udp.Socket;
  private logStream: fs.WriteStream | null = null;
  private logLabel: string;

  constructor(
    readonly client: UdpTarget,
    readonly target: UdpTarget | null
  ) {
    super();
    this.logLabel = `${this.client.address}:${this.client.port}`;
    this.socket = udp.createSocket('udp4');
    this.socket.on('close', () => super.complete());
    this.socket.on('error', this.handleSocketError.bind(this));
    this.socket.on('message', (msg, rinfo) => {
      super.next(msg);
      this.log('Rx', msg);
    });
  }

  attachLogger(
    logLabel: string,
    logPath: string
  ) {
    this.logLabel = logLabel;
    this.logStream = fs.createWriteStream(logPath);
    return this;
  }

  private log(
    origin: 'Tx' | 'Rx',
    data: Buffer
  ) {
    if (this.logStream) {
      const dataString = Array.from(data).map(n => '0x' + `00${n.toString(16)}`.slice(-2)).join(', ');
      this.logStream.write(`${origin}\t${this.logLabel}\t[${dataString}]\n`);
    }
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

  async next(sendable: Buffer): Promise<boolean> {
    return new Promise<boolean>((ok, err) => {
      this.socket.send(sendable, this.target!.port, this.target!.address, (error, bytes) => {
        if (error) {
          this.handleSocketError(error);
          ok(false);
        }
        else {
          this.log('Tx', sendable);
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
