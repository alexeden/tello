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
    type: udp.SocketType = 'udp4'
  ): UdpSubject => {
    return new UdpSubject(client, type);
  }

  private socket: udp.Socket;
  private bound = false;
  private queue: UdpMessage[] = [];
  private bytesSent = 0;
  private messagesSent = 0;
  private target: UdpTarget | null = null;

  constructor(
    readonly client: UdpTarget,
    readonly socketType: udp.SocketType
  ) {
    super();
    this.socket = udp.createSocket(this.socketType);

    this.socket.on('close', () => super.complete());

    this.socket.on('error', this.handleSocketError.bind(this));

    this.socket.on('message', (msg, rinfo) => super.next(msg));

    this.socket.unref();

    this.socket.on('listening', () => {
      this.bound = true;
      if (this.queue.length > 0) this.flush();
    });

    this.socket.bind(this.client.port, this.client.address);
  }

  setTarget(target: UdpTarget): this {
    this.target = target;
    return this;
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
    if (!this.target) {
      console.warn(`Can't send messages because the target is not set.`);
      return;
    }
    else if (this.bound && this.queue.length > 0) {
      const msg = this.queue.pop()!;
      await new Promise((ok, err) => {
        this.socket.send(msg, this.target!.port, this.target!.address, (error, bytes) => {
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
