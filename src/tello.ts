import { Observable, Subject } from 'rxjs';
import { map, filter, skipWhile, takeUntil, sampleTime } from 'rxjs/operators';
import { UdpSubject, pad, tag } from './utils';
import {
  TelloCommandClient,
  TelloCommandServer,
  TelloVideoClient,
} from './tello.constants';
import { TelloPacketGenerator, TelloPacket, Packet, Command } from './protocol';
import { TelloStateManager, TelloState } from './state';
import { TelloVideoUtils } from './video';


export class Tello {
  private readonly commandSocket: UdpSubject;
  private readonly videoSocket: UdpSubject;
  private readonly intervals: NodeJS.Timer[] = [];
  private readonly stopSignal = new Subject<any>();
  private readonly stateManager = new TelloStateManager();

  readonly generator: TelloPacketGenerator;
  readonly stateStream: Observable<TelloState>;

  constructor() {
    this.commandSocket = UdpSubject.create(TelloCommandClient, TelloCommandServer).start();
    this.videoSocket = UdpSubject.create(TelloVideoClient).start();
    this.generator = new TelloPacketGenerator();
    this.stateStream = this.stateManager.state;

    this.packetStream.subscribe(async packet => {
      switch (packet.command) {
        case Command.LogHeader:
          console.log(packet.payload.toString());
          const ackPacket = this.generator.logHeader(packet.payload.slice(0, 2));
          await this.send(ackPacket);
          console.log(`Log header ack sent: `, JSON.stringify(ackPacket, null, 2));
      }
    });

    // const logCommand = pad(20, 'left', ' ');
    // const logLength = pad(5, 'right', ' ');
    // this.commandSocket.asObservable().pipe(
    //   filter(TelloPacket.bufferIsPacket)
    // )
    // .subscribe(buffer => {
    //   const parsed = TelloPacket.fromBuffer(buffer);
    //   const label = TelloPacket.getCommandLabel(parsed.command);
    //   console.log(`${logCommand(label)}${logLength(parsed.command)}${logLength(buffer.length)}${logLength(parsed.payload.length)}`);
    // });

    // Route incoming packets to the state manager
    this.packetStream.subscribe(packet => {
      this.stateManager.parseAndUpdate(packet);
    });

    // this.stateManager.state.pipe(
    //   sampleTime(1000),
    //   tag('state', true)
    // ).subscribe();
  }

  // Raw command stream
  get rawCommandStream(): Observable<Buffer> {
    return this.commandSocket.asObservable().pipe(
      takeUntil(this.stopSignal)
    );
  }

  // Raw video stream
  get rawVideoStream(): Observable<Buffer> {
    return this.videoSocket.asObservable().pipe(
      takeUntil(this.stopSignal)
    );
  }

  // Transformed command stream
  get packetStream(): Observable<Packet> {
    return this.rawCommandStream.pipe(
      filter(TelloPacket.bufferIsPacket),
      map(TelloPacket.fromBuffer)
    );
  }

  // Transformed command stream
  get messageStream(): Observable<Buffer> {
    return this.rawCommandStream.pipe(
      filter(buf => !TelloPacket.bufferIsPacket(buf))
    );
  }

  // Transformed video stream
  get videoStream() {
    return this.rawVideoStream.pipe(
      skipWhile(buf => !TelloVideoUtils.isKeyframe(buf)),
      map(frame => frame.slice(2))
    );
  }

  private async send(message: Packet | Buffer) {
    const buffer = message instanceof Buffer ? message : TelloPacket.toBuffer(message);
    const sent = await this.commandSocket.next(buffer);
    if (!sent) {
      throw new Error(`Failed to send command with ID "${message instanceof Buffer ? message : message.command}"`);
    }
    return sent;
  }

  private async sendOnInterval(interval: number, messageThunk: () => Packet | Buffer) {
    this.intervals.push(setInterval(
      () => this.send(messageThunk()),
      interval
    ));
  }

  async start() {
    let interval;
    // tslint:disable-next-line:no-conditional-assignment
    while (interval = this.intervals.shift()) {
      clearInterval(interval);
    }

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
    await this.send(this.generator.setDateTime());
    console.log('connected!');

    this.sendOnInterval(20, () => this.generator.setStick());
    this.sendOnInterval(2000, () => this.generator.setDateTime());
    this.sendOnInterval(1000, () => this.generator.queryVideoSpsPps());
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
    this.stopSignal.next('stop!');
    let interval;
    // tslint:disable-next-line:no-conditional-assignment
    while (interval = this.intervals.shift()) {
      clearInterval(interval);
    }
    this.generator.reset();
  }
}
