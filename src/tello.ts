import {
  map,
  take,
  tap,
  filter,
} from 'rxjs/operators';
import { UdpSubject } from './utils';
import {
  TelloCommandClient,
  TelloCommandServer,
  TelloVideoClient,
} from './tello.constants';
import { TelloPacketGenerator, TelloPacket, Packet, Command } from './protocol';
import { Observable } from 'rxjs';

export class Tello {
  private readonly commandSocket: UdpSubject;
  private readonly videoSocket: UdpSubject;
  private readonly intervals: NodeJS.Timer[] = [];

  readonly generator: TelloPacketGenerator;

  constructor() {
    this.commandSocket = UdpSubject.create(TelloCommandClient, TelloCommandServer).start();
    this.videoSocket = UdpSubject.create(TelloVideoClient).start();
    this.generator = new TelloPacketGenerator();

    this.packetStream.subscribe(packet => {
      switch (packet.command) {
        case Command.LogHeader:
          this.sendPacket(this.generator.logHeader());
      }
    });
  }

  get packetStream(): Observable<Packet> {
    return this.commandSocket.asObservable().pipe(
      tap(buf => {
        if (TelloPacket.bufferIsPacket(buf)) {
          const packet = TelloPacket.fromBuffer(buf);
          console.log(`RX "${packet.command}" #${packet.sequence}: `, buf);
        }
        else {
          console.log(`RX "2": `, buf);
        }
      }),
      filter(TelloPacket.bufferIsPacket),
      map(TelloPacket.fromBuffer)
    );
  }

  get messageStream(): Observable<Buffer> {
    return this.commandSocket.asObservable().pipe(
      filter(buf => !TelloPacket.bufferIsPacket(buf))
      // map(buf => buf.toString())
    );
  }

  get videoStream() {
    return this.videoSocket.asObservable();
  }

  private async sendPacket(packet: Packet) {
    const packetBuffer = TelloPacket.toBuffer(packet);
    console.log(`TX "${packet.command}" #${packet.sequence}: `, packetBuffer);

    const sent = this.commandSocket.next(packetBuffer);
    if (!sent) throw new Error(`Failed to send command with ID "${packet.command}"`);
    return sent;
  }

  async start() {
    const connectionRequest = this.generator.createConnectionRequest(TelloVideoClient.port);
    const connected = new Promise((ok, err) => {
      this.messageStream.subscribe(msg => {
        msg.write('conn_req:');
        if (msg.toString() === connectionRequest.toString()) {
          ok();
        }
        else {
          console.log('Video port mismatch!!!', connectionRequest, msg);
          err('Video port mismatch');
        }
      });
    });

    await this.commandSocket.next(connectionRequest);
    console.log('connection request sent');
    await connected;
    await this.generator.setDateTime();
    console.log('connected!');
    // await this.sendPacket(this.generator.setStick());
    // await this.sendPacket(this.generator.setDateTime());
    // await this.sendPacket(this.generator.queryVideoSpsPps());
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
