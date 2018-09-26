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

  get commandStream() {
    return this.commandSocket.asObservable();
  }

  get videoStream() {
    return this.videoSocket.asObservable();
  }

  private async sendPacket(packet: Packet) {
    return this.commandSocket.next(TelloPacket.toBuffer(packet));
  }

  async start() {
    const connectionRequest = this.generator.createConnectionRequest(TelloVideoClient.port);
    await this.commandSocket.next(connectionRequest);

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

    await this.sendPacket(this.generator.queryVersion());       /* 69 */
    await this.sendPacket(this.generator.queryVideoBitrate());  /* 40 */
    await this.sendPacket(this.generator.queryHeightLimit());   /* 4182 */
    await this.sendPacket(this.generator.queryLowBattThresh()); /* 4183 */
    await this.sendPacket(this.generator.queryAttitude());      /* 4185 */
    await this.sendPacket(this.generator.queryWifiRegion());    /* 21 */
    await this.sendPacket(this.generator.setExposureValue());   /* 52 */
    await this.sendPacket(this.generator.queryJpegQuality());   /* 55 */
    await this.sendPacket(this.generator.setVideoBitrate());    /* 32 */
    await this.sendPacket(this.generator.switchPicVid());       /* 49 */
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
