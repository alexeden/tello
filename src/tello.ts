import { UdpSubject } from './utils';
import {
  TelloCommandClient,
  TelloCommandServer,
  TelloVideoClient,
} from './tello.constants';
import { TelloPacketGenerator, TelloPacket, Packet } from './protocol';

export class Tello {
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
    const connectionRequest = this.generator.createConnectionRequest(TelloVideoClient.port);
    const connectionRequestSent = await this.commandSocket.next(connectionRequest);

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

    this.sendPacket(this.generator.queryVersion());
    this.sendPacket(this.generator.queryWifiRegion());
    this.sendPacket(this.generator.queryVideoBitrate());
    this.sendPacket(this.generator.queryHeightLimit());
    this.sendPacket(this.generator.queryLowBattThresh());
    this.sendPacket(this.generator.queryAttitude());
  }

  stop() {
    let interval;
    // tslint:disable-next-line:no-conditional-assignment
    while (interval = this.intervals.shift()) {
      clearInterval(interval);
    }
    this.generator.reset();
  }
}
