import { Stick } from './payloads.types';
import { Packet } from './packet.types';
import { TelloPacket } from './packet.utils';
import { Command } from './commands';

export class TelloPacketGenerator {
  private sequence = 0;


  static createTimeBuffer(): Buffer {
    const buf = Buffer.alloc(5);
    const now = new Date();
    buf.writeUInt8(now.getHours(), 0);
    buf.writeUInt8(now.getMinutes(), 1);
    buf.writeUInt8(now.getSeconds(), 2);
    const ms = now.getMilliseconds();
    buf.writeUInt8(ms & 0xff, 3);
    buf.writeUInt8(ms >> 8, 4);
    return buf;
  }

  reset() {
    this.sequence = 0;
  }

  createConnectionRequest(port: number) {
    const connectionRequest = Buffer.from('conn_req:lh');
    connectionRequest.writeUInt16LE(port, 9);
    return connectionRequest;
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

  queryVersion(): Packet {
    return TelloPacket.of({
      command: Command.QueryVersion,
      sequence: this.sequence++,
    });
  }

  queryVideoSpsPps(): Packet {
    return TelloPacket.of({
      command: Command.QueryVideoSpsPps,
      sequence: this.sequence++,
    });
  }

  queryWifiRegion(): Packet {
    return TelloPacket.of({
      command: Command.QueryWifiRegion,
      sequence: this.sequence++,
    });
  }

  queryVideoBitrate(): Packet {
    return TelloPacket.of({
      command: Command.QueryVideoBitrate,
      sequence: this.sequence++,
    });
  }

  queryHeightLimit(): Packet {
    return TelloPacket.of({
      command: Command.QueryHeightLimit,
      sequence: this.sequence++,
    });
  }

  queryLowBattThresh(): Packet {
    return TelloPacket.of({
      command: Command.QueryLowBattThresh,
      sequence: this.sequence++,
    });
  }

  queryAttitude(): Packet {
    return TelloPacket.of({
      command: Command.QueryAttitude,
      sequence: this.sequence++,
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
    if (stickVals.fastMode) {
      axes |= 1 << 44;
    }

    const payload = Buffer.alloc(11);
    payload.writeUInt8(axes & 0xFF, 0);
    payload.writeUInt8((axes >> 8) & 0xFF, 1);
    payload.writeUInt8((axes >> 16) & 0xFF, 2);
    payload.writeUInt8((axes >> 24) & 0xFF, 3);
    payload.writeUInt8((axes >> 32) & 0xFF, 4);
    payload.writeUInt8((axes >> 40) & 0xFF, 5);
    const time = TelloPacketGenerator.createTimeBuffer();
    time.copy(payload, 6);

    return TelloPacket.of({
      command: Command.SetStick,
      sequence: this.sequence++,
      payload,
    });
  }
}
