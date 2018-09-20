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
  Drone = 1 << 7,
  App   = 1 << 6,
}

export class TelloPacket {
  static readonly HEADER = 0xCC;
  static readonly MIN_PACKET_SIZE = 0x0B;




}
