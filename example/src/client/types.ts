export interface Status {
  flying: boolean;
  onGround: boolean;
  hovering: boolean;
  batteryLow: boolean;
  batteryVeryLow: boolean;
}

export enum Controls {
  Forward = 'KeyE',
  Left = 'KeyS',
  Backward = 'KeyD',
  Right = 'KeyF',
  RotateCCW = 'KeyJ',
  RotateCW = 'KeyL',
  Up = 'KeyI',
  Down = 'KeyK',
}

export type ControlKeyMap = { [P in Controls]: 0 | 1 };

export interface RemoteControl {
  fastMode: boolean;
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
}
