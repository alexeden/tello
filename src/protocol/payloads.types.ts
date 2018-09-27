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
