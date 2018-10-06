// Type 0 - Extended
// Type 1 - Get
// Type 2 - DataOne
// Type 4 - DataTwo
// Type 5 - Set
// Type 6 - Flip

export enum Command {
  /* Type ? */  DoConnect           = 0x0001, // 1
  /* Type ? */  Connected           = 0x0002, // 2
  /* Type 1 */  QuerySsid           = 0x0011, // 17
  /* Type 5 */  SetSsid             = 0x0012, // 18
  /* Type 1 */  QuerySsidPass       = 0x0013, // 19
  /* Type 5 */  SetSsidPass         = 0x0014, // 20
  /* Type 1 */  QueryWifiRegion     = 0x0015, // 21
  /* Type 5 */  SetWifiRegion       = 0x0016, // 22
  /* Type 0 */  WifiStrength        = 0x001A, // 26
  /* Type 5 */  SetVideoBitrate     = 0x0020, // 32
  /* Type 5 */  SetDynAdjRate       = 0x0021, // 33
  /* Type 5 */  EisSetting          = 0x0024, // 36
  /* Type 4 */  QueryVideoSpsPps    = 0x0025, // 37
  /* Type 1 */  QueryVideoBitrate   = 0x0028, // 40
  /* Type 5 */  DoTakePic           = 0x0030, // 48
  /* Type 5 */  SetCameraMode       = 0x0031, // 49
  /* Type 5 */  DoStartRecording    = 0x0032, // 50
  /* Type 1 */  SetExposureValues   = 0x0034, // 52
  /* Type 0 */  LightStrength       = 0x0035, // 53
  /* Type 5 */  QueryJpegQuality    = 0x0037, // 55
  /* Type 0 */  Error1              = 0x0043, // 67
  /* Type 0 */  Error2              = 0x0044, // 68
  /* Type 1 */  QueryVersion        = 0x0045, // 69
  /* Type 2 */  SetDateTime         = 0x0046, // 70
  /* Type 1 */  QueryActivationTime = 0x0047, // 71
  /* Type 1 */  QueryLoaderVersion  = 0x0049, // 73
  /* Type 4 */  SetStick            = 0x0050, // 80
  /* Type 5 */  DoTakeoff           = 0x0054, // 84
  /* Type 5 */  DoLand              = 0x0055, // 85
  /* Type 0 */  FlightStatus        = 0x0056, // 86
  /* Type 5 */  SetHeightLimit      = 0x0058, // 88
  /* Type 1 */  HandleImuAngle      = 0x005A, // 90
  /* Type 6 */  DoFlip              = 0x005C, // 92
  /* Type 1 */  DoThrowTakeoff      = 0x005D, // 93
  /* Type 1 */  DoPalmLand          = 0x005E, // 94
  /* Type 2 */  FileSize            = 0x0062, // 98
  /* Type 2 */  FileData            = 0x0063, // 99
  /* Type 1 */  FileDone            = 0x0064, // 100
  /* Type 5 */  DoSmartVideo        = 0x0080, // 128
  /* Type 2 */  SmartVideoStatus    = 0x0081, // 129
  /* Type 2 */  LogHeader           = 0x1050, // 4176
  /* Type 0 */  LogDataWrite        = 0x1051, // 4177
  /* Type 2 */  LogConfig           = 0x1052, // 4178
  /* Type 5 */  DoBounce            = 0x1053, // 4179
  /* Type 5 */  DoCalibration       = 0x1054, // 4180
  /* Type 5 */  SetLowBattThresh    = 0x1055, // 4181
  /* Type 1 */  QueryHeightLimit    = 0x1056, // 4182
  /* Type 1 */  QueryLowBattThresh  = 0x1057, // 4183
  /* Type 5 */  SetAttitude         = 0x1058, // 4184
  /* Type 1 */  QueryAttitude       = 0x1059, // 4185
}
