import { Command } from './commands';

export enum Type {
  Extended = 0, // 0x8X ???
  Get      = 1, // 0x48
  DataOne  = 2, // 0x50
  DataTwo  = 4, // 0x60
  Set      = 5, // 0x68
  Flip     = 6, // 0x70
}

export enum Offset {
  Header    = 0,
  Size      = 1,
  Crc8      = 3,
  Type      = 4,
  Command   = 5,
  Sequence  = 7,
  Payload   = 9,
  Crc16     = 10,
}

export enum Sender {
  Drone = 0x80,
  App   = 0x40,
}

export interface Packet {
  sender: Sender;
  type: Type;
  command: Command;
  payload: Buffer;
  sequence: number;
}
