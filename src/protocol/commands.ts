// TODO: What type are these?
//   DoConnect           = 0x0001, // 1``
//   Connected           = 0x0002, // 2

export enum Type {
  Extended = 0, // 0x8X ???
  Get      = 1, // 0x48
  DataOne  = 2, // 0x50
  DataTwo  = 4, // 0x60
  Set      = 5, // 0x68
  Flip     = 6, // 0x70
}

export enum Command {
  // Type 0 - Extended
  Error1 = 0x43,
  Error2 = 0x44,
  FlightStatus = 0x56,
  LightStrength = 0x35,
  LogDataWrite = 0x1051,
  WifiStrength = 0x1A,

  // Type 1 - Get
  DoPalmLand = 0x5E,
  DoThrowTakeoff = 0x5D,
  ExposureVals = 0x34, // get or set?
  FileDone = 0x64,
  HandleImuAngle = 0x5A, // TODO... what's this?
  QueryActivationTime = 0x47,
  QueryAttitude = 0x1059,
  QueryHeightLimit = 0x1056,
  QueryLoaderVersion = 0x49,
  QueryLowBattThresh = 0x1057,
  QuerySsid = 0x11,
  QuerySsidPass = 0x13,
  QueryVersion = 0x45,
  QueryVideoBitrate = 0x28,
  QueryWifiRegion = 0x15,

  // Type 2 - DataOne
  FileData = 0x63,
  FileSize = 0x62,
  LogConfig = 0x1052,
  LogHeader = 0x1050,
  SetDateTime = 0x46,
  SmartVideoStatus = 0x81,

  // Type 4 - DataTwo
  QueryVideoSpsPps = 0x25,
  SetStick = 0x50,

  // Type 5 - Set
  DoBounce = 0x1053,
  DoCalibration = 0x1054,
  DoLand = 0x55,
  DoSmartVideo = 0x80,
  DoStartRecording = 0x32,
  DoTakeoff = 0x54,
  DoTakePic = 0x30,
  EisSetting = 0x24,
  QueryJpegQuality = 0x37,
  SetAttitude = 0x1058,
  SetDynAdjRate = 0x21,
  SetHeightLimit = 0x58,
  SetLowBattThresh = 0x1055,
  SetSsid = 0x12,
  SetSsidPass = 0x14,
  SetVideoBitrate = 0x20,
  SetWifiRegion = 0x16,
  SwitchPicVid = 0x31,

  // Type 6 - Flip
  DoFlip = 0x5C,
}

export const getCommandType = (cmd: Command): Type => {
  switch (cmd) {
    case Command.Error1:
    case Command.Error2:
    case Command.FlightStatus:
    case Command.LightStrength:
    case Command.LogDataWrite:
    case Command.WifiStrength:
      return Type.Extended;
    case Command.DoPalmLand:
    case Command.DoThrowTakeoff:
    case Command.ExposureVals:
    case Command.FileDone:
    case Command.HandleImuAngle:
    case Command.QueryActivationTime:
    case Command.QueryAttitude:
    case Command.QueryHeightLimit:
    case Command.QueryLoaderVersion:
    case Command.QueryLowBattThresh:
    case Command.QuerySsid:
    case Command.QuerySsidPass:
    case Command.QueryVersion:
    case Command.QueryVideoBitrate:
    case Command.QueryWifiRegion:
      return Type.Get;
    case Command.FileData:
    case Command.FileSize:
    case Command.LogConfig:
    case Command.LogHeader:
    case Command.SetDateTime:
    case Command.SmartVideoStatus:
      return Type.DataOne;
    case Command.QueryVideoSpsPps:
    case Command.SetStick:
      return Type.DataTwo;
    case Command.DoBounce:
    case Command.DoCalibration:
    case Command.DoLand:
    case Command.DoSmartVideo:
    case Command.DoStartRecording:
    case Command.DoTakeoff:
    case Command.DoTakePic:
    case Command.EisSetting:
    case Command.QueryJpegQuality:
    case Command.SetAttitude:
    case Command.SetDynAdjRate:
    case Command.SetHeightLimit:
    case Command.SetLowBattThresh:
    case Command.SetSsid:
    case Command.SetSsidPass:
    case Command.SetVideoBitrate:
    case Command.SetWifiRegion:
    case Command.SwitchPicVid:
      return Type.Set;
    case Command.DoFlip:
      return Type.Flip;
    default:
      throw new Error(`Unknown command "${cmd}", can't get command type.`);
  }
};
