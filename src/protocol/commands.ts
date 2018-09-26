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
  WifiStrength = 0x1A, // 26
  LightStrength = 0x35, // 53
  Error1 = 0x43, // 67
  Error2 = 0x44, // 68
  FlightStatus = 0x56, // 86
  LogDataWrite = 0x1051, // 4177

  // Type 1 - Get
  QuerySsid = 0x11, // 17
  QuerySsidPass = 0x13, // 19
  QueryWifiRegion = 0x15, // 21
  QueryVideoBitrate = 0x28, // 40
  ExposureVals = 0x34, // 52
  QueryVersion = 0x45, // 69
  QueryActivationTime = 0x47, // 71
  QueryLoaderVersion = 0x49, // 73
  // TODO... what's this?
  HandleImuAngle = 0x5A, // 90
  DoThrowTakeoff = 0x5D, // 93
  DoPalmLand = 0x5E, // 94
  // get or set?
  FileDone = 0x64, // 100
  QueryHeightLimit = 0x1056, // 4182
  QueryLowBattThresh = 0x1057, // 4183
  QueryAttitude = 0x1059, // 4185

  // Type 2 - DataOne
  SetDateTime = 0x46, // 70
  FileSize = 0x62, // 98
  FileData = 0x63, // 99
  SmartVideoStatus = 0x81, // 129
  LogHeader = 0x1050, // 4176
  LogConfig = 0x1052, // 4178

  // Type 4 - DataTwo
  QueryVideoSpsPps = 0x25, // 37
  SetStick = 0x50, // 80

  // Type 5 - Set
  SetSsid = 0x12, // 18
  SetSsidPass = 0x14, // 20
  SetWifiRegion = 0x16, // 22
  SetVideoBitrate = 0x20, // 32
  SetDynAdjRate = 0x21, // 33
  EisSetting = 0x24, // 36
  DoTakePic = 0x30, // 48
  SwitchPicVid = 0x31, // 49
  DoStartRecording = 0x32, // 50
  QueryJpegQuality = 0x37, // 55
  DoTakeoff = 0x54, // 84
  DoLand = 0x55, // 85
  SetHeightLimit = 0x58, // 88
  DoSmartVideo = 0x80, // 128
  DoBounce = 0x1053, // 4179
  DoCalibration = 0x1054, // 4180
  SetLowBattThresh = 0x1055, // 4181
  SetAttitude = 0x1058, // 4184

  // Type 6 - Flip
  DoFlip = 0x5C, // 92
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
