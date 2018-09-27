type Bit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export class Bitwise {
  static bitreader = (byte: number) => (bit: Bit): boolean => (byte >> bit & 0x1) === 1;
}
