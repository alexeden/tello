import { UdpSubject } from './utils';
import {
  TelloCommandClient,
  TelloCommandServer,
  TelloVideoClient,
} from './tello.constants';
import { TelloPacketGenerator, TelloPacket, Packet } from './protocol';

export class Tello {

  static createConnectionRequest() {
    const connectionRequest = Buffer.from('conn_req:lh');
    connectionRequest.writeUInt16LE(TelloVideoClient.port, 9);
    return connectionRequest;
  }

  private readonly commandSocket: UdpSubject;
  private readonly videoSocket: UdpSubject;
  private readonly intervals: NodeJS.Timer[] = [];

  readonly generator: TelloPacketGenerator;


  constructor() {
    this.commandSocket = UdpSubject.create(TelloCommandClient, TelloCommandServer).start();
    this.videoSocket = UdpSubject.create(TelloVideoClient).start();
    this.generator = new TelloPacketGenerator();
  }

  private async sendPacket(packet: Packet) {
    return this.commandSocket.next(TelloPacket.toBuffer(packet));
  }

  async start() {
    const connectionRequestSent = await this.commandSocket.next(Tello.createConnectionRequest());

    this.intervals.push(setInterval(
      () => this.sendPacket(this.generator.setStick()),
      20
    ));

    this.intervals.push(setInterval(
      () => this.sendPacket(this.generator.setDateTime()),
      1000
    ));

    this.intervals.push(setInterval(
      () => this.sendPacket(this.generator.queryVideoSpsPps()),
      1000
    ));


    console.log('connectionRequestSent: ', connectionRequestSent);
    // connect[9] = TelloVideoClient.port & 0xff;
    // connect[10] = TelloVideoClient.port >> 8;

  }

  stop() {
    let interval;
    // tslint:disable-next-line:no-conditional-assignment
    while (interval = this.intervals.shift()) {
      clearInterval(interval);
    }
  }
}
