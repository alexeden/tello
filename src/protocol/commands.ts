// Type 0 - Extended
// Type 1 - Get
// Type 2 - DataOne
// Type 4 - DataTwo
// Type 5 - Set
// Type 6 - Flip

export enum Command {
  /* Type ? */  DoConnect           = 0x01,   // 1
  /* Type ? */  Connected           = 0x02,   // 2
  /* Type 1 */  QuerySsid           = 0x11,   // 17
  /* Type 5 */  SetSsid             = 0x12,   // 18
  /* Type 1 */  QuerySsidPass       = 0x13,   // 19
  /* Type 5 */  SetSsidPass         = 0x14,   // 20
  /* Type 1 */  QueryWifiRegion     = 0x15,   // 21
  /* Type 5 */  SetWifiRegion       = 0x16,   // 22
  /* Type 0 */  WifiStrength        = 0x1A,   // 26
  /* Type 5 */  SetVideoBitrate     = 0x20,   // 32
  /* Type 5 */  SetDynAdjRate       = 0x21,   // 33
  /* Type 5 */  EisSetting          = 0x24,   // 36
  /* Type 4 */  QueryVideoSpsPps    = 0x25,   // 37
  /* Type 1 */  QueryVideoBitrate   = 0x28,   // 40
  /* Type 5 */  DoTakePic           = 0x30,   // 48
  /* Type 5 */  SwitchPicVid        = 0x31,   // 49
  /* Type 5 */  DoStartRecording    = 0x32,   // 50
  /* Type 1 */  SetExposureVals     = 0x34,   // 52
  /* Type 0 */  LightStrength       = 0x35,   // 53
  /* Type 5 */  QueryJpegQuality    = 0x37,   // 55
  /* Type 0 */  Error1              = 0x43,   // 67
  /* Type 0 */  Error2              = 0x44,   // 68
  /* Type 1 */  QueryVersion        = 0x45,   // 69
  /* Type 2 */  SetDateTime         = 0x46,   // 70
  /* Type 1 */  QueryActivationTime = 0x47,   // 71
  /* Type 1 */  QueryLoaderVersion  = 0x49,   // 73
  /* Type 4 */  SetStick            = 0x50,   // 80
  /* Type 5 */  DoTakeoff           = 0x54,   // 84
  /* Type 5 */  DoLand              = 0x55,   // 85
  /* Type 0 */  FlightStatus        = 0x56,   // 86
  /* Type 5 */  SetHeightLimit      = 0x58,   // 88
  /* Type 1 */  HandleImuAngle      = 0x5A,   // 90
  /* Type 6 */  DoFlip              = 0x5C,   // 92
  /* Type 1 */  DoThrowTakeoff      = 0x5D,   // 93
  /* Type 1 */  DoPalmLand          = 0x5E,   // 94
  /* Type 2 */  FileSize            = 0x62,   // 98
  /* Type 2 */  FileData            = 0x63,   // 99
  /* Type 1 */  FileDone            = 0x64,   // 100
  /* Type 5 */  DoSmartVideo        = 0x80,   // 128
  /* Type 2 */  SmartVideoStatus    = 0x81,   // 129
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
