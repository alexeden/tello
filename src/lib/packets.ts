import { calcCRC8, calcCRC16 } from '../utils/crc';

// tslint:disable no-bitwise

/**
 * Position	Usage
 * 0	      0xcc indicates the start of a packet
 * 1-2	    Packet size, 13 bit encoded ([2] << 8) | ([1] >> 3)
 * 3	      CRC8 of bytes 0-2
 * 4	      Packet type ID
 * 5-6	    Command ID, little endian
 * 7-8	    Sequence number of the packet, little endian
 * 9-(n-2)  Data (if any)
 * (n-1)-n	CRC16 of bytes 0 to n-2
 */

export enum PacketType {
  Extended = 0,
  Get      = 1,
  Data1    = 2,
  Data2    = 4,
  Set      = 5,
  Flip     = 6,
}

export enum PacketSender {
  Drone = 0x80,
  App   = 0x40,
}

export enum Command {
  DoConnect           = 0x0001, // 1
  Connected           = 0x0002, // 2
  QuerySSID           = 0x0011, // 17
  SetSSID             = 0x0012, // 18
  QuerySSIDPass       = 0x0013, // 19
  SetSSIDPass         = 0x0014, // 20
  QueryWifiRegion     = 0x0015, // 21
  SetWifiRegion       = 0x0016, // 22
  WifiStrength        = 0x001a, // 26
  SetVideoBitrate     = 0x0020, // 32
  SetDynAdjRate       = 0x0021, // 33
  EisSetting          = 0x0024, // 36
  QueryVideoSPSPPS    = 0x0025, // 37
  QueryVideoBitrate   = 0x0028, // 40
  DoTakePic           = 0x0030, // 48
  SwitchPicVideo      = 0x0031, // 49
  DoStartRec          = 0x0032, // 50
  ExposureVals        = 0x0034, // 52 (Get or set?)
  LightStrength       = 0x0035, // 53
  QueryJPEGQuality    = 0x0037, // 55
  Error1              = 0x0043, // 67
  Error2              = 0x0044, // 68
  QueryVersion        = 0x0045, // 69
  SetDateTime         = 0x0046, // 70
  QueryActivationTime = 0x0047, // 71
  QueryLoaderVersion  = 0x0049, // 73
  SetStick            = 0x0050, // 80
  DoTakeoff           = 0x0054, // 84
  DoLand              = 0x0055, // 85
  FlightStatus        = 0x0056, // 86
  SetHeightLimit      = 0x0058, // 88
  DoFlip              = 0x005c, // 92
  DoThrowTakeoff      = 0x005d, // 93
  DoPalmLand          = 0x005e, // 94
  FileSize            = 0x0062, // 98
  FileData            = 0x0063, // 99
  FileDone            = 0x0064, // 100
  DoSmartVideo        = 0x0080, // 128
  SmartVideoStatus    = 0x0081, // 129
  LogHeader           = 0x1050, // 4176
  LogData             = 0x1051, // 4177
  LogConfig           = 0x1052, // 4178
  DoBounce            = 0x1053, // 4179
  DoCalibration       = 0x1054, // 4180
  SetLowBattThresh    = 0x1055, // 4181
  QueryHeightLimit    = 0x1056, // 4182
  QueryLowBattThresh  = 0x1057, // 4183
  SetAttitude         = 0x1058, // 4184
  QueryAttitude       = 0x1059, // 4185
}

export interface Packet {
  sender: PacketSender;
  type: PacketType;
  command: Command;
  payload: Buffer;
  sequence: number;
}

export class TelloPacket {
  static readonly HEADER = 0xCC;
  static readonly MIN_PACKET_SIZE = 0x0B;

  private static packetTypeId(sender: PacketSender, type: PacketType) {
    return sender | type;
  }

  static of(p: Partial<Packet> = {}, sequence = 0): Packet {
    return {
      command: Command.DoConnect,
      sequence,
      sender: PacketSender.App,
      payload: Buffer.of(),
      type: PacketType.Extended,
      ...p,
    };
  }

  static toBuffer(p: Packet): Buffer {
    const { payload } = p;
    const n = payload.length + TelloPacket.MIN_PACKET_SIZE;
    const buf = Buffer.allocUnsafe(n);

    buf[0] = TelloPacket.HEADER;
    buf[1] = n << 3;
    buf[2] = n >> 5;
    buf[3] = calcCRC8(buf.slice(0, 3));
    buf[4] = p.sender | (p.type << 3);
    buf[5] = p.command;
    buf[6] = p.command >> 8;
    buf[7] = p.sequence;
    buf[8] = p.sequence >> 8;
    const c16 = calcCRC16(buf.slice(0, 9 + payload.length));
    payload.copy(buf, 9);
    buf[9 + payload.length] = c16;
    buf[10 + payload.length] = c16 >> 8;
    // console.log(`(2) type: ${p.type.toString(2)}, sender: ${p.sender.toString(2)}, value: ${buf[4].toString(2)}`);
    // console.log(`(16) type: ${p.type.toString(16)}, sender: ${p.sender.toString(16)}, value: ${buf[4].toString(16)}`);
    // console.log(`(10) type: ${p.type.toString(10)}, sender: ${p.sender.toString(10)}, value: ${buf[4].toString(10)}`);
    return buf;
  }
}
