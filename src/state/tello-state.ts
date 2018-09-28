import { TelloState } from './state.types';
import { Subject, ConnectableObservable, of } from 'rxjs';
import { Packet, Command } from '../protocol';
import { publishReplay, switchMap, scan } from 'rxjs/operators';
import { PayloadParsers } from './parsers';

type StateUpdate = (state: TelloState) => TelloState;

export class TelloStateManager {

  private readonly updates = new Subject<StateUpdate>();
  readonly state: ConnectableObservable<TelloState>;

  constructor() {
    const init: TelloState = {
      battery: {},
      flight: {},
      sensorFlags: {},
      speed: {},
      wifi: {},
    };

    this.state = this.updates.asObservable().pipe(
      scan<StateUpdate, TelloState>((state, update) => update(state), init),
      publishReplay(1)
    ) as ConnectableObservable<TelloState>;

    this.state.connect();
  }



  parseAndUpdate({ command, payload }: Packet) {
    switch (command) {
      case Command.QueryWifiRegion:
        const region = PayloadParsers.parseWifiRegion(payload);
        this.updates.next(state => ({
          ...state,
          wifi: {
            ...state.wifi,
            region,
          },
        }));
        break;
      case Command.WifiStrength:
        const { signal, interference } = PayloadParsers.parseWifiStrength(payload);
        this.updates.next(state => ({
          ...state,
          wifi: {
            ...state.wifi,
            interference,
            signal,
          },
        }));
        break;
      case Command.SetVideoBitrate:
        break;
      case Command.SetCameraMode:
        break;
      case Command.SetExposureValues:
        break;
      case Command.LightStrength:
        break;
      case Command.QueryJpegQuality:
        break;
      case Command.QueryVersion:
        break;
      case Command.FlightStatus:
        const {
          battery,
          flight,
          sensorFlags,
          speed,
        } = PayloadParsers.parseFlightStatus(payload);
        this.updates.next(state => ({
          ...state,
          battery: { ...state.battery, ...battery },
          flight: { ...state.flight, ...flight },
          sensorFlags: { ...state.sensorFlags, ...sensorFlags },
          speed: { ...state.speed, ...speed },
        }));
        break;
      case Command.QueryHeightLimit:
        break;
      case Command.QueryLowBattThresh:
        break;
      case Command.QueryAttitude:
        break;


    }
    return true;
  }


}
