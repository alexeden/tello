  // tslint:disable variable-name
import { H264ModuleOptions, DecodedBufferCallback } from './h264.types';
import { H264DecoderAssemblyEnvironment } from './assembly-environment';
import wasmPath = require('./h264.decoder.wasm');


export class H264Decoder {
  static readonly MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;
  static now() { return performance.now(); }
  private readonly assemblyEnv: H264DecoderAssemblyEnvironment;
  private readonly bufferedCalls: Array<[Uint8Array, number]> = [];
  private readonly pictureBuffers: { [heapLoc: number]: Uint8Array } = {};
  private streamBuffer: Uint8Array | undefined;
  private wasmInstance: WebAssembly.Instance | undefined;
  private info = {};

  readonly decodedImageListener: DecodedBufferCallback;
  readonly decodedHeaderListener: DecodedBufferCallback;

  constructor(public opts: H264ModuleOptions) {
    const {
      totalMemory = 0x3200000,
      decodedHeaderListener = () => undefined,
      decodedImageListener,
    } = opts;

    this.decodedHeaderListener = decodedHeaderListener;
    this.decodedImageListener = decodedImageListener;

    this.assemblyEnv = new H264DecoderAssemblyEnvironment(
      /**
       * This is the function that gets injected into the WASM module and called directly
       * by the WASM code when a chunk of data has been decoded
       */
      (heapLoc, width, height, info) => {
        const buffer = this.cacheBuffer(heapLoc, width, height);
        const finalInfo = { ...this.info, ...info, finishDecoding: H264Decoder.now() };
        this.info = {};
        this.decodedImageListener(buffer, width, height, finalInfo);
      },
      () => undefined,
      totalMemory
    );
  }

  async start() {
    try {
      const wasm = await WebAssembly.instantiateStreaming(fetch(wasmPath), { global: {}, env: this.assemblyEnv });
      this.wasmInstance = wasm.instance;
      this.wasmInstance.exports._broadwayInit();
      this.streamBuffer = this.toU8Array(
        this.wasmInstance.exports._broadwayCreateStream(H264Decoder.MAX_STREAM_BUFFER_LENGTH),
        H264Decoder.MAX_STREAM_BUFFER_LENGTH
      );
      return this.wasmInstance;
    }
    catch (e) {
      console.error('Failed to instantiate the WebAssembly module', e);
      return this.assemblyEnv.abort(e);
    }
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
    this.info = { ...this.info, startDecoding: H264Decoder.now() };
    this.streamBuffer!.set(typedArray);
    this.wasmInstance.exports._broadwayPlayStream(typedArray.length);
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

  private toU8Array(ptr: number, length: number): Uint8Array {
    return this.assemblyEnv.HEAPU8.subarray(ptr, ptr + length);
  }
}
