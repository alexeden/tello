import { WebGLCanvas } from './webgl-canvas';

interface Size {
  height: number;
  width: number;
}
interface PlayerOptions {
  size?: Size;
  workerFile?: string;
}

interface Frame extends Size {
  buffer: Uint8Array;
  infos: any;
}

export class Player {
  private readonly worker: Worker;
  private readonly webGLCanvas: WebGLCanvas;
  readonly workerFile: string;
  readonly canvas: HTMLCanvasElement;

  nowValue: number;
  size: Size;

  constructor(options: PlayerOptions) {
    this.nowValue = performance.now();

    this.workerFile = options.workerFile || 'Decoder.js';

    this.size = {
      width: options.size && options.size.width || 200,
      height: options.size && options.size.height || 200,
    };

    this.canvas = Player.createCanvas(this.size);

    this.webGLCanvas = new WebGLCanvas({
      canvas: this.canvas,
      ...this.size,
    });

    // provide size
    this.worker = new Worker(this.workerFile);
    this.worker.addEventListener('message', e => {
      (window as any).workerMessageEvent = e;
      const data = e.data;
      if (data.consoleLog) {
        console.log(data.consoleLog);
        return;
      }
      if (!data.buf || data.buf.length < 1) {
        console.log('empty buffer');
        return;
      }
      const buffer = new Uint8Array(data.buf, 0, data.length);
      const frame = {
        buffer,
        height: data.height,
        width: data.width,
        infos: data.infos,
      };
      this.renderFrame(frame);
      (window as any).frame = frame;
    });

    this.worker.postMessage({
      type: 'Broadway.js - Worker init',
      options: {
        rgb: false,
        memsize: 0,
        reuseMemory: false,
      },
    });
  }

  decode(data: Uint8Array, info: any = {}) {
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

  static createCanvas({ height, width }: Size, bgColor = '#0D0E1B'): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.backgroundColor = bgColor;
    return canvas;
  }

  private renderFrame({ buffer, height, width }: Frame) {
    const ylen = width * height;
    const uvlen = (width / 2) * (height / 2);

    this.webGLCanvas.drawNextOutputPicture({
      yData: buffer.subarray(0, ylen),
      uData: buffer.subarray(ylen, ylen + uvlen),
      vData: buffer.subarray(ylen + uvlen, ylen + uvlen + uvlen),
    });
  }
}
