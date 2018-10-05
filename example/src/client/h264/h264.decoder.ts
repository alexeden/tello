import { H264ModuleImportObject, DecodedHeapCallback, H264ModuleOptions } from './h264.types';
import wasmPath = require('./h264.decoder.wasm');

export class H264Decoder implements H264ModuleImportObject {
  static readonly DYNAMICTOP_PTR  = 0x2ab0;
  static readonly STACK_BASE      = 0x2ab0;
  static readonly STACKTOP        = 0x2ac0;
  static readonly TOTAL_MEMORY    = 0x3200000;
  static readonly TOTAL_STACK     = 0x500000;
  static readonly WASM_PAGE_SIZE  = 0x10000;
  static readonly STACK_MAX       = H264Decoder.STACK_BASE + H264Decoder.TOTAL_STACK;
  static readonly DYNAMIC_BASE    = Math.ceil(H264Decoder.STACK_MAX / 16) * 16;

  readonly DYNAMICTOP_PTR  = H264Decoder.DYNAMICTOP_PTR;
  readonly STACKTOP  = H264Decoder.STACKTOP;
  readonly memory: WebAssembly.Memory;
  readonly table: WebAssembly.Table;
  readonly tableBase = 0;
  readonly HEAPU8: Uint8Array;
  readonly HEAP16: Int16Array;
  readonly HEAP32: Int32Array;

  private syscallVarargs = 0;

  constructor(
    public _broadwayOnHeadersDecoded: DecodedHeapCallback, // tslint:disable-line:variable-name
    public _broadwayOnPictureDecoded: DecodedHeapCallback, // tslint:disable-line:variable-name
    public opts: H264ModuleOptions = {}
  ) {
    const {
      totalMemory = 0x3200000,
    } = opts;

    this.memory = new WebAssembly.Memory({
      initial: totalMemory / H264Decoder.WASM_PAGE_SIZE,
      maximum: totalMemory / H264Decoder.WASM_PAGE_SIZE,
    });

    this.table = new WebAssembly.Table({
      initial: 10,
      maximum: 10,
      element: 'anyfunc',
    });

    this.HEAPU8 = new Uint8Array(this.memory.buffer);
    this.HEAP16 = new Int16Array(this.memory.buffer);
    this.HEAP32 = new Int32Array(this.memory.buffer);
    this.HEAP32[0] = 1668509029;
    this.HEAP16[1] = 25459;
    this.HEAP32[H264Decoder.DYNAMICTOP_PTR >> 2] = H264Decoder.DYNAMIC_BASE;
    if (this.HEAPU8[2] !== 115 || this.HEAPU8[3] !== 99) {
      throw new Error('Runtime error: expected the system to be little-endian!');
    }
  }

  async instantiateModule() {
    try {
      return WebAssembly.instantiateStreaming(fetch(wasmPath), {
        global: {},
        env: this,
      });
    }
    catch (e) {
      console.error('Failed to instantiate the WebAssembly module', e);
      return this.abort(e);
    }
  }

  private syscallGet() {
    this.syscallVarargs += 4;
    return this.HEAP32[this.syscallVarargs - 4 >> 2];
  }

  private assert(condition: any, text: string) {
    if (!condition) {
      this.abort('Assertion failed: ' + text);
    }
  }

  abort(what: any): never {
    throw new Error(`abort(${what !== undefined ? JSON.stringify(what) : ''}). Build with -s ASSERTIONS=1 for more info.`);
  }

  enlargeMemory(): never {
     return this.abort(`Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ${H264Decoder.TOTAL_MEMORY}, (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 `);
  }

  getTotalMemory() {
     return H264Decoder.TOTAL_MEMORY;
  }

  abortOnCannotGrowMemory() {
    return this.abort(`Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ${H264Decoder.TOTAL_MEMORY}, (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 `);
  }

  ___setErrNo(value: any) {
    return value;
  }

  ___syscall140(which: unknown, varargs: number) {
    this.syscallVarargs = varargs;
    return this.abort('__syscall6 invoked despite no access to file descriptors on this system');
  }

  ___syscall54(which: unknown, varargs: number) {
    this.syscallVarargs = varargs;
    return 0;
  }

  ___syscall6(which: unknown, varargs: number) {
    this.syscallVarargs = varargs;
    return this.abort('__syscall6 invoked despite no access to file descriptors on this system');
  }

  ___syscall146(which: unknown, varargs: number) {
    console.log('___syscall146', varargs);
    this.syscallVarargs = varargs;
    try {
      const stream = this.syscallGet();
      const iov = this.syscallGet();
      const iovcnt = this.syscallGet();
      if (!(this.___syscall146 as any).buffers) {
        (this.___syscall146 as any).buffers = [null, [], []];
        (this.___syscall146 as any).printChar = (i: number, curr: number) => {
          const buffer = (this.___syscall146 as any).buffers[i];
          this.assert(buffer, '___syscall146 buffer exists');
          if (curr === 0 || curr === 10) buffer.length = 0;
          else buffer.push(curr);
        };
      }
      let ret = 0;
      for (let i = 0; i < iovcnt; i++) {
        const ptr = this.HEAP32[iov + i * 8 >> 2];
        const len = this.HEAP32[iov + (i * 8 + 4) >> 2];
        for (let j = 0; j < len; j++) (this.___syscall146 as any).printChar(stream, this.HEAPU8[ptr + j]);
        ret += len;
      }
      return ret;
    }
    catch (e) {
      return this.abort(e);
    }
  }

  _emscripten_memcpy_big(dest: number, src: number, num: number) {
    this.HEAPU8.set(this.HEAPU8.subarray(src, src + num), dest);
    return dest;
  }

}
