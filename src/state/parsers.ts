import { Exposure, VideoBitrate, CameraMode, Stick } from '../lib';
import { Wifi, SensorFlags, Speed, Battery, Flight, Sensors } from './state.types';
import { Bitwise } from '../utils';
import { Command } from 'protocol';


// const PayloadGuard = (defaultValue: any) => {
//   return <T extends object, K extends keyof T>(target: T, methodName: K, descriptor: PropertyDescriptor) => {
//     if (typeof target[methodName] === 'function') {
//       const original: any = target[methodName];
//       descriptor.value = (...args: any[]) => {
//         try {
//           return original(...args);
//         }
//         catch (error) {
//           console.error(`Parser ${methodName} threw an error: `, error, `Error thrown because of this payload: `, ...args);
//           return defaultValue;
//         }
//       };
//     }
//   };
// };

export class PayloadParsers {
  // Commmand 21
  static parseWifiRegion(payload: Buffer): string {
    return payload.toString();
  }

  // Command 26
  static parseWifiStrength(payload: Buffer): Partial<Wifi> {
    return !payload.length
      ? {}
      : {
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
  static parseFlightStatus(payload: Buffer) {
    const battery: Partial<Battery> = {
      percentage: payload.readInt8(12),
      flyTimeLeft: payload.readInt16LE(13),
    };

    const speed: Speed = {
      lateral: payload.readInt16LE(4),
      longitudinal: payload.readInt16LE(2),
      vertical: payload.readInt16LE(6),
    };

    const sensorFlagByte = Bitwise.bitreader(payload.readUInt8(10));
    const sensorFlags: SensorFlags = {
      imu: sensorFlagByte(0),
      pressure: sensorFlagByte(1),
      downVisual: sensorFlagByte(2),
      power: sensorFlagByte(3),
      battery: sensorFlagByte(4),
      gravity: sensorFlagByte(5),
      wind: sensorFlagByte(7),
    };

    const flight: Partial<Flight> = {
      time: payload.readInt16LE(8),
    };

    const sensors: Partial<Sensors> = {
      height: payload.readInt16LE(0),
      imuCalibration: payload.readInt8(11),
    };

    return {
      flight,
      speed,
      sensorFlags,
      sensors,
      battery,
    };
    // if (payload.length <= 15)

    // status.droneBatteryLeft = payload.readInt16LE(15);

    // const hardwareFlags = Bitwise.bitreader(payload.readUInt8(17));
    // status.flying = hardwareFlags(0);
    // status.onGround = hardwareFlags(1);
    // status.eMOpen = hardwareFlags(2);
    // status.droneHover = hardwareFlags(3);
    // status.outageRecording = hardwareFlags(4);
    // status.batteryLow = hardwareFlags(5);
    // status.batteryLower = hardwareFlags(6);
    // status.factoryMode = hardwareFlags(7);

    // status.flyMode = payload.readInt8(18);
    // status.throwFlyTimer = payload.readInt8(19);
    // status.cameraState = payload.readInt8(20);
    // status.electricalMachineryState = payload.readInt8(21);

    // const frontFlags = Bitwise.bitreader(payload.readUInt8(22));
    // status.frontIn = frontFlags(0);
    // status.frontOut = frontFlags(1);
    // status.frontLSC = frontFlags(2);
    // status.temperatureHeight = payload.readUInt8(23);

    // return status;
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
