import { Stick, CameraMode, VideoBitrate, Exposure } from './payloads.types';
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

  logHeader(): Packet {
    return TelloPacket.of({
      command: Command.LogHeader,
      sequence: this.sequence++,
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
      command: Command.SetExposureVals,
      sequence: this.sequence++,
      payload,
    });
  }

  setStick(stickVals: Partial<Stick> = {}): Packet {
    const leftX = (stickVals.leftX || 0 / 90) + 1024; // 660 to 1388
    const leftY = (stickVals.leftY || 0 / 90) + 1024;
    const rightX = (stickVals.rightX || 0 / 90) + 1024;
    const rightY = (stickVals.rightY || 0 / 90) + 1024;
    let axes = rightX & 0x07ff;
    axes |= (rightY & 0x07ff) << 11;
    axes |= (leftY & 0x07ff) << 22;
    axes |= (leftX & 0x07ff) << 33;
    axes |= (~~stickVals.fastMode!) << 44;

    const stickBuf = Buffer.alloc(8);
    stickBuf.writeUInt32BE(axes >> 8, 0); // write the high order bits (shifted over)
    stickBuf.writeUInt32BE(axes & 0x00ff, 4); // write the low order bits
    stickBuf.swap64();	// BE to LE

    const payload = Buffer.alloc(11);
    payload.write(stickBuf.slice(0, 6).toString(), 0);

    const now = new Date();
    payload.writeUInt8(now.getHours(), 6);
    payload.writeUInt8(now.getMinutes(), 7);
    payload.writeUInt8(now.getSeconds(), 8);
    payload.writeUInt16LE(now.getMilliseconds() * 1000 & 0xffff, 9);

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
      command: Command.SwitchPicVid,
      sequence: this.sequence++,
      payload,
    });
  }
}
