export class TelloVideoUtils {
  static FRAME_START = 0x00;
  static KEY_FRAME = 0x80;

  static isFrameStart(buf: Buffer) {
    return buf.readUInt8(1) === TelloVideoUtils.FRAME_START;
  }

  static isFrameEnd(buf: Buffer) {
    const subSequence = buf.readUInt8(1);
    return ((subSequence >> 4) === 8) && ((subSequence & 0x0f) > 0);
  }

  static isKeyframe(buf: Buffer) {
    return buf.readUInt8(1) === TelloVideoUtils.KEY_FRAME;
  }
}
