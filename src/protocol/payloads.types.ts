export interface Time {
  h: number;
  m: number;
  s: number;
  ms: number;
}

export interface Stick {
  // -32768 to 32767 per direction
  fastMode: boolean;
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

export interface Status {
  flyMode: number;
  height: number;
  verticalSpeed: number;
  flySpeed: number;
  eastSpeed: number;
  northSpeed: number;
  flyTime: number;

  flying: boolean;

  downVisualState: boolean;
  droneHover: boolean;
  eMOpen: boolean;
  onGround: boolean;
  pressureState: boolean;

  batteryPercentage: number;
  batteryLow: boolean;
  batteryLower: boolean;
  batteryState: boolean;
  powerState: boolean;
  droneBatteryLeft: number;
  droneFlyTimeLeft: number;


  cameraState: number;
  electricalMachineryState: number;
  factoryMode: boolean;
  frontIn: boolean;
  frontLSC: boolean;
  frontOut: boolean;
  gravityState: boolean;
  imuCalibrationState: number;
  imuState: boolean;
  lightStrength: number;
  outageRecording: boolean;
  smartVideoExitMode: number;
  temperatureHeight: number;
  throwFlyTimer: number;
  wifiDisturb: number;
  wifiStrength: number;
  windState: boolean;

  velX: number;
  velY: number;
  velZ: number;

  posX: number;
  posY: number;
  posZ: number;
  posUncertainty: number;

  velN: number;
  velE: number;
  velD: number;

  quatX: number;
  quatY: number;
  quatZ: number;
  quatW: number;
}
