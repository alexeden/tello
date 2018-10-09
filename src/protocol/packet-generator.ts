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
    buf.writeUInt16LE(now.getFullYear() - 1900, 1);
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

  setStick({ leftX = 0, leftY = 0, rightX = 0, rightY = 0, speed = 0.1 }: Partial<Stick> = {}): Packet {
    const axis1 = Math.trunc(660 * rightX + 1024.0); // RightX center=1024 left =364 right =-364
    const axis2 = Math.trunc(660 * rightY + 1024.0); // RightY down =364 up =-364
    const axis3 = Math.trunc(660 * leftY + 1024.0); // LeftY down =364 up =-364
    const axis4 = Math.trunc(660 * leftX + 1024.0); // LeftX left =364 right =-364
    const axis5 = Math.trunc(660 * speed + 1024.0); // Speed.

    const packedAxis = (axis1 & 0x7FF) | ((axis2 & 0x7FF) << 11) | ((0x7FF & axis3) << 22) | ((0x7FF & axis4) << 33) | (axis5 << 44);

    const payload = Buffer.allocUnsafe(11);
    payload[0] = 0xFF & packedAxis;
    payload[1] = packedAxis >> 8 & 0xFF;
    payload[2] = packedAxis >> 16 & 0xFF;
    payload[3] = packedAxis >> 24 & 0xFF;
    payload[4] = packedAxis >> 32 & 0xFF;
    payload[5] = packedAxis >> 40 & 0xFF;

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
  // setStick(stickVals: Partial<Stick> = {}): Packet {
  //   const leftX = (stickVals.leftX || 0 / 90) + 1024; // 660 to 1388
  //   const leftY = (stickVals.leftY || 0 / 90) + 1024;
  //   const rightX = (stickVals.rightX || 0 / 90) + 1024;
  //   const rightY = (stickVals.rightY || 0 / 90) + 1024;
  //   let axes = rightX & 0x07ff;
  //   axes |= (rightY & 0x07ff) << 11;
  //   axes |= (leftY & 0x07ff) << 22;
  //   axes |= (leftX & 0x07ff) << 33;
  //   axes |= (~~stickVals.fastMode!) << 44;

  //   const stickBuf = Buffer.alloc(8);
  //   stickBuf.writeUInt32BE(axes >> 8, 0); // write the high order bits (shifted over)
  //   stickBuf.writeUInt32BE(axes & 0x00ff, 4); // write the low order bits
  //   stickBuf.swap64();	// BE to LE

  //   const payload = Buffer.alloc(11);
  //   payload.write(stickBuf.slice(0, 6).toString(), 0);

  //   const now = new Date();
  //   payload.writeUInt8(now.getHours(), 6);
  //   payload.writeUInt8(now.getMinutes(), 7);
  //   payload.writeUInt8(now.getSeconds(), 8);
  //   payload.writeUInt16LE(now.getMilliseconds() * 1000 & 0xffff, 9);

  //   return TelloPacket.of({
  //     command: Command.SetStick,
  //     sequence: 0,
  //     payload,
  //   });
  // }

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
