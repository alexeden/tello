const noop = () => undefined;
const TOTAL_STACK = 0x500000;
const TOTAL_MEMORY = 0x3200000;
const STACK_BASE = 0x2ab0;
const WASM_PAGE_SIZE = 65536;
const STACKTOP = 0x2ac0; // GLOBAL_BASE + 9888 + 16;
const STACK_MAX = STACK_BASE + TOTAL_STACK;
const DYNAMIC_BASE = Math.ceil(STACK_MAX / 16) * 16;
const DYNAMICTOP_PTR = 0x2ab0;
const assert = (condition, text) => {
  if (!condition) {
    abort("Assertion failed: " + text)
  }
};
const abort = what => {
  if (what !== undefined) {
    console.warn(what);
    what = JSON.stringify(what);
  }
  else {
    what = '';
  }
  throw `abort(${what}). Build with -s ASSERTIONS=1 for more info.`;
}

// universal module definition
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  }
  else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports, like Node.
    module.exports = factory();
  }
  else {
    // Browser globals (root is window)
    root.Decoder = factory();
  }
}(this, function () {
  const startWasm = async importObject => {
    try {
      const wasmFile = fetch('avc.wasm', { credentials: 'same-origin' });
      return WebAssembly.instantiateStreaming(wasmFile, importObject);
    }
    catch (e) {
      console.error('Failed to instantiate the WebAssembly module', e);
      abort(e);
    }
  };

  /**
   * The reason why this is all packed into one file is that this file can also function as worker.
   * you can integrate the file into your build system and provide the original file to be loaded into a worker.
   */
  const getModule = async (onHeadersDecoded, onPictureDecoded) => {
    const wasmMemory = new WebAssembly.Memory({
      initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
      maximum: TOTAL_MEMORY / WASM_PAGE_SIZE,
    });

    const wasmTable = new WebAssembly.Table({
      initial: 10,
      maximum: 10,
      element: 'anyfunc',
    });

    const Module = {};
    const HEAPU8 = new Uint8Array(wasmMemory.buffer);
    const HEAP16 = new Int16Array(wasmMemory.buffer);
    const HEAP32 = new Int32Array(wasmMemory.buffer);
    Module.HEAPU8 = HEAPU8;
    HEAP32[0] = 1668509029;
    HEAP16[1] = 25459;
    HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
    if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99) throw 'Runtime error: expected the system to be little-endian!';

    const SYSCALLS = {
      varargs: 0,
      get: () => {
        SYSCALLS.varargs += 4;
        return HEAP32[SYSCALLS.varargs - 4 >> 2];
      },
    };

    function ___syscall146(which, varargs) {
      console.log('___syscall146', varargs);
      SYSCALLS.varargs = varargs;
      try {
        const stream = SYSCALLS.get();
        const iov = SYSCALLS.get();
        const iovcnt = SYSCALLS.get();
        if (!___syscall146.buffers) {
          ___syscall146.buffers = [null, [], []];
          ___syscall146.printChar = (stream, curr) => {
            const buffer = ___syscall146.buffers[stream];
            assert(buffer);
            if (curr === 0 || curr === 10) buffer.length = 0;
            else buffer.push(curr);
          };
        }
        let ret = 0;
        for (let i = 0; i < iovcnt; i++) {
          const ptr = HEAP32[iov + i * 8 >> 2];
          const len = HEAP32[iov + (i * 8 + 4) >> 2];
          for (let j = 0; j < len; j++) ___syscall146.printChar(stream, HEAPU8[ptr + j]);
          ret += len;
        }
        return ret
      }
      catch (e) {
        abort(e);
      }
    }

    const wasmInstance = await startWasm({
      global: {},
      env: {
        memory: wasmMemory,
        table: wasmTable,
        tableBase: 0,
        abort,
        enlargeMemory: () => abort(`Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ${TOTAL_MEMORY}, (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 `),
        getTotalMemory: () => TOTAL_MEMORY,
        abortOnCannotGrowMemory: () => abort(`Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ${TOTAL_MEMORY}, (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 `),
        ___setErrNo: value => value,
        ___syscall140(which, varargs) {
          SYSCALLS.varargs = varargs;
          abort('__syscall6 invoked despite no access to file descriptors on this system');
        },
        ___syscall146,
        ___syscall54(which, varargs) {
          console.log('___syscall54', varargs);
          SYSCALLS.varargs = varargs;
          return 0;
        },
        ___syscall6(which, varargs) {
          SYSCALLS.varargs = varargs;
          abort('__syscall6 invoked despite no access to file descriptors on this system');
        },
        _broadwayOnHeadersDecoded: noop,
        _broadwayOnPictureDecoded: onPictureDecoded,
        _emscripten_memcpy_big(dest, src, num) {
          HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
          return dest;
        },
        DYNAMICTOP_PTR,
        STACKTOP,
      },
    });
    console.log(wasmInstance);
    Object.assign(Module, wasmInstance.instance.exports);
    return Module;
  };
  // END getModule()


  return (() => {

    var Decoder = function (parOptions) {
      console.log(this);
      this.options = parOptions || {};
      this.now = () => performance.now();
      var toU8Array;

      var onPicFun = ($buffer, width, height) => {
        var buffer = this.pictureBuffers[$buffer];
        if (!buffer) {
          buffer = this.pictureBuffers[$buffer] = toU8Array($buffer, (width * height * 3) / 2);
        };

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
        this.onPictureDecoded(buffer, width, height, infos);
      };


      var MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;

      this.onPictureDecoded = function (buffer, width, height, infos) {

      };

      this.onDecoderReady = noop;

      var bufferedCalls = [];
      this.decode = function decode(typedAr, parInfo, copyDoneFun) {
        bufferedCalls.push([typedAr, parInfo, copyDoneFun]);
      };

      const onModuleReady = Module => {
        Module._broadwayInit();
        /**
        //  * Creates a typed array from a HEAP8 pointer.
         */
        toU8Array = function (ptr, length) {
          return Module.HEAPU8.subarray(ptr, ptr + length);
        };
        this.streamBuffer = toU8Array(Module._broadwayCreateStream(MAX_STREAM_BUFFER_LENGTH), MAX_STREAM_BUFFER_LENGTH);
        this.pictureBuffers = {};
        this.infoAr = [];

        /**
         * Decodes a stream buffer. This may be one single (unframed) NAL unit without the
         * start code, or a sequence of NAL units with framing start code prefixes. This
         * function overwrites stream buffer allocated by the codec with the supplied buffer.
         */
        this.decode = (typedAr, parInfo) => {
          if (parInfo) {
            this.infoAr.push(parInfo);
            parInfo.startDecoding = this.now();
          }

          this.streamBuffer.set(typedAr);
          Module._broadwayPlayStream(typedAr.length);
        };


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


    };

    /**
     * worker initialization
     */
    var decoder;
    let messageCount = 0;
    let decoderIsReady = false;

    self.addEventListener('message', e => {
      if (++messageCount < 50) console.log('message event', e);

      if (e.data && e.data.type === "Broadway.js - Worker init") {
        decoder = new Decoder(e.data.options);
        decoderIsReady = true;
        decoder.onPictureDecoded = function (buffer, width, height, infos) {
          if (buffer) buffer = new Uint8Array(buffer);
          // buffer needs to be copied because we give up ownership
          var copyU8 = new Uint8Array(buffer.length);
          copyU8.set(buffer, 0, buffer.length);
          postMessage({
            buf: copyU8.buffer,
            length: buffer.length,
            width: width,
            height: height,
            infos: infos
          }, [copyU8.buffer]); // 2nd parameter is used to indicate transfer of ownership
        };
        postMessage({ consoleLog: "broadway worker initialized" });
      }
      else if (decoderIsReady && e.data.buf) {
        decoder.decode(
          new Uint8Array(e.data.buf, e.data.offset || 0, e.data.length),
          e.data.info,
          noop
        );
      }
      else {
        console.log('not sure what to do with this message event: ', e);
      }
    });

    return Decoder;
  })();
}));
