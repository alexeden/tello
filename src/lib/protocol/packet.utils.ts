import { Packet, Sender, Offset } from './packet.types';
import { MIN_PACKET_SIZE, HEADER } from './packet.constants';
import { calcCRC8, calcCRC16 } from './crc';
import { GetCommand, Type } from './commands';

export class TelloPacket {

  static of(p: Partial<Packet> = {}, sequence = 0): Packet {
    return {
      command: GetCommand.QueryVersion,
      sequence,
      sender: Sender.App,
      payload: Buffer.of(),
      type: Type.Extended,
      ...p,
    };
  }

  static fromBuffer(buf: Buffer): Packet {
    const n = (buf[1] + (buf[2] << 8)) >> 3;

    return {
      payload: buf.slice(9, n - MIN_PACKET_SIZE),
      sender: buf[4] & 0xC0,
      type: (buf[4] >> 3) & 0x07,
      command: buf[5] | (buf[6] << 8),
      sequence: buf[7] | (buf[8] << 8),
    };
  }

  static toBuffer(p: Packet): Buffer {
    const { payload } = p;
    const n = payload.length + MIN_PACKET_SIZE;
    const buf = Buffer.allocUnsafe(n);
    buf.writeUInt8(HEADER, Offset.Header);
    buf.writeUInt16LE(n << 3, Offset.Size);
    buf.writeUInt8(calcCRC8(buf.slice(0, 3)), Offset.Crc8);
    buf.writeUInt8(p.sender | (p.type << 3), Offset.Type);
    buf.writeUInt16LE(p.command, Offset.Command);
    buf.writeUInt16LE(p.sequence, Offset.Sequence);
    payload.copy(buf, Offset.Payload);
    const c16 = calcCRC16(buf.slice(0, 9 + payload.length));
    buf.writeUInt16LE(c16, Offset.Crc16 + payload.length - 1);
    return buf;
  }
}
