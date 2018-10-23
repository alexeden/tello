// tslint:disable variable-name
import { DecodedHeapCallback } from './h264.types';

export class H264DecoderAssemblyEnvironment {
  private readonly STACK_BASE      = 0x2ab0;
  private readonly TOTAL_STACK     = 0x500000;
  private readonly WASM_PAGE_SIZE  = 0x10000;
  private readonly DYNAMICTOP_PTR  = 0x2ab0;
  private readonly STACK_MAX       = this.STACK_BASE + this.TOTAL_STACK;
  private readonly DYNAMIC_BASE    = Math.ceil(this.STACK_MAX / 16) * 16;
  protected readonly STACKTOP      = 0x2ac0;

  protected readonly memory: WebAssembly.Memory;
  protected readonly table: WebAssembly.Table;
  protected readonly tableBase = 0;
  readonly HEAPU8: Uint8Array;
  readonly HEAP16: Int16Array;
  readonly HEAP32: Int32Array;
  private syscallVarargs = 0;

  constructor(
    protected readonly _broadwayOnPictureDecoded: DecodedHeapCallback,
    protected readonly _broadwayOnHeadersDecoded: DecodedHeapCallback = () => undefined,
    readonly totalMemory: number = 0x3200000
  ) {
    this.memory = new WebAssembly.Memory({
      initial: this.totalMemory / this.WASM_PAGE_SIZE,
      maximum: this.totalMemory / this.WASM_PAGE_SIZE,
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
    this.HEAP32[this.DYNAMICTOP_PTR >> 2] = this.DYNAMIC_BASE;
    if (this.HEAPU8[2] !== 115 || this.HEAPU8[3] !== 99) {
      throw new Error('Runtime error: expected the system to be little-endian!');
    }
  }

  private syscallGet() {
    this.syscallVarargs += 4;
    return this.HEAP32[this.syscallVarargs - 4 >> 2];
  }

  private assert = (condition: any, text: string) => {
    if (!condition) {
      this.abort('Assertion failed: ' + text);
    }
  }

  abort(what: any): never {
    throw new Error(`abort(${what !== undefined ? JSON.stringify(what) : ''}). Build with -s ASSERTIONS=1 for more info.`);
  }

  protected enlargeMemory = (): never => {
    return this.abort(`Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ${this.totalMemory}, (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 `);
  }

  protected _emscripten_memcpy_big = (dest: number, src: number, num: number) => {
    this.HEAPU8.set(this.HEAPU8.subarray(src, src + num), dest);
    return dest;
  }

  protected getTotalMemory = () => {
    return this.totalMemory;
  }

  protected abortOnCannotGrowMemory = () => {
    return this.abort(`Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ${this.totalMemory}, (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 `);
  }

  protected ___setErrNo = (value: any) => {
    return value;
  }

  protected ___syscall140 = (which: unknown, varargs: number) => {
    this.syscallVarargs = varargs;
    return this.abort('__syscall6 invoked despite no access to file descriptors on this system');
  }

  protected ___syscall54 = (which: unknown, varargs: number) => {
    this.syscallVarargs = varargs;
    return 0;
  }

  protected ___syscall6 = (which: unknown, varargs: number) => {
    this.syscallVarargs = varargs;
    return this.abort('__syscall6 invoked despite no access to file descriptors on this system');
  }

  protected ___syscall146 = (which: unknown, varargs: number) => {
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
}
