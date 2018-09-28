import { Exposure, VideoBitrate, CameraMode, Stick } from '../lib';
import { Status, Wifi } from './state.types';
import { Bitwise } from '../utils';

export class TelloPayloadParsers {
  // Commmand 21
  static parseWifiRegion(payload: Buffer): string {
    return payload.toString();
  }

  // Command 26
  static parseWifiStrength(payload: Buffer): Partial<Wifi> {
    return {
      signal: payload.readUInt8(0),
      interference: payload.readUInt8(1),
    };
  }

  // Command 32
  static parseVideoBitrate(payload: Buffer): VideoBitrate {
    return payload.readUInt8(0);
  }

  // Command 49
  static parseCameraMode(payload: Buffer): CameraMode {
    return payload.readUInt8(0);
  }

  // Command 52
  static parseExposureValue(payload: Buffer): Exposure {
    return payload.readInt8(0);
  }

  // Command 53
  static parseLightStrength(payload: Buffer): number {
    return payload.readUInt8(0);
  }

  // Command 55
  static parseJpegQuality(payload: Buffer): number {
    return payload.readInt8(0);
  }

  // Command 69
  static parseVersion(payload: Buffer): string {
    return payload.toString();
  }

  // Command 86
  static parseFlightStatus(payload: Buffer): Partial<Status> {
    const status: Partial<Status> = {};
    status.height = payload.readInt16LE(0);
    status.northSpeed = payload.readInt16LE(2);
    status.eastSpeed = payload.readInt16LE(4);
    status.flySpeed = Math.sqrt(Math.pow(status.northSpeed, 2) + Math.pow(status.eastSpeed, 2.0));
    status.verticalSpeed = payload.readInt16LE(6);
    status.flyTime = payload.readInt16LE(8);

    const sensorFlags = Bitwise.bitreader(payload.readUInt8(10));
    status.imuState = sensorFlags(0);
    status.pressureState = sensorFlags(1);
    status.downVisualState = sensorFlags(2);
    status.powerState = sensorFlags(3);
    status.batteryState = sensorFlags(4);
    status.gravityState = sensorFlags(5);
    status.windState = sensorFlags(7);

    status.imuCalibrationState = payload.readInt8(11);
    status.batteryPercentage = payload.readInt8(12);
    status.droneFlyTimeLeft = payload.readInt16LE(13);

    if (payload.length <= 15) return status;

    status.droneBatteryLeft = payload.readInt16LE(15);

    const hardwareFlags = Bitwise.bitreader(payload.readUInt8(17));
    status.flying = hardwareFlags(0);
    status.onGround = hardwareFlags(1);
    status.eMOpen = hardwareFlags(2);
    status.droneHover = hardwareFlags(3);
    status.outageRecording = hardwareFlags(4);
    status.batteryLow = hardwareFlags(5);
    status.batteryLower = hardwareFlags(6);
    status.factoryMode = hardwareFlags(7);

    status.flyMode = payload.readInt8(18);
    status.throwFlyTimer = payload.readInt8(19);
    status.cameraState = payload.readInt8(20);
    status.electricalMachineryState = payload.readInt8(21);

    const frontFlags = Bitwise.bitreader(payload.readUInt8(22));
    status.frontIn = frontFlags(0);
    status.frontOut = frontFlags(1);
    status.frontLSC = frontFlags(2);
    status.temperatureHeight = payload.readUInt8(23);

    return status;
  }

  // Command 4182
  static parseHeightLimit(payload: Buffer) {
    return payload.readUInt16LE(1);
  }
  // Command 4183
  static parseLowBatteryThreshold(payload: Buffer) {
    return payload.readUInt16LE(1);
  }

  // Command 4185
  static parseStick(payload: Buffer): Stick {
    return {
      fastMode: false,
      rightX: payload.readUInt8(0),
      rightY: payload.readUInt8(1),
      leftX: payload.readUInt8(2),
      leftY: payload.readUInt8(3),
    };
  }
}
