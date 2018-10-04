import { AvcModule, DecodedCallback } from './avc.module';

export class Decoder {
  static now() {
    return performance.now();
  }

  constructor(
    public decodedCallback: DecodedCallback,
    parOptions: any
  ) {
    console.log(this);
    this.options = parOptions || {};
    var toU8Array;

    var MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;


    this.onDecoderReady = noop;

    var bufferedCalls = [];
    this.decode = function decode(typedAr, parInfo, copyDoneFun) {
      bufferedCalls.push([typedAr, parInfo, copyDoneFun]);
    };

    const onModuleReady = Module => {
      Module._broadwayInit();
      /**
       * Creates a typed array from a HEAP8 pointer.
       */
      toU8Array = function (ptr, length) {
        return Module.HEAPU8.subarray(ptr, ptr + length);
      };
      this.streamBuffer = toU8Array(Module._broadwayCreateStream(MAX_STREAM_BUFFER_LENGTH), MAX_STREAM_BUFFER_LENGTH);
      this.pictureBuffers = {};
      this.infoAr = [];



      if (bufferedCalls.length) {
        var bi = 0;
        for (bi = 0; bi < bufferedCalls.length; ++bi) {
          this.decode(bufferedCalls[bi][0], bufferedCalls[bi][1], bufferedCalls[bi][2]);
        };
        bufferedCalls = [];
      };
      this.onDecoderReady(this);
    };

    getModule(noop, onPicFun).then(onModuleReady);
  }

  /**
   * Decodes a stream buffer. This may be one single (unframed) NAL unit without the
   * start code, or a sequence of NAL units with framing start code prefixes. This
   * function overwrites stream buffer allocated by the codec with the supplied buffer.
   */
  decode(typedAr, parInfo) {
    if (parInfo) {
      this.infoAr.push(parInfo);
      parInfo.startDecoding = Decoder.now();
    }

    this.streamBuffer.set(typedAr);
    Module._broadwayPlayStream(typedAr.length);
  }


  handleDecodedFrame($buffer: Uint8Array, width: number, height: number, infos: object[]) {
    var buffer = this.pictureBuffers[$buffer];
    if (!buffer) {
      buffer = this.pictureBuffers[$buffer] = toU8Array($buffer, (width * height * 3) / 2);
    }

    var infos;
    var doInfo = false;
    if (this.infoAr.length) {
      doInfo = true;
      infos = this.infoAr;
    };
    this.infoAr = [];

    if (doInfo) {
      infos[0].finishDecoding = this.now();
    };

    this.decodedCallback(buffer, width, height, infos);
  }
}
