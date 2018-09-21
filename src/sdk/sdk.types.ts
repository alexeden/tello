export interface TelloState {
  /**
   * IMU acceleration along the X-axis (0.001g)
   */
  agx: number;
  /**
   * IMU acceleration along the Y-axis (0.001g)
   */
  agy: number;
  /**
   * IMU acceleration along the Z-axis (0.001g)
   */
  agz: number;
  /**
   * Barometer pressure (m)
   */
  baro: number;
  /**
   * Battery level (0-100%)
   */
  bat: number;
  /**
   * Current height relative to take-off (centimeters)
   */
  h: number;
  /**
   * Highest measured temperature (˚Celcius)
   */
  temph: number;
  /**
   * Lowest measured temperature (˚Celcius)
   */
  templ: number;
  /**
   * Amount of time elapsed since the motors powered up (seconds)
   */
  time: number;
  /**
   * ???
   * Distance from TOF (centimeters)
   */
  tof: number;
  /**
   * Current velocity along the X-axis (centimeters per second)
   */
  vgx: number;
  /**
   * Current velocity along the Y-axis (centimeters per second)
   */
  vgy: number;
  /**
   * Current velocity along the Z-axis (centimeters per second)
   */
  vgz: number;
  /**
   * Device pitch (degrees)
   */
  pitch: number;
  /**
   * Device roll (degrees)
   */
  roll: number;
  /**
   * Device yaw (degrees)
   */
  yaw: number;
}
