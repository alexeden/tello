import { Exposure, VideoBitrate, CameraMode, Stick } from '../lib';
import { Wifi, Speed, Battery, Flight, Sensors, Status, Camera } from './tello-state.types';
import { Bitwise } from '../utils';


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

  // Command 17
  static parseSsid(payload: Buffer): string {
    return payload.toString();
  }

  // Command 17
  static parseSsidPassword(payload: Buffer): string {
    return payload.toString();
  }

  // Command 69
  static parseVersion(payload: Buffer): string {
    return payload.toString();
  }

  // Command 86
  static parseFlightStatus(payload: Buffer) {
    if (payload.length < 24) {
      console.warn('Flight status payload was too short to process');
      return {};
    }

    const statusByte = Bitwise.bitreader(payload.readUInt8(17));
    const sensorStateByte = Bitwise.bitreader(payload.readUInt8(10));
    const frontByte = Bitwise.bitreader(payload.readUInt8(22));

    const battery: Partial<Battery> = {
      percentage: payload.readInt8(12),
      batteryLeft: payload.readInt16LE(15),
      flyTimeLeft: payload.readInt16LE(13),
    };

    const speed: Speed = {
      lateral: payload.readInt16LE(4),
      longitudinal: payload.readInt16LE(2),
      vertical: payload.readInt16LE(6),
    };

    const sensors: Partial<Sensors> = {
      height: payload.readInt16LE(0),
      imuCalibration: payload.readInt8(11),
      imuState: sensorStateByte(0),
      pressureState: sensorStateByte(1),
      downVisualState: sensorStateByte(2),
      powerState: sensorStateByte(3),
      batteryState: sensorStateByte(4),
      gravityState: sensorStateByte(5),
      windState: sensorStateByte(7),
      temperatureHeight: payload.readUInt8(23),
    };

    const flight: Partial<Flight> = {
      time: payload.readInt16LE(8),
      mode: payload.readInt8(18),
      throwFlyTimer: payload.readInt8(19),
    };

    const status: Partial<Status> = {
      flying: statusByte(0),
      onGround: statusByte(1),
      emOpen: statusByte(2),
      hovering: statusByte(3),
      outageRecording: statusByte(4),
      batteryLow: statusByte(5),
      batteryVeryLow: statusByte(6),
      factoryMode: statusByte(7),
      electricalMachineryState: payload.readInt8(21),
    };

    const camera: Partial<Camera> = {
      state: payload.readInt8(20),
      frontIn: frontByte(0),
      frontOut: frontByte(1),
      frontLSC: frontByte(2),
    };

    return {
      flight,
      speed,
      sensors,
      camera,
      battery,
      status,
    };
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
