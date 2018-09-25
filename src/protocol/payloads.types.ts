export interface Time {
  h: number;
  m: number;
  s: number;
  ms: number;
}

export interface Stick {
  // -32768 to 32767 per direction
  fastMode: boolean;
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
}
