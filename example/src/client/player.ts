import { WebGLCanvas } from './webgl-canvas';
import DecoderWorker = require('worker-loader!./decoder.worker');

interface Size {
  height: number;
  width: number;
}

interface PlayerOptions {
  size?: Size;
  workerFile?: string;
  statsListener?: (stats: PlayerStats) => void;
}

interface Frame extends Size {
  buffer: Uint8Array;
  infos: any;
}

interface PlayerStats {
  processing: { start: number, finish: number };
  decoding: { start: number, finish: number };
  rendering: { start: number, finish: number };
}

type DecoderMessage
  = { consoleLog: string }
  | {
      buf: ArrayBuffer;
      length: number;
      height: number;
      width: number;
      infos: Array<{ startDecoding: number, finishDecoding: number }>
    };

export class Player {
  private readonly worker: Worker;
  private readonly webGLCanvas: WebGLCanvas;
  readonly workerFile: string;
  readonly canvas: HTMLCanvasElement;
  statsListener: (stats: PlayerStats) => void;
  nowValue: number;
  size: Size;

  constructor(options: PlayerOptions) {
    (window as any).player = this;
    this.nowValue = performance.now();

    this.workerFile = options.workerFile || 'decoder.worker.js';

    this.statsListener = options.statsListener || (() => { /* no-op */ });

    this.size = {
      width: options.size && options.size.width || 200,
      height: options.size && options.size.height || 200,
    };

    this.canvas = Player.createCanvas(this.size);

    this.webGLCanvas = new WebGLCanvas({ canvas: this.canvas, ...this.size });

    this.worker = new DecoderWorker();
    // this.worker = new Worker(this.workerFile);

    this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));

    this.worker.postMessage({
      type: 'Broadway.js - Worker init',
      options: {
        rgb: false,
        memsize: 0,
        reuseMemory: false,
      },
    });
  }

  handleWorkerMessage(e: MessageEvent) {
    (window as any).workerMessageEvent = e;
    const data: DecoderMessage = e.data;

    if ('consoleLog' in data) {
      console.log(data.consoleLog);
      return;
    }

    if (!data.buf) {
      console.log('empty buffer');
      return;
    }

    const renderStats = this.renderFrame({
      buffer: new Uint8Array(data.buf, 0, data.length),
      height: data.height,
      width: data.width,
      infos: data.infos,
    });

    // const info = data.infos.reduce((accum, i: any) => ({ ...accum, ...i }), {});

    this.statsListener({
      processing: {
        // start: data.infos.startProcessing,
        finish: performance.now(),
      },
      rendering: renderStats,
      decoding: {
        // start: info.startDecoding || -1,
        // finish: info.finishDecoding || -1,
      },
    } as any);
  }

  decode(data: string | Uint8Array, info: any = {}) {
    if (typeof data === 'string') {
      data = Player.toUint8Array(data);
    }
    // Copy the sample so that we only do a structured clone of the region of interest
    const copyU8 = new Uint8Array(data.length);
    copyU8.set(data, 0);
    const message = {
      buf: copyU8.buffer,
      length: data.length,
      offset: 0,
      info,
    };
    this.worker.postMessage(message, [copyU8.buffer]);
  }

  static toUint8Array(str: string) {
    const array = new Uint8Array(new ArrayBuffer(str.length));
    let i;
    for (i = 0; i < str.length; i++) {
      array[i] = str.charCodeAt(i);
    }
    return array;
  }

  static createCanvas({ height, width }: Size, bgColor = '#0D0E1B'): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.backgroundColor = bgColor;
    return canvas;
  }

  private renderFrame({ buffer, height, width }: Frame) {
    const start = performance.now();
    const ylen = width * height;
    const uvlen = (width / 2) * (height / 2);

    this.webGLCanvas.drawNextOutputPicture({
      yData: buffer.subarray(0, ylen),
      uData: buffer.subarray(ylen, ylen + uvlen),
      vData: buffer.subarray(ylen + uvlen, ylen + uvlen + uvlen),
    });

    return {
      start,
      finish: performance.now(),
    };
  }
}
