import { TelloState } from './types';

export class TelloUtils {
  // “pitch:%d;roll:%d;yaw:%d;vgx:%d;vgy%d;vgz:%d;templ:%d;temph:%d;tof:%d;h:%d;bat:%d;baro:%.2f;time:%d;agx:%.2f;agy:%.2f;agz:%.2f;\r\n”
  static parseState(rawState: string): Readonly<TelloState> {
    const emptyState: TelloState = {
      tof: -1,
      h: -1,
      bat: -1,
      baro: -1,
      time: -1,
      pitch: -1,  roll: -1, yaw: -1,
      vgx: -1,    vgy: -1,  vgz: -1,
      agx: -1,    agy: -1,  agz: -1,
      templ: -1,  temph: -1,
    };

    rawState.split(';')
      .map(kvString => kvString.split(':'))
      .filter((kvPair): kvPair is [keyof TelloState, string] => kvPair.length === 2 && kvPair[0] in emptyState)
      .forEach(([k, v]) => emptyState[k] = parseFloat(v));

    return emptyState;
  }
}
