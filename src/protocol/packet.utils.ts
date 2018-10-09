import { Packet, Sender, Offset, Type } from './packet.types';
import { Command } from './commands';
import { calcCRC8, calcCRC16 } from '../utils/crc';

export class TelloPacket {
  static readonly HEADER = 0xCC;
  static readonly MIN_PACKET_SIZE = 11;

  static bufferIsPacket(buf: Buffer) {
    return buf.readUInt8(0) === TelloPacket.HEADER;
  }

  static of(
    p: Partial<Packet> = { command: Command.QueryVersion },
    sequence = 0
  ): Packet {
    const { command } = p;
    const type = TelloPacket.getCommandType(command!);
    return {
      sequence,
      sender: Sender.App,
      payload: Buffer.of(),
      ...p,
      command: command!,
      type,
    };
  }

  static fromBuffer(buf: Buffer): Packet {
    return {
      payload: buf.slice(9, buf.length - 2),
      sender: buf[4] & 0xC0,
      type: (buf[4] >> 3) & 0x07,
      command: buf[5] | (buf[6] << 8),
      sequence: buf[7] | (buf[8] << 8),
    };
  }

  static toBuffer(p: Packet): Buffer {
    const { payload } = p;
    const n = payload.length + TelloPacket.MIN_PACKET_SIZE;
    const buf = Buffer.allocUnsafe(n);
    buf.writeUInt8(TelloPacket.HEADER, Offset.Header);
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

  static getCommandLabel(cmd: Command): string {
    return Command[cmd];
  }

  static getCommandType(cmd: Command): Type {
    switch (cmd) {
      case Command.Error1:
      case Command.Error2:
      case Command.FlightStatus:
      case Command.LightStrength:
      case Command.LogDataWrite:
      case Command.WifiStrength:
        return Type.Extended;
      case Command.DoPalmLand:
      case Command.DoThrowTakeoff:
      case Command.SetExposureValues:
      case Command.FileDone:
      case Command.HandleImuAngle:
      case Command.QueryActivationTime:
      case Command.QueryAttitude:
      case Command.QueryHeightLimit:
      case Command.QueryLoaderVersion:
      case Command.QueryLowBattThresh:
      case Command.QuerySsid:
      case Command.QuerySsidPass:
      case Command.QueryVersion:
      case Command.QueryVideoBitrate:
      case Command.QueryWifiRegion:
        return Type.Get;
      case Command.FileData:
      case Command.FileSize:
      case Command.LogConfig:
      case Command.LogHeader:
      case Command.SetDateTime:
      case Command.SmartVideoStatus:
        return Type.DataOne;
      case Command.QueryVideoSpsPps:
      case Command.SetStick:
        return Type.DataTwo;
      case Command.DoBounce:
      case Command.DoCalibration:
      case Command.DoLand:
      case Command.DoSmartVideo:
      case Command.DoStartRecording:
      case Command.DoTakeoff:
      case Command.DoTakePic:
      case Command.EisSetting:
      case Command.QueryJpegQuality:
      case Command.SetAttitude:
      case Command.SetDynAdjRate:
      case Command.SetHeightLimit:
      case Command.SetLowBattThresh:
      case Command.SetSsid:
      case Command.SetSsidPass:
      case Command.SetVideoBitrate:
      case Command.SetWifiRegion:
      case Command.SetCameraMode:
        return Type.Set;
      case Command.DoFlip:
        return Type.Flip;
      default:
        throw new Error(`Unknown command "${cmd}", can't get command type.`);
    }
  }
}
