export enum Type {
  Extended = 0, // 0x8X ???
  Get      = 1, // 0x48
  DataOne  = 2, // 0x50
  DataTwo  = 4, // 0x60
  Set      = 5, // 0x68
  Flip     = 6, // 0x70
}

// TODO: What type are these?
//   DoConnect           = 0x0001, // 1
//   Connected           = 0x0002, // 2


// Type 0
export enum ExtendedCommand {
  WifiStrength = 0x1A,
  LightStrength = 0x35,
  Error1 = 0x43,
  Error2 = 0x44,
  FlightStatus = 0x56,
  LogDataWrite = 0x1051,
}

// Type 1
export enum GetCommand {
  QuerySsid = 0x11,
  QuerySsidPass = 0x13,
  QueryWifiRegion = 0x15,
  ExposureVals = 0x34, // get or set?
  QueryVideoBitrate = 0x28,
  QueryVersion = 0x45,
  QueryActivationTime = 0x47,
  QueryLoaderVersion = 0x49,
  QueryHeightLimit = 0x1056,
  QueryLowBattThresh = 0x1057,
  QueryAttitude = 0x1059,
  DoThrowTakeoff = 0x5D,
  DoPalmLand = 0x5E,
  FileDone = 0x64,
  HandleImuAngle = 0x5A, // TODO... what's this?
}

// Type 2
export enum DataOneCommand {
  SetDateTime = 0x46,
  LogHeader = 0x1050,
  LogConfig = 0x1052,
  FileSize = 0x62,
  FileData = 0x63,
  SmartVideoStatus = 0x81,
}

// Type 4
export enum DataTwoCommand {
  QueryVideoSpsPps = 0x25,
  SetStick = 0x50,
}

// Type 5
export enum SetCommand {
  SetSsid = 0x12,
  SetSsidPass = 0x14,
  SetWifiRegion = 0x16,
  DoTakePic = 0x30,
  SwitchPicVid = 0x31,
  DoStartRecording = 0x32,
  QueryJpegQuality = 0x37,
  DoTakeoff = 0x54,
  DoLand = 0x55,
  SetHeightLimit = 0x58,
  DoCalibration = 0x1054,
  SetLowBattThresh = 0x1055,
  SetAttitude = 0x1058,
  SetVideoBitrate = 0x20,
  SetDynAdjRate = 0x21,
  EisSetting = 0x24,
  DoSmartVideo = 0x80,
  DoBounce = 0x1053,
}

// Type 6
export enum FlipCommand {
  DoFlip = 0x5C,
}

export type Command
  = ExtendedCommand
  | GetCommand
  | DataOneCommand
  | DataTwoCommand
  | SetCommand
  | FlipCommand;


// const commandTypeMap = (() => {
//   const map: { [command: number]: Type } = {};
//   [
//     [ ExtendedCommand, Type.Extended],
//     [ GetCommand, Type.Get],
//     [ DataOneCommand, Type.DataOne],
//     [ DataTwoCommand, Type.DataTwo],
//     [ SetCommand, Type.Set],
//     [ FlipCommand, Type.Flip],
//   ]
//   .forEach(([ commandSet, type ]: [Command, Type]) => {
//     Object.values(commandSet).forEach((command: number) => {
//       map[command] = type;
//     });
//   });

//   Object.values(ExtendedCommand).forEach((command: number) => {
//     map[command] = Type.Extended;
//   });
//   Object.values(GetCommand).forEach((command: number) => {
//     map[command] = Type.Get;
//   });
//   Object.values(DataOneCommand).forEach((command: number) => {
//     map[command] = Type.DataOne;
//   });
//   Object.values(DataTwoCommand).forEach((command: number) => {
//     map[command] = Type.DataTwo;
//   });
//   Object.values(SetCommand).forEach((command: number) => {
//     map[command] = Type.Set;
//   });
//   Object.values(FlipCommand).forEach((command: number) => {
//     map[command] = Type.Flip;
//   });
//   return map;
// })();

// console.log(commandTypeMap);

// export const commandType = (cmd: Command): Type => {
//   return Type.DataTwo;
// };

export function typeToCommands(type: Type.Extended): typeof ExtendedCommand;
export function typeToCommands(type: Type.Get): typeof GetCommand;
export function typeToCommands(type: Type.DataOne): typeof DataOneCommand;
export function typeToCommands(type: Type.DataTwo): typeof DataTwoCommand;
export function typeToCommands(type: Type.Set): typeof SetCommand;
export function typeToCommands(type: Type.Flip): typeof FlipCommand;
export function typeToCommands(type: Type) {
  switch (type) {
    case Type.Extended: return ExtendedCommand;
    case Type.Get: return GetCommand;
    case Type.DataOne: return DataOneCommand;
    case Type.DataTwo: return DataTwoCommand;
    case Type.Set: return SetCommand;
    case Type.Flip: return FlipCommand;
  }
}
