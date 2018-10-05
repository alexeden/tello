// tslint:disable variable-name

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


export interface H264ModuleOptions {
  decodedImageListener: DecodedBufferCallback;
  decodedHeaderListener?: DecodedBufferCallback;
  totalMemory?: number;
}

type SysCall = (which: unknown, varargs: number) => number | never;

export type DecodedHeapCallback = (heapLoc: number, width: number, height: number, infos?: object) => void;
export type DecodedBufferCallback = (buffer: Uint8Array, width: number, height: number, infos?: object) => void;

export declare class H264AssemblyEnvironment {
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
  _broadwayOnPictureDecoded: DecodedHeapCallback;
  _emscripten_memcpy_big: (dest: number, src: number, srcLength: number) => number;
  ___setErrNo: <T>(value: T) => T;
  ___syscall6: SysCall;
  ___syscall54: SysCall;
  ___syscall146: SysCall;
  ___syscall140: SysCall;
}

export interface H264ModuleImportObject {
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
  _broadwayOnPictureDecoded: DecodedHeapCallback;
  _emscripten_memcpy_big: (dest: number, src: number, srcLength: number) => number;
  ___setErrNo: <T>(value: T) => T;
  ___syscall6: SysCall;
  ___syscall54: SysCall;
  ___syscall146: SysCall;
  ___syscall140: SysCall;
}
