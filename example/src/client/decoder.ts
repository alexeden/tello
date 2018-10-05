import { H264Decoder, DecodedBufferCallback } from './h264';

export class Decoder {
  static noop() { /* no-op */ }
  static now() { return performance.now(); }
  static MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;

  private readonly bufferedCalls: Array<[Uint8Array, number]> = [];
  private readonly decoder: H264Decoder;
  private streamBuffer: Uint8Array | undefined;
  private wasmInstance: WebAssembly.Instance | undefined;
  private info = {};
  private readonly pictureBuffers: { [heapLoc: number]: Uint8Array } = {};

  constructor(
    public decodedCallback: DecodedBufferCallback
  ) {
    this.decoder = new H264Decoder(Decoder.noop, this.handlePictureDecoded.bind(this));
  }

  async start() {
    const module = await this.decoder.instantiateStreaming();
    this.wasmInstance = module.instance;

    this.wasmInstance.exports._broadwayInit();
    this.streamBuffer = this.toU8Array(
      this.wasmInstance.exports._broadwayCreateStream(Decoder.MAX_STREAM_BUFFER_LENGTH),
      Decoder.MAX_STREAM_BUFFER_LENGTH
    );

    // TODO: Reimplement the bufferedCalls mechanism
    // if (bufferedCalls.length) {
    //   var bi = 0;
    //   for (bi = 0; bi < bufferedCalls.length; ++bi) {
    //     this.decode(bufferedCalls[bi][0], bufferedCalls[bi][1], bufferedCalls[bi][2]);
    //   }
    //   bufferedCalls = [];
    // }
  }

  /**
   * Decodes a stream buffer. This may be one single (unframed) NAL unit without the
   * start code, or a sequence of NAL units with framing start code prefixes. This
   * function overwrites stream buffer allocated by the codec with the supplied buffer.
   */
  decode(typedArray: Uint8Array, parInfo: any = {}) {
    if (!this.wasmInstance) {
      this.bufferedCalls.push([typedArray, parInfo]);
      return;
    }
    this.info = { ...this.info, startDecoding: Decoder.now() };
    this.streamBuffer!.set(typedArray);
    this.wasmInstance.exports._broadwayPlayStream(typedArray.length);
  }

  private toU8Array(ptr: number, length: number): Uint8Array {
    return this.decoder.HEAPU8.subarray(ptr, ptr + length);
  }

  private cacheBuffer(heapLoc: number, width: number, height: number): Uint8Array {
    if (this.pictureBuffers[heapLoc]) {
      return this.pictureBuffers[heapLoc];
    }
    else {
      const buffer = this.toU8Array(heapLoc, (width * height * 3) / 2);
      this.pictureBuffers[heapLoc] = buffer;
      return buffer;
    }
  }

  /**
   * This is the function that get injected into the WASM module and called directly
   */
  private handlePictureDecoded(heapLoc: number, width: number, height: number, info: object) {
    const buffer = this.cacheBuffer(heapLoc, width, height);
    const finalInfo = { ...this.info, ...info, finishDecoding: Decoder.now() };
    this.info = {};
    this.decodedCallback(buffer, width, height, finalInfo);
  }
}
