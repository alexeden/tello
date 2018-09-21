import * as R from 'ramda';

export const TelloCommandClient = {
  port: 8800,
  address: '0.0.0.0',
};

export const TelloStateClient = {
  address: '0.0.0.0',
  port: 8890,
};

export const TelloVideoClient = {
  address: '0.0.0.0',
  port: 6038,
};

export const TelloCommandServer = {
  port: 8889,
  address: '192.168.10.1',
};

const distanceClamp = R.clamp(20, 500);
const rotationClamp = R.clamp(1, 3600);
const speedClamp = R.clamp(10, 100);

export const TelloControlCommands = {
  Start: () => Buffer.from('command'),
  EmergencyStop: () => Buffer.from('emergency'),
  Flip: (dir: 'l' | 'r' | 'f' | 'b') => Buffer.from(`flip ${dir}`),
  GoBack: (x: number) => Buffer.from(`back ${distanceClamp(x)}`),
  GoDown: (x: number) => Buffer.from(`down ${distanceClamp(x)}`),
  GoForward: (x: number) => Buffer.from(`forward ${distanceClamp(x)}`),
  GoLeft: (x: number) => Buffer.from(`left ${distanceClamp(x)}`),
  GoRight: (x: number) => Buffer.from(`right ${distanceClamp(x)}`),
  GoUp: (x: number) => Buffer.from(`up ${distanceClamp(x)}`),
  Land: () => Buffer.from('land'),
  RotateLeft: (degs: number) => Buffer.from(`ccw ${rotationClamp(degs)}`),
  RotateRight: (degs: number) => Buffer.from(`cw ${rotationClamp(degs)}`),
  Takeoff: () => Buffer.from('takeoff'),
  VideoOff: () => Buffer.from('streamoff'),
  VideoOn: () => Buffer.from('streamon'),
  Go: (x: number, y: number, z: number, speed: number) => {
    return Buffer.from(`go ${distanceClamp(x)} ${distanceClamp(y)} ${distanceClamp(z)} ${speedClamp(speed)}`);
  },
  // Curve: curve x1 y1 z1 x2 y2 z2 speed (see docs)
};

export const TelloReadCommands = {
  Acceleration: Buffer.from(`acceleration?`),
  Altitude: Buffer.from(`height?`),
  Battery: Buffer.from(`battery?`),
  FlightTime: Buffer.from(`time?`),
  Orientation: Buffer.from(`attitude?`),
  Speed: Buffer.from(`speed?`),
  Temperature: Buffer.from(`temp?`),
  TimeOfFlight: Buffer.from(`tof?`),
  Wifi: Buffer.from(`wifi?`),
};
