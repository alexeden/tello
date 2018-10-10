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
