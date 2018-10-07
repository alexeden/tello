export interface H264ModuleOptions {
  decodedImageListener: DecodedBufferCallback;
  decodedHeaderListener?: DecodedBufferCallback;
  totalMemory?: number;
}

export type DecodedHeapCallback = (heapLoc: number, width: number, height: number, infos?: DecodedBufferInfo) => void;
export type DecodedBufferCallback = (buffer: Uint8Array, width: number, height: number, infos?: DecodedBufferInfo) => void;

export interface DecodedBufferInfo {
  startDecoding: number;
  finishDecoding: number;
  [prop: string]: any;
}


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
