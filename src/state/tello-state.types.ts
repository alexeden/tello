import { CameraMode, VideoBitrate, Exposure } from '../lib';

export interface Battery {
  percentage: number;
  batteryLeft: number;
  flyTimeLeft: number;
}

export interface Camera {
  state: number;
  bitrate: VideoBitrate;
  exposure: Exposure;
  jpegQuality: number;
  mode: CameraMode;
  frontIn: boolean;
  frontOut: boolean;
  frontLSC: boolean;
}

export interface Wifi {
  interference: number;
  region: string;
  signal: number;
  ssid: string;
  password: string;
}

export interface Flight {
  heightLimit: number;
  time: number;
  mode: number;
  throwFlyTimer: number;
}

export interface Sensors {
  height: number;
  temperatureHeight: number;
  imuCalibration: number;
  light: number;
  batteryState: boolean;
  downVisualState: boolean;
  gravityState: boolean;
  imuState: boolean;
  powerState: boolean;
  pressureState: boolean;
  windState: boolean;
}

export interface Speed {
  lateral: number;
  longitudinal: number;
  vertical: number;
}

export interface Status {
  version: string | null;
  flying: boolean;
  onGround: boolean;
  emOpen: boolean;
  hovering: boolean;
  outageRecording: boolean;
  batteryLow: boolean;
  batteryVeryLow: boolean;
  factoryMode: boolean;
  electricalMachineryState: number;
}


export interface TelloState {
  wifi: Wifi | {};
  camera: Camera | {};
  flight: Flight | {};
  sensors: Sensors | {};
  battery: Battery | {};
  speed: Speed | {};
  status: Status | {};
}

// export interface Status {
  // sensorFlags: SensorStates;
  // battery: Battery;
  // speed: Speed;
  // imuCalibration: number;
  // height: number;
  // flightTime: number;


  // flyMode: number;
  // height: number;
  // verticalSpeed: number;
  // flySpeed: number;
  // eastSpeed: number;
  // northSpeed: number;
  // flyTime: number;

  // flying: boolean;

  // downVisualState: boolean;
  // droneHover: boolean;
  // eMOpen: boolean;
  // onGround: boolean;
  // pressureState: boolean;

  // batteryPercentage: number;
  // batteryLow: boolean;
  // batteryLower: boolean;
  // batteryState: boolean;
  // powerState: boolean;
  // droneBatteryLeft: number;
  // droneFlyTimeLeft: number;


  // cameraState: number;
  // electricalMachineryState: number;
  // factoryMode: boolean;
  // frontIn: boolean;
  // frontLSC: boolean;
  // frontOut: boolean;
  // gravityState: boolean;
  // imuCalibrationState: number;
  // imuState: boolean;
  // lightStrength: number;
  // outageRecording: boolean;
  // smartVideoExitMode: number;
  // temperatureHeight: number;
  // throwFlyTimer: number;
  // wifiDisturb: number;
  // wifiStrength: number;
  // windState: boolean;

  // velX: number;
  // velY: number;
  // velZ: number;

  // posX: number;
  // posY: number;
  // posZ: number;
  // posUncertainty: number;

  // velN: number;
  // velE: number;
  // velD: number;

  // quatX: number;
  // quatY: number;
  // quatZ: number;
  // quatW: number;
// }
