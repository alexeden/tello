interface OutputPicture {
  yData: Uint8Array;
  uData: Uint8Array;
  vData: Uint8Array;
  yDataPerRow?: number;
  yRowCnt?: number;
  uDataPerRow?: number;
  uRowCnt?: number;
  vDataPerRow?: number;
  vRowCnt?: number;
}

type YUV<T> = Record<'y' | 'u' | 'v', T>;

interface WebGLCanvasOptions {
  canvas: HTMLCanvasElement;
  contextOptions?: WebGLContextAttributes;
  width?: number;
  height?: number;
}
/**
 * This class can be used to render output pictures from an H264bsdDecoder to a canvasElement element.
 * If available the content is rendered using WebGL.
 */
export class WebGLCanvas {
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  canvasElement: HTMLCanvasElement;
  width: number;
  height: number;
  texturePositions: YUV<WebGLBuffer>;
  textures: YUV<WebGLTexture>;

  constructor(
    options: WebGLCanvasOptions
  ) {
    this.canvasElement = options.canvas;
    this.width = options.width || 640;
    this.height = options.height || 320;
    this.canvasElement.width = this.width;
    this.canvasElement.height = this.height;
    this.gl = this.canvasElement.getContext('webgl')!;
    this.program = WebGLCanvas.createProgram(this.gl);
    this.texturePositions = WebGLCanvas.createTexturePositions(this.gl, this.program);
    this.textures = WebGLCanvas.createTextures(this.gl, this.program);
  }

  /**
   * Draw the next output picture using WebGL
   * If this object is using WebGL, the data must be an I420 formatted ArrayBuffer,
   */
  drawNextOutputPicture(pic: OutputPicture) {
    const gl = this.gl;
    const width = this.width;
    const height = this.height;

    const yDataPerRow = pic.yDataPerRow || width;
    const yRowCnt     = pic.yRowCnt || height;
    const uDataPerRow = pic.uDataPerRow || (width / 2);
    const uRowCnt     = pic.uRowCnt || (height / 2);
    const vDataPerRow = pic.vDataPerRow || uDataPerRow;
    const vRowCnt     = pic.vRowCnt || uRowCnt;

    gl.viewport(0, 0, width, height);

    const tTop = 0;
    const tLeft = 0;
    let tBottom = height / yRowCnt;
    let tRight = width / yDataPerRow;
    const yTexturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texturePositions.y);
    gl.bufferData(gl.ARRAY_BUFFER, yTexturePosValues, gl.DYNAMIC_DRAW);

    tBottom = (height / 2) / uRowCnt;
    tRight = (width / 2) / uDataPerRow;
    const uTexturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texturePositions.u);
    gl.bufferData(gl.ARRAY_BUFFER, uTexturePosValues, gl.DYNAMIC_DRAW);

    tBottom = (height / 2) / vRowCnt;
    tRight = (width / 2) / vDataPerRow;
    const vTexturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texturePositions.v);
    gl.bufferData(gl.ARRAY_BUFFER, vTexturePosValues, gl.DYNAMIC_DRAW);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.y);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, yDataPerRow, yRowCnt, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, pic.yData);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.u);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, uDataPerRow, uRowCnt, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, pic.uData);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.textures.v);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, vDataPerRow, vRowCnt, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, pic.vData);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /**
   * Initialize GL textures and attach to shader program
   */
  private static createTextures(
    gl: WebGLRenderingContext,
    program: WebGLProgram
  ): YUV<WebGLTexture> {
    const yTextureRef = WebGLCanvas.createTexture(gl);
    const ySamplerRef = gl.getUniformLocation(program, 'ySampler');
    gl.uniform1i(ySamplerRef, 0);

    const uTextureRef = WebGLCanvas.createTexture(gl);
    const uSamplerRef = gl.getUniformLocation(program, 'uSampler');
    gl.uniform1i(uSamplerRef, 1);

    const vTextureRef = WebGLCanvas.createTexture(gl);
    const vSamplerRef = gl.getUniformLocation(program, 'vSampler');
    gl.uniform1i(vSamplerRef, 2);

    return {
      y: yTextureRef,
      u: uTextureRef,
      v: vTextureRef,
    };
  }

  /**
   * Initialize vertex buffers and attach to shader program
   */
  private static createTexturePositions(
    gl: WebGLRenderingContext,
    program: WebGLProgram
  ): YUV<WebGLBuffer> {
    const vertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]), gl.STATIC_DRAW);

    const vertexPosRef = gl.getAttribLocation(program, 'vertexPos');
    gl.enableVertexAttribArray(vertexPosRef);
    gl.vertexAttribPointer(vertexPosRef, 2, gl.FLOAT, false, 0, 0);

    return {
      y: WebGLCanvas.createTexturePositionBuffer(gl, program, 'yTexturePos'),
      u: WebGLCanvas.createTexturePositionBuffer(gl, program, 'uTexturePos'),
      v: WebGLCanvas.createTexturePositionBuffer(gl, program, 'vTexturePos'),
    };
  }

  private static createTexturePositionBuffer(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    programVar: string
  ): WebGLBuffer {
    const texturePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texturePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 0, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);

    const texturePosRef = gl.getAttribLocation(program, programVar);
    gl.enableVertexAttribArray(texturePosRef);
    gl.vertexAttribPointer(texturePosRef, 2, gl.FLOAT, false, 0, 0);

    return texturePosBuffer!;
  }

  /**
   * Create and configure a single texture
   */
  private static createTexture(gl: WebGLRenderingContext): WebGLTexture {
    const textureRef = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureRef);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return textureRef!;
  }

  /**
   * Initialize GL shader program
   */
  private static createProgram(gl: WebGLRenderingContext): WebGLProgram {
    // vertex shader is the same for all types
    const vertexShaderScript = `
      attribute vec4 vertexPos;
      attribute vec4 yTexturePos;
      attribute vec4 uTexturePos;
      attribute vec4 vTexturePos;
      varying vec2 yTextureCoord;
      varying vec2 uTextureCoord;
      varying vec2 vTextureCoord;

      void main()
      {
        gl_Position = vertexPos;
        yTextureCoord = yTexturePos.xy;
        uTextureCoord = uTexturePos.xy;
        vTextureCoord = vTexturePos.xy;
      }
    `;

    const fragmentShaderScript = `
      precision highp float;
      varying highp vec2 yTextureCoord;
      varying highp vec2 uTextureCoord;
      varying highp vec2 vTextureCoord;
      uniform sampler2D ySampler;
      uniform sampler2D uSampler;
      uniform sampler2D vSampler;
      uniform mat4 YUV2RGB;

      void main(void) {
        highp float y = texture2D(ySampler,  yTextureCoord).r;
        highp float u = texture2D(uSampler,  uTextureCoord).r;
        highp float v = texture2D(vSampler,  vTextureCoord).r;
        gl_FragColor = vec4(y, u, v, 1) * YUV2RGB;
      }
    `;

    const YUV2RGB = [
      1.16438,  0.00000,  1.59603, -0.87079,
      1.16438, -0.39176, -0.81297,  0.52959,
      1.16438,  2.01723,  0.00000, -1.08139,
      0, 0, 0, 1,
    ];

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderScript);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.log('Vertex shader failed to compile: ' + gl.getShaderInfoLog(vertexShader));
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderScript);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.log('Fragment shader failed to compile: ' + gl.getShaderInfoLog(fragmentShader));
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log('Program failed to compile: ' + gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);

    const YUV2RGBRef = gl.getUniformLocation(program, 'YUV2RGB');
    gl.uniformMatrix4fv(YUV2RGBRef, false, YUV2RGB);

    return program!;
  }

}
