import { Observable, BehaviorSubject } from 'rxjs';
import {
  map,
  take,
  tap,
  filter,
  skipWhile,
} from 'rxjs/operators';
import { UdpSubject } from './utils';
import {
  TelloCommandClient,
  TelloCommandServer,
  TelloVideoClient,
} from './tello.constants';
import { TelloPacketGenerator, TelloPacket, Packet, Command } from './protocol';
import { TelloVideoUtils } from './video';

export class Tello {
  private readonly commandSocket: UdpSubject;
  private readonly videoSocket: UdpSubject;
  private readonly intervals: NodeJS.Timer[] = [];
  private readonly connected = new BehaviorSubject(false);

  readonly generator: TelloPacketGenerator;

  constructor() {
    this.commandSocket = UdpSubject.create(TelloCommandClient, TelloCommandServer).start();
    this.videoSocket = UdpSubject.create(TelloVideoClient).start();
    this.generator = new TelloPacketGenerator();

    this.packetStream.subscribe(packet => {
      switch (packet.command) {
        case Command.LogHeader:
          this.send(this.generator.logHeader());
      }
    });
  }

  get packetStream(): Observable<Packet> {
    return this.commandSocket.asObservable().pipe(
      filter(TelloPacket.bufferIsPacket),
      map(TelloPacket.fromBuffer)
    );
  }

  get messageStream(): Observable<Buffer> {
    return this.commandSocket.asObservable().pipe(
      filter(buf => !TelloPacket.bufferIsPacket(buf))
    );
  }

  get videoStream() {
    return this.videoSocket.asObservable().pipe(
      skipWhile(buf => !TelloVideoUtils.isKeyframe(buf)),
      map(frame => frame.slice(2))
    );
  }

  get rawVideoStream() {
    return this.videoSocket.asObservable();
  }

  private async send(message: Packet | Buffer) {
    const buffer = message instanceof Buffer ? message : TelloPacket.toBuffer(message);
    // console.log(`TX "${packet.command}" #${packet.sequence}: `, packetBuffer);
    const sent = await this.commandSocket.next(buffer);
    if (!sent) {
      throw new Error(`Failed to send command with ID "${message instanceof Buffer ? message : message.command}"`);
    }
    return sent;
  }

  async start() {
    const connectionRequest = this.generator.createConnectionRequest(TelloVideoClient.port);
    const connected = new Promise((ok, err) => {
      this.messageStream.subscribe(msg =>
        msg.slice(-2).toString() === connectionRequest.slice(-2).toString()
          ? ok()
          : err('Video port mismatch')
      );
    });

    await this.send(connectionRequest);
    console.log('connection request sent');
    await connected;

    await this.generator.setDateTime();

    this.intervals.push(setInterval(
      () => this.send(this.generator.setStick()),
      20
    ));

    this.intervals.push(setInterval(
      () => this.send(this.generator.setDateTime()),
      1000
    ));

    this.intervals.push(setInterval(
      () => this.send(this.generator.queryVideoSpsPps()),
      1000
    ));

    await this.send(this.generator.queryVersion());       /* 69 */
    await this.send(this.generator.queryVideoBitrate());  /* 40 */
    await this.send(this.generator.queryHeightLimit());   /* 4182 */
    await this.send(this.generator.queryLowBattThresh()); /* 4183 */
    await this.send(this.generator.queryAttitude());      /* 4185 */
    await this.send(this.generator.queryWifiRegion());    /* 21 */
    await this.send(this.generator.setExposureValue());   /* 52 */
    await this.send(this.generator.queryJpegQuality());   /* 55 */
    await this.send(this.generator.setVideoBitrate());    /* 32 */
    await this.send(this.generator.switchPicVid(1));      /* 49 */
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
