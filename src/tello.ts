import { Observable, Subject } from 'rxjs';
import { map, filter, skipWhile, takeUntil } from 'rxjs/operators';
import { UdpSubject } from './utils';
import {
  TelloCommandClient,
  TelloCommandServer,
  TelloVideoClient,
} from './tello.constants';
import { TelloPacketGenerator, TelloPacket, Packet, Command } from './protocol';
import { TelloRemoteControl } from './tello.remote-control';
import { TelloStateManager, TelloState } from './state';
import { TelloVideoUtils } from './video';
import { CameraMode, Exposure, VideoBitrate, Stick } from './lib';


export class Tello {
  private readonly commandSocket: UdpSubject;
  private readonly videoSocket: UdpSubject;
  private readonly intervals: NodeJS.Timer[] = [];
  private readonly stopSignal = new Subject<any>();
  private readonly stateManager = new TelloStateManager();
  private readonly rc: TelloRemoteControl;

  readonly generator: TelloPacketGenerator;
  readonly stateStream: Observable<TelloState>;

  constructor() {
    this.commandSocket = UdpSubject.create(TelloCommandClient, TelloCommandServer).start();
    this.videoSocket = UdpSubject.create(TelloVideoClient);
    this.generator = new TelloPacketGenerator();
    this.rc = new TelloRemoteControl();

    this.stateStream = this.stateManager.state;

    this.packetStream.subscribe(async packet => {
      switch (packet.command) {
        case Command.LogHeader:
          /**
           * TOOD:
           * Why
           * Why
           * WHY won't this get the damn thing to start sending log data?
           */
          const ackPacket = this.generator.logHeader(packet.payload.slice(0, 2));
          await this.send(ackPacket);
          break;
      }
    });

    // Route incoming packets to the state manager
    this.packetStream.subscribe(packet => {
      this.stateManager.parseAndUpdate(packet);
    });
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
      console.error(`Failed to send command with ID "${message instanceof Buffer ? message : TelloPacket.getCommandLabel(message.command)}"`);
    }
    return sent;
  }

  private async sendOnInterval(interval: number, messageThunk: () => Packet | Buffer) {
    this.intervals.push(setInterval(
      () => this.send(messageThunk()),
      interval
    ));
  }

  /**
   * Cancels any active packets requests being sent on an interval.
   * Returns the number of intervals that were stopped.
   */
  clearIntervalRequests() {
    const count = this.intervals.length;
    let interval;
    // tslint:disable-next-line:no-conditional-assignment
    while (interval = this.intervals.shift()) clearInterval(interval);
    return count;
  }

  async start() {
    this.clearIntervalRequests();
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
    this.videoSocket.start();
    console.log('connected!');

    this.sendOnInterval(20, () => this.generator.setStick(this.rc));
    this.sendOnInterval(100, () => this.generator.queryVideoSpsPps());

    await this.send(this.generator.setCameraMode(CameraMode.Video));
    await this.send(this.generator.setExposureValue(Exposure.Zero));
    await this.send(this.generator.setVideoBitrate(VideoBitrate.Auto));
    await this.send(this.generator.queryAttitude());      /* 4185 */
    await this.send(this.generator.queryHeightLimit());   /* 4182 */
    await this.send(this.generator.queryJpegQuality());   /* 55 */
    await this.send(this.generator.queryLowBattThresh()); /* 4183 */
    await this.send(this.generator.querySsid());          /* 17 */
    await this.send(this.generator.querySsidPass());      /* 19 */
    await this.send(this.generator.queryVersion());       /* 69 */
    await this.send(this.generator.queryVideoBitrate());  /* 40 */
    await this.send(this.generator.queryWifiRegion());    /* 21 */
  }

  stop() {
    this.stopSignal.next('stop!');
    this.clearIntervalRequests();
    this.generator.reset();
  }

  takeoff() {
    return this.send(this.generator.doTakeoff());
  }

  land() {
    return this.send(this.generator.doLand());
  }

  hover() {
    this.rc.reset();
  }

  updateRemoteControl(values: Partial<Stick>) {
    this.rc.set(values);
  }
}
