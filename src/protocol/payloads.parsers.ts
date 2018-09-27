import { Status } from './payloads.types';

export class TelloPayloadParsers {
  // <Buffer cc 18 01 b9 88 56 00 32 01 00 00 00 00 00 00 00 00 00 00 00 00 52 00 00 07 10 00 01 00 00 00 00 00 e8 13>
  static parseFlightStatus(payload: Buffer) {
    const status: Partial<Status> = {};
    let index = 0;
    status.height = (payload[index] | (payload[index + 1] << 8));
    index += 2;
    status.northSpeed = (payload[index] | (payload[index + 1] << 8));
    index += 2;
    status.eastSpeed = (payload[index] | (payload[index + 1] << 8));
    index += 2;
    status.flySpeed = Math.sqrt(Math.pow(status.northSpeed, 2) + Math.pow(status.eastSpeed, 2.0));
    status.verticalSpeed = (payload[index] | (payload[index + 1] << 8));
    index += 2;
    status.flyTime = payload[index] | (payload[index + 1] << 8);
    index += 2;

    status.imuState = (payload[index] >> 0 & 0x1) === 1;
    status.pressureState = (payload[index] >> 1 & 0x1) === 1;
    status.downVisualState = (payload[index] >> 2 & 0x1) === 1;
    status.powerState = (payload[index] >> 3 & 0x1) === 1;
    status.batteryState = (payload[index] >> 4 & 0x1) === 1;
    status.gravityState = (payload[index] >> 5 & 0x1) === 1;
    status.windState = (payload[index] >> 7 & 0x1) === 1;
    index += 1;

    status.imuCalibrationState = payload[index];
    index += 1;
    status.batteryPercentage = payload[index];
    index += 1;
    status.droneFlyTimeLeft = payload[index] | (payload[index + 1] << 8);
    index += 2;
    status.droneBatteryLeft = payload[index] | (payload[index + 1] << 8);
    index += 2;

    status.flying = (payload[index] >> 0 & 0x1) === 1;
    status.onGround = (payload[index] >> 1 & 0x1) === 1;
    status.eMOpen = (payload[index] >> 2 & 0x1) === 1;
    status.droneHover = (payload[index] >> 3 & 0x1) === 1;
    status.outageRecording = (payload[index] >> 4 & 0x1) === 1;
    status.batteryLow = (payload[index] >> 5 & 0x1) === 1;
    status.batteryLower = (payload[index] >> 6 & 0x1) === 1;
    status.factoryMode = (payload[index] >> 7 & 0x1) === 1;
    index += 1;

    status.flyMode = payload[index];
    index += 1;
    status.throwFlyTimer = payload[index];
    index += 1;
    status.cameraState = payload[index];
    index += 1;

    status.electricalMachineryState = payload[index];
    index += 1;
    status.frontIn = (payload[index] >> 0 & 0x1) === 1;
    status.frontOut = (payload[index] >> 1 & 0x1) === 1;
    status.frontLSC = (payload[index] >> 2 & 0x1) === 1;
    index += 1;
    status.temperatureHeight = (payload[index] >> 0 & 0x1);

    return status;
  }
}
