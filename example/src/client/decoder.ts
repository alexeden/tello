import { AvcModule, DecodedCallback } from './avc.module';

export class Decoder {
  static noop() { /* no-op */ }
  static now() { return performance.now(); }
  static MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;

  ready = false;
  private readonly bufferedCalls: Array<[Uint8Array, number]> = [];

  private readonly avc: AvcModule;
  private streamBuffer: Uint8Array | undefined;
  private wasmInstance: WebAssembly.Instance | undefined;
  private readonly pictureBuffers: { [heapLoc: number]: Uint8Array } = {};

  constructor(
    public decodedCallback: DecodedCallback
  ) {
    this.avc = new AvcModule(Decoder.noop, this.handleDecodedFrame.bind(this));
  }

  async start() {
    const module = await this.avc.instantiateModule();
    this.wasmInstance = module.instance;

    this.wasmInstance.exports._broadwayInit();
    this.ready = true;
    this.streamBuffer = this.toU8Array(
      this.wasmInstance.exports._broadwayCreateStream(Decoder.MAX_STREAM_BUFFER_LENGTH),
      Decoder.MAX_STREAM_BUFFER_LENGTH
    );
    this.infoAr = [];


    // TODO: Reimplement the bufferedCalls mechanism
    // if (bufferedCalls.length) {
    //   var bi = 0;
    //   for (bi = 0; bi < bufferedCalls.length; ++bi) {
    //     this.decode(bufferedCalls[bi][0], bufferedCalls[bi][1], bufferedCalls[bi][2]);
    //   }
    //   bufferedCalls = [];
    // }
  }

  toU8Array(ptr: number, length: number): Uint8Array {
    return this.avc.HEAPU8.subarray(ptr, ptr + length);
  }

  /**
   * Decodes a stream buffer. This may be one single (unframed) NAL unit without the
   * start code, or a sequence of NAL units with framing start code prefixes. This
   * function overwrites stream buffer allocated by the codec with the supplied buffer.
   */
  decode(typedArray: Uint8Array, parInfo: any) {
    if (!this.wasmInstance) {
      this.bufferedCalls.push([typedArray, parInfo]);
      return;
    }

    if (parInfo) {
      this.infoAr.push(parInfo);
      parInfo.startDecoding = Decoder.now();
    }

    this.streamBuffer!.set(typedArray);
    this.wasmInstance.exports._broadwayPlayStream(typedArray.length);
  }


  handleDecodedFrame($buffer: number, width: number, height: number, infos: object[]) {
    let buffer = this.pictureBuffers[$buffer];
    if (!buffer) {
      buffer = this.pictureBuffers[$buffer] = this.toU8Array($buffer, (width * height * 3) / 2);
    }

    var infos;
    var doInfo = false;
    if (this.infoAr.length) {
      doInfo = true;
      infos = this.infoAr;
    };
    this.infoAr = [];

    if (doInfo) {
      infos[0].finishDecoding = Decoder.now();
    };

    this.decodedCallback(buffer, width, height, infos);
  }
}
