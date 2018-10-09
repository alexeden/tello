/**
 * Values of the left and right control stick X and Y axes
 * Minimum  0xffff (-32768)
 * Default  0x0000
 * Maximum  0x7fff ( 32767)
 */
export interface Stick {
  speed: number;
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
}

export enum CameraMode {
  Picture = 0,
  Video = 1,
}

export enum Exposure {
  Minus30 = -3.0,
  Minus27 = -2.7,
  Minus23 = -2.3,
  Minus20 = -2.0,
  Minus17 = -1.7,
  Minus13 = -1.3,
  Minus10 = -1.0,
  Minus07 = -0.7,
  Minus03 = -0.3,
  Zero    =  0.0,
  Plus03  =  0.3,
  Plus07  =  0.7,
  Plus10  =  1.0,
  Plus13  =  1.3,
  Plus17  =  1.7,
  Plus20  =  2.0,
  Plus23  =  2.3,
  Plus27  =  2.7,
  Plus30  =  3.0,
}

export enum VideoBitrate {
  Auto    = 0,
  Lowest  = 1,   // 1   Mbps
  Low     = 2,   // 1.5 Mbps
  Middle  = 3,   // 2   Mbps
  High    = 4,   // 3   Mbps
  Highest = 5,   // 4   Mbps
}
