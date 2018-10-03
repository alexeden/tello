import { WebGLCanvas } from './webgl-canvas';

/**
 * from testing...
 * render: true,
 * webgl: true,
 * {
 *   "useWorker": true,
 *   "workerFile": "Decoder.js",
 *   "webgl": "auto",
 *   "size": {
 *     "width": 960,
 *     "height": 720
 *   }
 * }
 * // canvas property represents the canvas node
 * // put it somewhere in the dom
 * p.canvas;
 *
 * p.webgl; // contains the used rendering mode. if you pass auto to webgl you can see what auto detection resulted in
 *
 * p.decode(<binary>);
 */

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
  nowValue: number;
  webgl = true;
  size: Size;
  workerFile: string;
  readonly canvas: HTMLCanvasElement;
  readonly webGLCanvas: WebGLCanvas;

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

  decode(parData, parInfo = {}) {
    // Copy the sample so that we only do a structured clone of the region of interest
    const copyU8 = new Uint8Array(parData.length);
    copyU8.set(parData, 0);
    const message = {
      buf: copyU8.buffer,
      offset: 0,
      length: parData.length,
      info: parInfo,
    };
    this.worker.postMessage(message, [copyU8.buffer]); // Send data to our worker.
  }

  static createCanvas({ height, width }: Size, bgColor = '#0D0E1B'): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.backgroundColor = bgColor;
    return canvas;
  }

  renderFrame({ buffer, height, width }: Frame) {

    // const canvasObj = frame.canvasObj;

    // const width = frame.width || canvasObj.canvas.width;
    // const height = frame.height || canvasObj.canvas.height;

    // if (canvasObj.canvas.width !== width || canvasObj.canvas.height !== height || !canvasObj.webGLCanvas) {
    //   canvasObj.canvas.width = width;
    //   canvasObj.canvas.height = height;
    //   canvasObj.webGLCanvas = new WebGLCanvas({
    //     canvas: canvasObj.canvas,
    //     contextOptions: canvasObj.contextOptions,
    //     width,
    //     height,
    //   });
    // }

    const ylen = width * height;
    const uvlen = (width / 2) * (height / 2);

    this.webGLCanvas.drawNextOutputPicture({
      yData: buffer.subarray(0, ylen),
      uData: buffer.subarray(ylen, ylen + uvlen),
      vData: buffer.subarray(ylen + uvlen, ylen + uvlen + uvlen),
    });
  }
}
