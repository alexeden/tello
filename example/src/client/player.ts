import { WebGLCanvas } from './webgl-canvas';
import { H264Decoder } from './h264';

interface Size {
  height: number;
  width: number;
}

interface PlayerOptions {
  size?: Size;
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

export class Player {
  private readonly webGLCanvas: WebGLCanvas;
  private readonly decoder: H264Decoder;
  readonly canvas: HTMLCanvasElement;
  statsListener: (stats: PlayerStats) => void;
  size: Size;

  constructor(options: PlayerOptions) {
    (window as any).player = this;
    this.statsListener = options.statsListener || (() => { /* no-op */ });

    this.size = {
      width: options.size && options.size.width || 200,
      height: options.size && options.size.height || 200,
    };

    this.canvas = Player.createCanvas(this.size);

    this.webGLCanvas = new WebGLCanvas({ canvas: this.canvas, ...this.size });

    this.decoder = new H264Decoder({
      decodedImageListener: this.decodedImageListener.bind(this),
    });

    this.decoder.start();
  }

  decodedImageListener(buffer: Uint8Array, width: number, height: number, infos: any) {
    const renderStats = this.renderFrame({ buffer, height, width, infos });
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

    this.decoder.decode(new Uint8Array(data.buffer, 0, data.length), info);
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
