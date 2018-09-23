import { Command, Type } from './commands';

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
