/**
 * WASM Exports:
 * (export "_broadwayCreateStream" (func $_broadwayCreateStream))
 * (export "_broadwayExit" (func $_broadwayExit))
 * (export "_broadwayGetMajorVersion" (func $_broadwayGetMajorVersion))
 * (export "_broadwayGetMinorVersion" (func $_broadwayGetMinorVersion))
 * (export "_broadwayInit" (func $_broadwayInit))
 * (export "_broadwayPlayStream" (func $_broadwayPlayStream))
 * (export "_free" (func $_free))
 * (export "_malloc" (func $_malloc))
 * (export "_memcpy" (func $_memcpy))
 * (export "_memset" (func $_memset))
 * (export "_sbrk" (func $_sbrk))
 * (export "dynCall_ii" (func $dynCall_ii))
 * (export "dynCall_iiii" (func $dynCall_iiii))
 * (export "dynCall_viiiii" (func $dynCall_viiiii))
 * (export "establishStackSpace" (func $establishStackSpace))
 * (export "getTempRet0" (func $getTempRet0))
 * (export "runPostSets" (func $_broadwayExit))
 * (export "setTempRet0" (func $setTempRet0))
 * (export "setThrew" (func $setThrew))
 * (export "stackAlloc" (func $stackAlloc))
 * (export "stackRestore" (func $stackRestore))
 * (export "stackSave" (func $stackSave))
 */

interface AvcModuleOptions {
  totalMemory?: number;
}

type SysCall = (which: unknown, varargs: number) => number | never;

export type DecodedCallback = (heapLoc: number, width: number, height: number, infos: object[]) => void;

interface AvcImportObject {
  DYNAMICTOP_PTR: number;
  STACKTOP: number;
  memory: WebAssembly.Memory;
  table: WebAssembly.Table;
  tableBase: number;
  abort: (reason: any) => never;
  enlargeMemory: () => never;
  getTotalMemory: () => number;
  abortOnCannotGrowMemory: () => never;
  _broadwayOnHeadersDecoded: (...args: any[]) => any;
  _broadwayOnPictureDecoded: DecodedCallback;
  _emscripten_memcpy_big: (dest: number, src: number, srcLength: number) => number;
  ___setErrNo: <T>(value: T) => T;
  ___syscall6: SysCall;
  ___syscall54: SysCall;
  ___syscall146: SysCall;
  ___syscall140: SysCall;
}

export class AvcModule implements AvcImportObject {
  static readonly DYNAMICTOP_PTR  = 0x2ab0;
  static readonly STACK_BASE      = 0x2ab0;
  static readonly STACKTOP        = 0x2ac0;
  static readonly TOTAL_MEMORY    = 0x3200000;
  static readonly TOTAL_STACK     = 0x500000;
  static readonly WASM_PAGE_SIZE  = 0x10000;
  static readonly STACK_MAX       = AvcModule.STACK_BASE + AvcModule.TOTAL_STACK;
  static readonly DYNAMIC_BASE    = Math.ceil(AvcModule.STACK_MAX / 16) * 16;

  readonly DYNAMICTOP_PTR  = AvcModule.DYNAMICTOP_PTR;
  readonly STACKTOP  = AvcModule.STACKTOP;
  readonly memory: WebAssembly.Memory;
  readonly table: WebAssembly.Table;
  readonly tableBase = 0;
  readonly HEAPU8: Uint8Array;
  readonly HEAP16: Int16Array;
  readonly HEAP32: Int32Array;

  private syscallVarargs = 0;

  constructor(
    public _broadwayOnHeadersDecoded: DecodedCallback, // tslint:disable-line:variable-name
    public _broadwayOnPictureDecoded: DecodedCallback, // tslint:disable-line:variable-name
    public opts: AvcModuleOptions = {}
  ) {
    const {
      totalMemory = 0x3200000,
    } = opts;

    this.memory = new WebAssembly.Memory({
      initial: totalMemory / AvcModule.WASM_PAGE_SIZE,
      maximum: totalMemory / AvcModule.WASM_PAGE_SIZE,
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
    this.HEAP32[AvcModule.DYNAMICTOP_PTR >> 2] = AvcModule.DYNAMIC_BASE;
    if (this.HEAPU8[2] !== 115 || this.HEAPU8[3] !== 99) {
      throw new Error('Runtime error: expected the system to be little-endian!');
    }
  }

  async instantiateModule() {
    try {
      const wasmFile = fetch('avc.wasm', { credentials: 'same-origin' });
      return WebAssembly.instantiateStreaming(wasmFile, {
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
     return this.abort(`Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ${AvcModule.TOTAL_MEMORY}, (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 `);
  }

  getTotalMemory() {
     return AvcModule.TOTAL_MEMORY;
  }

  abortOnCannotGrowMemory() {
    return this.abort(`Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ${AvcModule.TOTAL_MEMORY}, (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 `);
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
