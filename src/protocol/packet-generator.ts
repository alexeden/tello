import { clamp } from 'ramda';
import { Stick, CameraMode, VideoBitrate, Exposure } from '../lib';
import { Packet } from './packet.types';
import { TelloPacket } from './packet.utils';
import { Command } from './commands';

export class TelloPacketGenerator {
  private sequence = 0;

  reset() {
    this.sequence = 0;
  }

  createConnectionRequest(port: number) {
    const connectionRequest = Buffer.alloc(11);
    connectionRequest.write('conn_req:');
    connectionRequest.writeUInt16LE(port, 9);
    this.sequence++;
    return connectionRequest;
  }

  doTakeoff(): Packet {
    return TelloPacket.of({
      command: Command.DoTakeoff,
      sequence: this.sequence++,
    });
  }

  doLand(): Packet {
    const payload = Buffer.of(0);

    return TelloPacket.of({
      command: Command.DoLand,
      payload,
      sequence: this.sequence++,
    });
  }

  logHeader(ack: Buffer): Packet {
    return TelloPacket.of({
      command: Command.LogHeader,
      sequence: this.sequence++,
      payload: ack,
    });
  }

  queryAttitude(): Packet {
    return TelloPacket.of({
      command: Command.QueryAttitude,
      sequence: this.sequence++,
    });
  }

  queryHeightLimit(): Packet {
    return TelloPacket.of({
      command: Command.QueryHeightLimit,
      sequence: this.sequence++,
    });
  }

  queryJpegQuality(): Packet {
    return TelloPacket.of({
      command: Command.QueryJpegQuality,
      sequence: this.sequence++,
    });
  }

  queryLowBattThresh(): Packet {
    return TelloPacket.of({
      command: Command.QueryLowBattThresh,
      sequence: this.sequence++,
    });
  }

  querySsid(): Packet {
    return TelloPacket.of({
      command: Command.QuerySsid,
      sequence: this.sequence++,
    });
  }

  querySsidPass(): Packet {
    return TelloPacket.of({
      command: Command.QuerySsidPass,
      sequence: this.sequence++,
    });
  }

  queryVersion(): Packet {
    return TelloPacket.of({
      command: Command.QueryVersion,
      sequence: this.sequence++,
    });
  }

  queryVideoBitrate(): Packet {
    return TelloPacket.of({
      command: Command.QueryVideoBitrate,
      sequence: this.sequence++,
    });
  }

  queryVideoSpsPps(): Packet {
    return TelloPacket.of({
      command: Command.QueryVideoSpsPps,
      sequence: 0,
    });
  }

  queryWifiRegion(): Packet {
    return TelloPacket.of({
      command: Command.QueryWifiRegion,
      sequence: this.sequence++,
    });
  }

  setCameraMode(mode: CameraMode): Packet {
    const payload = Buffer.of(mode);

    return TelloPacket.of({
      command: Command.SetCameraMode,
      sequence: this.sequence++,
      payload,
    });
  }

  setDateTime(): Packet {
    const buf = Buffer.alloc(15);
    const now = new Date();
    buf.writeUInt8(0x00, 0);
    buf.writeUInt16LE(now.getFullYear(), 1);
    buf.writeUInt16LE(now.getMonth(), 3);
    buf.writeUInt16LE(now.getDay(), 5);
    buf.writeUInt16LE(now.getHours(), 7);
    buf.writeUInt16LE(now.getMinutes(), 9);
    buf.writeUInt16LE(now.getSeconds(), 11);
    buf.writeUInt16LE(now.getMilliseconds() * 1000 & 0xffff, 13);

    return TelloPacket.of({
      command: Command.SetDateTime,
      payload: buf,
      sequence: this.sequence++,
    });
  }

  setExposureValue(exposure: Exposure = Exposure.Zero): Packet {
    const payload = Buffer.of(exposure);

    return TelloPacket.of({
      command: Command.SetExposureValues,
      sequence: this.sequence++,
      payload,
    });
  }

  static readonly clampAxis = clamp(-1, 1);
  // static readonly clampSpeed = clamp(0, 1);

  setStick({ leftX = 0, leftY = 0, rightX = 0, rightY = 0, fastMode = false }: Partial<Stick> = {}): Packet {
    const { clampAxis } = TelloPacketGenerator;

    const axis1 = 0x7FF & Math.trunc(660 * clampAxis(rightX) + 1024.0);
    const axis2 = 0x7FF & Math.trunc(660 * clampAxis(rightY) + 1024.0);
    const axis3 = 0x7FF & Math.trunc(660 * clampAxis(leftY) + 1024.0);
    const axis4 = 0x7FF & Math.trunc(660 * clampAxis(leftX) + 1024.0);
    const axis5 = ~~fastMode;

    /*
    All values ZERO
    0001 - 0000 0000 - 0010 0000 - 0000 0100 - 0000 0000
    1      0    0      2    0      0    4      0    0
    All values NEG
    0000 - 0101 1011 - 0000 1011 - 0110 0001 - 0110 1100
    0      5    B      0    B      6    1      6    C
    All values MAX
    0001 - 1010 0101 - 0011 0100 - 1010 0110 - 1001 0100
    1      A    5      3    4      A    6      9    4


      LIMIT 2047  = 0x7ff = 0b 0111 1111 1111
      NEG   364   = 0x16c = 0b 0001 0110 1100
      ZERO  1024  = 0x400 = 0b 0100 0000 0000
      MAX   1684  = 0x694 = 0b 0110 1001 0100

      All values NEG (364):   0x16c = 0b 0001 0110 1100
      0000 0010 - 1101 1000 - 0101 1011 - 0000 1011 - 0110 0001 - 0110 1100
      0    2      D    8      5    B      0    B      6    1      6    C

      All values ZERO (1024): 0x400 = 0b 0100 0000 0000
      0000 1000 - 0000 0001 - 0000 0000 - 0010 0000 - 0000 0100 - 0000 0000
      0    8    - 0    1    - 0    0    - 2    0    - 0    4    - 0    0

      All values MAX (1684):  0x694 = 0b 0110 1001 0100
           !               !                  !                !
      0000 !1101 | 0010 100!1 | 1010 0101 | 00!11 0100 | 1010 0!110 | 1001 0100
      0     D    | 2    9     | A    5    | 3    4     | A    6     | 9    4
    */
    const axes = Buffer.from([
      axis1,
      (axis2 << 3) | (axis1 >> 8),
      (axis3 << 6) | (axis2 >> 5),
      (axis3 >> 2),
      (axis4 << 1) | (axis3 >> 10),
      (axis5 << 4) | (axis4 >> 7),
    ]);

    const payload = Buffer.alloc(11);
    axes.copy(payload, 0);
    const now = new Date();
    payload.writeUInt8(now.getHours(), 6);
    payload.writeUInt8(now.getMinutes(), 7);
    payload.writeUInt8(now.getSeconds(), 8);
    payload.writeUInt16LE(now.getMilliseconds() & 0xffff, 9);

    return TelloPacket.of({
      command: Command.SetStick,
      sequence: 0,
      payload,
    });
  }

  setVideoBitrate(rate: VideoBitrate = VideoBitrate.Auto): Packet {
    const payload = Buffer.of(rate);

    return TelloPacket.of({
      command: Command.SetVideoBitrate,
      sequence: this.sequence++,
      payload,
    });
  }

  switchPicVid(mode: CameraMode = CameraMode.Video): Packet {
    const payload = Buffer.of(mode);

    return TelloPacket.of({
      command: Command.SetCameraMode,
      sequence: this.sequence++,
      payload,
    });
  }
}
