/**
 * In practice:
 * type = 'yuv420'
 * conversionType = 'rec601'
 * customYUV444 = undefined
 *
 */
interface OutputPicture {
  yData: ArrayBufferView;
  uData: ArrayBufferView;
  vData: ArrayBufferView;
  yDataPerRow?: number;
  yRowCnt?: number;
  uDataPerRow?: number;
  uRowCnt?: number;
  vDataPerRow?: number;
  vRowCnt?: number;
}

interface YUVCanvasOptions {
  canvas?: HTMLCanvasElement;
  contextOptions?: WebGLContextAttributes;
  width?: number;
  height?: number;
  animationTime?: number;
}
/**
 * This class can be used to render output pictures from an H264bsdDecoder to a canvasElement element.
 * If available the content is rendered using WebGL.
 */
export class YUVCanvas {
  canvasElement: HTMLCanvasElement;
  contextOptions: WebGLContextAttributes;
  width: number;
  height: number;
  animationTime: number;
  contextGL: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  texturePosBuffer: WebGLBuffer | undefined;
  uTexturePosBuffer: WebGLBuffer | undefined;
  vTexturePosBuffer: WebGLBuffer | undefined;
  yTextureRef: WebGLTexture;
  uTextureRef: WebGLTexture;
  vTextureRef: WebGLTexture;

  constructor(parOptions: YUVCanvasOptions = {}) {

    this.canvasElement = parOptions.canvas || document.createElement('canvas');
    this.contextOptions = parOptions.contextOptions || {};
    this.width = parOptions.width || 640;
    this.height = parOptions.height || 320;
    this.animationTime = parOptions.animationTime || 0;
    this.canvasElement.width = this.width;
    this.canvasElement.height = this.height;

    this.contextGL = this.canvasElement.getContext('webgl', this.contextOptions)!;

    this.shaderProgram = YUVCanvas.createProgram(this.contextGL);
    this.initBuffers();

    /**
     * Initialize GL textures and attach to shader program
     */

    const gl = this.contextGL;
    const program = this.shaderProgram;
    const yTextureRef = this.initTexture();
    const ySamplerRef = gl.getUniformLocation(program, 'ySampler');
    gl.uniform1i(ySamplerRef, 0);
    this.yTextureRef = yTextureRef!;

    const uTextureRef = this.initTexture();
    const uSamplerRef = gl.getUniformLocation(program, 'uSampler');
    gl.uniform1i(uSamplerRef, 1);
    this.uTextureRef = uTextureRef!;

    const vTextureRef = this.initTexture();
    const vSamplerRef = gl.getUniformLocation(program, 'vSampler');
    gl.uniform1i(vSamplerRef, 2);
    this.vTextureRef = vTextureRef!;
  }

  /**
   * Draw picture data to the canvas.
   * If this object is using WebGL, the data must be an I420 formatted ArrayBuffer,
   * Otherwise, data must be an RGBA formatted ArrayBuffer.
   */
  drawNextOutputPicture(arg: any) {
    this.drawNextOuptutPictureGL(arg);
  }

  /**
   * Draw the next output picture using WebGL
   */
  drawNextOuptutPictureGL(par: OutputPicture) {
    const gl = this.contextGL;
    const texturePosBuffer = this.texturePosBuffer;
    const uTexturePosBuffer = this.uTexturePosBuffer;
    const vTexturePosBuffer = this.vTexturePosBuffer;

    const yTextureRef = this.yTextureRef;
    const uTextureRef = this.uTextureRef;
    const vTextureRef = this.vTextureRef;

    const yData = par.yData;
    const uData = par.uData;
    const vData = par.vData;

    const width = this.width;
    const height = this.height;

    const yDataPerRow = par.yDataPerRow || width;
    const yRowCnt     = par.yRowCnt || height;
    const uDataPerRow = par.uDataPerRow || (width / 2);
    const uRowCnt     = par.uRowCnt || (height / 2);
    const vDataPerRow = par.vDataPerRow || uDataPerRow;
    const vRowCnt     = par.vRowCnt || uRowCnt;

    gl.viewport(0, 0, width, height);

    const tTop = 0;
    const tLeft = 0;
    let tBottom = height / yRowCnt;
    let tRight = width / yDataPerRow;
    const texturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom]);

    gl.bindBuffer(gl.ARRAY_BUFFER, texturePosBuffer!);
    gl.bufferData(gl.ARRAY_BUFFER, texturePosValues, gl.DYNAMIC_DRAW);

    tBottom = (height / 2) / uRowCnt;
    tRight = (width / 2) / uDataPerRow;

    const uTexturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom]);

    gl.bindBuffer(gl.ARRAY_BUFFER, uTexturePosBuffer!);
    gl.bufferData(gl.ARRAY_BUFFER, uTexturePosValues, gl.DYNAMIC_DRAW);

    tBottom = (height / 2) / vRowCnt;
    tRight = (width / 2) / vDataPerRow;
    const vTexturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom]);

    gl.bindBuffer(gl.ARRAY_BUFFER, vTexturePosBuffer!);
    gl.bufferData(gl.ARRAY_BUFFER, vTexturePosValues, gl.DYNAMIC_DRAW);


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, yTextureRef);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, yDataPerRow, yRowCnt, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, yData);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, uTextureRef);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, uDataPerRow, uRowCnt, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, uData);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, vTextureRef);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, vDataPerRow, vRowCnt, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, vData);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /**
   * Returns true if the canvas supports WebGL
   */
  isWebGL() {
    return this.contextGL;
  }

  /**
   * Initialize GL shader program
   */
  static createProgram(gl: WebGLRenderingContext): WebGLProgram {
    // vertex shader is the same for all types
    const vertexShaderScript = `
      attribute vec4 vertexPos;
      attribute vec4 texturePos;
      attribute vec4 uTexturePos;
      attribute vec4 vTexturePos;
      varying vec2 textureCoord;
      varying vec2 uTextureCoord;
      varying vec2 vTextureCoord;

      void main()
      {
        gl_Position = vertexPos;
        textureCoord = texturePos.xy;
        uTextureCoord = uTexturePos.xy;
        vTextureCoord = vTexturePos.xy;
      }
    `;

    const fragmentShaderScript = `
      precision highp float;
      varying highp vec2 textureCoord;
      varying highp vec2 uTextureCoord;
      varying highp vec2 vTextureCoord;
      uniform sampler2D ySampler;
      uniform sampler2D uSampler;
      uniform sampler2D vSampler;
      uniform mat4 YUV2RGB;

      void main(void) {
        highp float y = texture2D(ySampler,  textureCoord).r;
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

  /**
   * Initialize vertex buffers and attach to shader program
   */
  initBuffers() {
    const gl = this.contextGL;
    const program = this.shaderProgram;

    const vertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]), gl.STATIC_DRAW);

    const vertexPosRef = gl.getAttribLocation(program, 'vertexPos');
    gl.enableVertexAttribArray(vertexPosRef);
    gl.vertexAttribPointer(vertexPosRef, 2, gl.FLOAT, false, 0, 0);

    if (this.animationTime) {

      const animationTime = this.animationTime;
      let timePassed = 0;
      const stepTime = 15;

      const aniFun = () => {

        timePassed += stepTime;
        let mul = (1 * timePassed) / animationTime;

        if (timePassed >= animationTime) {
          mul = 1;
        }
        else {
          setTimeout(aniFun, stepTime);
        }

        const neg = -1 * mul;
        const pos = 1 * mul;

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([pos, pos, neg, pos, pos, neg, neg, neg]), gl.STATIC_DRAW);

        const vertexPos = gl.getAttribLocation(program, 'vertexPos');
        gl.enableVertexAttribArray(vertexPos);
        gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0);

        try {
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        catch (e) {
          console.error(e);
        }
      };
      aniFun();
    }

    const texturePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texturePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 0, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);

    const texturePosRef = gl.getAttribLocation(program, 'texturePos');
    gl.enableVertexAttribArray(texturePosRef);
    gl.vertexAttribPointer(texturePosRef, 2, gl.FLOAT, false, 0, 0);

    this.texturePosBuffer = texturePosBuffer!;

    const uTexturePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uTexturePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 0, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);

    const uTexturePosRef = gl.getAttribLocation(program, 'uTexturePos');
    gl.enableVertexAttribArray(uTexturePosRef);
    gl.vertexAttribPointer(uTexturePosRef, 2, gl.FLOAT, false, 0, 0);

    this.uTexturePosBuffer = uTexturePosBuffer!;


    const vTexturePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vTexturePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 0, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);

    const vTexturePosRef = gl.getAttribLocation(program, 'vTexturePos');
    gl.enableVertexAttribArray(vTexturePosRef);
    gl.vertexAttribPointer(vTexturePosRef, 2, gl.FLOAT, false, 0, 0);

    this.vTexturePosBuffer = vTexturePosBuffer!;
  }


  /**
   * Create and configure a single texture
   */
  initTexture() {
    const gl = this.contextGL;

    const textureRef = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureRef);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return textureRef!;
  }
}
