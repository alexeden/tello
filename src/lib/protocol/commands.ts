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

  // TODO... what's this?
  HandleImuAngle = 0x5A,
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
