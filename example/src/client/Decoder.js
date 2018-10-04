/**
 * options.rgb = false
 * sliceMode = false
 */

const noop = () => undefined;

// universal module definition
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  }
  else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  }
  else {
    // Browser globals (root is window)
    root.Decoder = factory();
  }
}(this, function () {

  const global = self;
  console.log('global: ', global);
  /**
   * The reason why this is all packed into one file is that this file can also function as worker.
   * you can integrate the file into your build system and provide the original file to be loaded into a worker.
   */
  var getModule = function (par_broadwayOnHeadersDecoded, par_broadwayOnPictureDecoded) {
    const Module = {
      arguments: [],
      thisProgram: "./this.program",
      preRun: [],
      postRun: [],
      print: console.log.bind(console),
      printErr: console.warn.bind(console),
      quit: (status, toThrow) => { throw toThrow },
      read: url => {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr.responseText;
      },
      readAsync: (url, onload, onerror) => {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 0 && xhr.response) {
            onload(xhr.response);
            return;
          }
          onerror();
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },
      readBinary: url => {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, false);
        xhr.responseType = "arraybuffer";
        xhr.send(null);
        return new Uint8Array(xhr.response);
      },
      setWindowTitle: title => document.title = title,
    }
    console.log(Module);

    var STACK_ALIGN = 16;
    const staticAlloc = size => {
      console.log('staticAlloc');
      assert(!staticSealed);
      var ret = STATICTOP;
      STATICTOP = STATICTOP + size + 15 & -16;
      return ret;
    };

    var asm2wasmImports = {
      "f64-rem": (x, y) => x % y,
      "debugger": () => { debugger },
    };
    var GLOBAL_BASE = 1024;
    var ABORT = 0;

    const assert = (condition, text) => {
      if (!condition) {
        abort("Assertion failed: " + text)
      }
    };

    const Pointer_stringify = (ptr, length) => {
      console.log('Pointer_stringify');
      if (length === 0 || !ptr) return "";
      var hasUtf = 0;
      var t;
      var i = 0;
      while (1) {
        t = HEAPU8[ptr + i >> 0];
        hasUtf |= t;
        if (t === 0 && !length) break;
        i++;
        if (length && i === length) break
      }
      if (!length) length = i;
      var ret = "";
      if (hasUtf < 128) {
        var MAX_CHUNK = 1024;
        var curr;
        while (length > 0) {
          curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
          ret = ret ? ret + curr : curr;
          ptr += MAX_CHUNK;
          length -= MAX_CHUNK;
        }
        return ret;
      }
      return UTF8ToString(ptr);
    };
    var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

    const UTF8ArrayToString = (u8Array, idx) => {
      var endPtr = idx;
      while (u8Array[endPtr]) ++endPtr;
      if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx, endPtr))
      }
      else {
        var u0, u1, u2, u3, u4, u5;
        var str = "";
        while (1) {
          u0 = u8Array[idx++];
          if (!u0) return str;
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue
          }
          u1 = u8Array[idx++] & 63;
          if ((u0 & 224) === 192) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);
            continue
          }
          u2 = u8Array[idx++] & 63;
          if ((u0 & 240) === 224) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2
          }
          else {
            u3 = u8Array[idx++] & 63;
            if ((u0 & 248) === 240) {
              u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3
            }
            else {
              u4 = u8Array[idx++] & 63;
              if ((u0 & 252) === 248) {
                u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4
              }
              else {
                u5 = u8Array[idx++] & 63;
                u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5
              }
            }
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0)
          }
          else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
          }
        }
      }
    };

    const UTF8ToString = ptr => UTF8ArrayToString(HEAPU8, ptr);

    var WASM_PAGE_SIZE = 65536;
    var ASMJS_PAGE_SIZE = 16777216;

    const alignUp = (x, multiple) => {
      if (x % multiple > 0) {
        x += multiple - x % multiple;
      }
      return x;
    };

    var buffer;
    var HEAP8;
    var HEAPU8;
    var HEAP16;
    var HEAPU16;
    var HEAP32;
    var HEAPU32;
    var HEAPF32;
    var HEAPF64;

    const updateGlobalBuffer = buf => Module.buffer = buffer = buf;

    const updateGlobalBufferViews = () => {
      Module.HEAP8 = HEAP8 = new Int8Array(buffer);
      Module.HEAP16 = HEAP16 = new Int16Array(buffer);
      Module.HEAP32 = HEAP32 = new Int32Array(buffer);
      Module.HEAPU8 = HEAPU8 = new Uint8Array(buffer);
      Module.HEAPU16 = HEAPU16 = new Uint16Array(buffer);
      Module.HEAPU32 = HEAPU32 = new Uint32Array(buffer);
      Module.HEAPF32 = HEAPF32 = new Float32Array(buffer);
      Module.HEAPF64 = HEAPF64 = new Float64Array(buffer);
    };
    var STATIC_BASE = 0;
    var STATICTOP = 0;
    var STACK_BASE = 0;
    var STACKTOP = 0;
    var STACK_MAX = 0;
    var DYNAMIC_BASE = 0;
    var DYNAMICTOP_PTR = 0;
    var staticSealed = false;

    function abortOnCannotGrowMemory() {
      abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")
    }

    const enlargeMemory = () => abortOnCannotGrowMemory();

    var TOTAL_STACK = Module.TOTAL_STACK || 5242880;
    var TOTAL_MEMORY = Module.TOTAL_MEMORY || 52428800;
    if (TOTAL_MEMORY < TOTAL_STACK) Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
    if (Module.buffer) {
      buffer = Module.buffer
    }
    else {
      Module.wasmMemory = new WebAssembly.Memory({
        initial: TOTAL_MEMORY / WASM_PAGE_SIZE,
        maximum: TOTAL_MEMORY / WASM_PAGE_SIZE,
      });
      buffer = Module.wasmMemory.buffer;
      Module.buffer = buffer;
    }
    updateGlobalBufferViews();

    const getTotalMemory = () => TOTAL_MEMORY;

    HEAP32[0] = 1668509029;
    HEAP16[1] = 25459;
    if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99) throw "Runtime error: expected the system to be little-endian!";

    const callRuntimeCallbacks = callbacks => {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback === "function") {
          callback();
          continue
        }
        var func = callback.func;
        if (typeof func === "number") {
          if (callback.arg === undefined) {
            Module.dynCall_v(func)
          }
          else {
            Module.dynCall_vi(func, callback.arg)
          }
        }
        else {
          func(callback.arg === undefined ? null : callback.arg)
        }
      }
    };
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATMAIN__ = [];
    var __ATEXIT__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;

    const preRun = () => {
      if (Module.preRun) {
        if (typeof Module.preRun === "function") Module.preRun = [Module.preRun];
        while (Module.preRun.length) {
          addOnPreRun(Module.preRun.shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    };

    const ensureInitRuntime = () => {
      if (runtimeInitialized) return;
      runtimeInitialized = true;
      callRuntimeCallbacks(__ATINIT__);
    };

    const preMain = () => callRuntimeCallbacks(__ATMAIN__);

    const exitRuntime = () => {
      callRuntimeCallbacks(__ATEXIT__);
      runtimeExited = true;
    };

    const postRun = () => {
      if (Module.postRun) {
        if (typeof Module.postRun === "function") Module.postRun = [Module.postRun];
        while (Module.postRun.length) {
          addOnPostRun(Module.postRun.shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    };

    const addOnPreRun = cb => __ATPRERUN__.unshift(cb);

    const addOnPostRun = cb => __ATPOSTRUN__.unshift(cb);

    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;

    const addRunDependency = () => {
      runDependencies++;
      if (Module.monitorRunDependencies) {
        Module.monitorRunDependencies(runDependencies)
      }
    }

    const removeRunDependency = () => {
      runDependencies--;
      if (Module.monitorRunDependencies) {
        Module.monitorRunDependencies(runDependencies)
      }
      if (runDependencies === 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback()
        }
      }
    }
    Module.preloadedImages = {};
    Module.preloadedAudios = {};

    function integrateWasmJS() {
      let wasmBinaryFile = "avc.wasm";
      var wasmPageSize = 64 * 1024;
      var info = {
        "global": null,
        "env": null,
        "asm2wasm": asm2wasmImports,
        "parent": Module
      };
      var exports = null;

      const mergeMemory = newBuffer => {
        var oldBuffer = Module.buffer;
        if (newBuffer.byteLength < oldBuffer.byteLength) {
          Module.printErr("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here");
        }
        var oldView = new Int8Array(oldBuffer);
        var newView = new Int8Array(newBuffer);
        newView.set(oldView);
        updateGlobalBuffer(newBuffer);
        updateGlobalBufferViews();
      };

      const doNativeWasm = (global, env) => {
        env["memory"] = Module.wasmMemory;
        info["global"] = {
          NaN: NaN,
          Infinity: Infinity,
        };
        info["global.Math"] = Math;
        info["env"] = env;

        const receiveInstance = instance => {
          exports = instance.exports;
          if (exports.memory) mergeMemory(exports.memory);
          Module.asm = exports;
          Module.usingWasm = true;
          removeRunDependency("wasm-instantiate")
        };

        addRunDependency("wasm-instantiate");
        if (Module.instantiateWasm) {
          try {
            return Module.instantiateWasm(info, receiveInstance)
          }
          catch (e) {
            Module.printErr("Module.instantiateWasm callback failed with error: " + e);
            return false;
          }
        }

        const receiveInstantiatedSource = output => {
          receiveInstance(output["instance"], output["module"]);
        };

        const wasmFile = fetch(wasmBinaryFile, { credentials: "same-origin" });

        WebAssembly.instantiateStreaming(wasmFile, info)
          .then(receiveInstantiatedSource)
          .catch(reason => {
            Module.printErr("wasm streaming compile failed: " + reason);
            Module.printErr("falling back to ArrayBuffer instantiation");
          });

        return {};
      }



      Module.asmPreload = Module.asm;
      var asmjsReallocBuffer = Module.reallocBuffer;


      const wasmReallocBuffer = size => {
        var PAGE_MULTIPLE = Module.usingWasm ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE;
        size = alignUp(size, PAGE_MULTIPLE);
        var old = Module.buffer;
        var oldSize = old.byteLength;
        try {
          var result = Module.wasmMemory.grow((size - oldSize) / wasmPageSize);
          if (result !== (-1 | 0)) {
            return Module.buffer = Module.wasmMemory.buffer
          }
          else {
            return null
          }
        }
        catch (e) {
          return null
        }
      };


      Module.reallocBuffer = size => finalMethod === "asmjs" ? asmjsReallocBuffer(size) : wasmReallocBuffer(size);
      var finalMethod = "";
      Module.asm = (global, env) => {
        var TABLE_SIZE = Module.wasmTableSize;
        if (TABLE_SIZE === undefined) TABLE_SIZE = 1024;
        var MAX_TABLE_SIZE = Module.wasmMaxTableSize;
        if (MAX_TABLE_SIZE !== undefined) {
          env["table"] = new WebAssembly.Table({
            "initial": TABLE_SIZE,
            "maximum": MAX_TABLE_SIZE,
            "element": "anyfunc"
          })
        }
        else {
          env["table"] = new WebAssembly.Table({
            initial: TABLE_SIZE,
            element: "anyfunc"
          })
        }
        Module.wasmTable = env["table"]
        env["memoryBase"] = Module.STATIC_BASE
        env["tableBase"] = 0
        var exports;
        exports = doNativeWasm(global, env);
        assert(exports, "no binaryen method succeeded.");
        console.log('env: ', env);
        return exports
      };
    }
    // END integrateWasmJS()




    integrateWasmJS();
    STATIC_BASE = GLOBAL_BASE;
    STATICTOP = STATIC_BASE + 9888;
    __ATINIT__.push();
    var STATIC_BUMP = 9888;
    Module.STATIC_BASE = STATIC_BASE;
    Module.STATIC_BUMP = STATIC_BUMP;
    STATICTOP += 16;
    var SYSCALLS = {
      varargs: 0,
      get: () => {
        SYSCALLS.varargs += 4;
        return HEAP32[SYSCALLS.varargs - 4 >> 2];
      },
      getStr: () => Pointer_stringify(SYSCALLS.get()),
      get64: () => {
        const low = SYSCALLS.get();
        const high = SYSCALLS.get();
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low;
      },
      getZero: () => assert(SYSCALLS.get() === 0),
    };

    function ___syscall140(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD();
        var offset_high = SYSCALLS.get();
        var offset_low = SYSCALLS.get();
        var result = SYSCALLS.get();
        var whence = SYSCALLS.get();
        var offset = offset_low;
        FS.llseek(stream, offset, whence);
        HEAP32[result >> 2] = stream.position;
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
        return 0
      }
      catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
      }
    }

    function ___syscall146(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.get();
        var iov = SYSCALLS.get();
        var iovcnt = SYSCALLS.get();
        var ret = 0;
        if (!___syscall146.buffers) {
          ___syscall146.buffers = [null, [],
            []
          ];
          ___syscall146.printChar = (function (stream, curr) {
            var buffer = ___syscall146.buffers[stream];
            assert(buffer);
            if (curr === 0 || curr === 10) {
              (stream === 1 ? Module.print : Module.printErr)(UTF8ArrayToString(buffer, 0));
              buffer.length = 0
            }
            else {
              buffer.push(curr)
            }
          })
        }
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[iov + i * 8 >> 2];
          var len = HEAP32[iov + (i * 8 + 4) >> 2];
          for (var j = 0; j < len; j++) {
            ___syscall146.printChar(stream, HEAPU8[ptr + j])
          }
          ret += len
        }
        return ret
      }
      catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
      }
    }

    function ___syscall54(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        return 0
      }
      catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
      }
    }

    function ___syscall6(which, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD();
        FS.close(stream);
        return 0
      }
      catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
      }
    }

    function _broadwayOnHeadersDecoded() {
      par_broadwayOnHeadersDecoded()
    }
    Module._broadwayOnHeadersDecoded = _broadwayOnHeadersDecoded;

    function _broadwayOnPictureDecoded($buffer, width, height) {
      par_broadwayOnPictureDecoded($buffer, width, height)
    }
    Module._broadwayOnPictureDecoded = _broadwayOnPictureDecoded;

    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
      return dest
    }

    function ___setErrNo(value) {
      if (Module.___errno_location) HEAP32[Module.___errno_location() >> 2] = value;
      return value
    }
    function alignMemory(size, factor) {
      if (!factor) factor = STACK_ALIGN;
      var ret = size = Math.ceil(size / factor) * factor;
      return ret
    }

    DYNAMICTOP_PTR = staticAlloc(4);
    STACK_BASE = STACKTOP = alignMemory(STATICTOP);
    STACK_MAX = STACK_BASE + TOTAL_STACK;
    DYNAMIC_BASE = alignMemory(STACK_MAX);
    HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
    staticSealed = true;
    Module.wasmTableSize = 10;
    Module.wasmMaxTableSize = 10;
    Module.asmGlobalArg = {};
    Module.asmLibraryArg = {
      abort,
      enlargeMemory,
      getTotalMemory,
      abortOnCannotGrowMemory,
      ___setErrNo,
      ___syscall140,
      ___syscall146,
      ___syscall54,
      ___syscall6,
      _broadwayOnHeadersDecoded,
      _broadwayOnPictureDecoded,
      _emscripten_memcpy_big,
      DYNAMICTOP_PTR,
      STACKTOP,
    };
    var asm = Module.asm(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
    Module.asm = asm;
    Module._broadwayCreateStream = (...args) => Module.asm._broadwayCreateStream(...args);
    Module._broadwayExit = (...args) => Module.asm._broadwayExit(...args);
    Module._broadwayGetMajorVersion = (...args) => Module.asm._broadwayGetMajorVersion(...args);
    Module._broadwayGetMinorVersion = (...args) => Module.asm._broadwayGetMinorVersion(...args);
    Module._broadwayInit = (...args) => Module.asm._broadwayInit(...args);
    Module._broadwayPlayStream = (...args) => Module.asm._broadwayPlayStream(...args);
    Module.asm = asm;

    function ExitStatus(status) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + status + ")";
      this.status = status
    }
    ExitStatus.prototype = new Error;
    ExitStatus.prototype.constructor = ExitStatus;
    var initialStackTop;
    dependenciesFulfilled = function runCaller() {
      if (!Module.calledRun) run();
      if (!Module.calledRun) dependenciesFulfilled = runCaller
    };

    function run(args) {
      args = args || Module.arguments;
      if (runDependencies > 0) {
        return
      }
      preRun();
      if (runDependencies > 0) return;
      if (Module.calledRun) return;

      function doRun() {
        if (Module.calledRun) return;
        Module.calledRun = true;
        if (ABORT) return;
        ensureInitRuntime();
        preMain();
        if (Module.onRuntimeInitialized) Module.onRuntimeInitialized();
        postRun()
      }
      if (Module.setStatus) {
        Module.setStatus("Running...");
        setTimeout((function () {
          setTimeout((function () {
            Module.setStatus("")
          }), 1);
          doRun()
        }), 1)
      }
      else {
        doRun()
      }
    }
    Module.run = run;

    function exit(status, implicit) {
      if (implicit && Module.noExitRuntime && status === 0) {
        return
      }
      if (Module.noExitRuntime) {}
      else {
        ABORT = true;
        EXITSTATUS = status;
        STACKTOP = initialStackTop;
        exitRuntime();
        if (Module.onExit) Module.onExit(status)
      }
      Module.quit(status, new ExitStatus(status))
    }
    Module.exit = exit;

    function abort(what) {
      if (Module.onAbort) {
        Module.onAbort(what)
      }
      if (what !== undefined) {
        Module.print(what);
        Module.printErr(what);
        what = JSON.stringify(what)
      }
      else {
        what = ""
      }
      ABORT = true;
      EXITSTATUS = 1;
      throw "abort(" + what + "). Build with -s ASSERTIONS=1 for more info."
    }
    Module.abort = abort;
    if (Module.preInit) {
      if (typeof Module.preInit === "function") Module.preInit = [Module.preInit];
      while (Module.preInit.length > 0) {
        Module.preInit.pop()()
      }
    }
    Module.noExitRuntime = true;
    run();

    var resultModule;
    if (typeof global !== "undefined") {
      if (global.Module) {
        resultModule = global.Module;
      };
    };
    if (typeof Module !== "undefined") {
      resultModule = Module;
    };

    resultModule._broadwayOnHeadersDecoded = par_broadwayOnHeadersDecoded;
    resultModule._broadwayOnPictureDecoded = par_broadwayOnPictureDecoded;

    var moduleIsReady = false;
    var cbFun;
    var moduleReady = function () {
      moduleIsReady = true;
      if (cbFun) {
        cbFun(resultModule);
      }
    };

    resultModule.onRuntimeInitialized = function () {
      moduleReady(resultModule);
    };
    return function (callback) {
      if (moduleIsReady) {
        callback(resultModule);
      }
      else {
        cbFun = callback;
      };
    };
  };
  // END getModule()


  return (() => {

    var nowValue = () => performance.now();

    var Decoder = function (parOptions) {
      console.log(this);
      this.options = parOptions || {};
      this.now = nowValue;
      var asmInstance;
      var fakeWindow = {};
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
          infos[0].finishDecoding = nowValue();
        };
        this.onPictureDecoded(buffer, width, height, infos);
      };

      var ModuleCallback = getModule.apply(fakeWindow, [noop, onPicFun]);

      var MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;

      this.onPictureDecoded = function (buffer, width, height, infos) {

      };

      this.onDecoderReady = noop;

      var bufferedCalls = [];
      this.decode = function decode(typedAr, parInfo, copyDoneFun) {
        bufferedCalls.push([typedAr, parInfo, copyDoneFun]);
      };

      ModuleCallback(Module => {
        var HEAPU8 = Module.HEAPU8;
        // from old constructor
        Module._broadwayInit();

        /**
         * Creates a typed array from a HEAP8 pointer.
         */
        toU8Array = function (ptr, length) {
          return HEAPU8.subarray(ptr, ptr + length);
        };
        toU32Array = function (ptr, length) {
          return new Uint32Array(HEAPU8.buffer, ptr, length);
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
            parInfo.startDecoding = nowValue();
          };

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

      });

    };

    Decoder.prototype = {

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
          if (buffer) {
            buffer = new Uint8Array(buffer);
          };

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

    Decoder.nowValue = nowValue;

    return Decoder;

  })();

}));
