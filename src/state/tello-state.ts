import { TelloState } from './tello-state.types';
import { Subject, ConnectableObservable, of } from 'rxjs';
import { Packet, Command, TelloPacket } from '../protocol';
import { publishReplay, scan, startWith } from 'rxjs/operators';
import { PayloadParsers } from './parsers';

type StateUpdate = (state: TelloState) => TelloState;

export class TelloStateManager {

  private readonly updates = new Subject<StateUpdate>();
  readonly state: ConnectableObservable<TelloState>;

  constructor() {
    const init: TelloState = {
      battery: {},
      camera: {},
      flight: {},
      sensors: {},
      speed: {},
      status: {},
      wifi: {},
    };

    this.state = this.updates.asObservable().pipe(
      scan<StateUpdate, TelloState>((state, update) => update(state), init),
      startWith(init),
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
          wifi: { ...state.wifi, region },
        }));
        return true;

      case Command.WifiStrength:
        const wifi = PayloadParsers.parseWifiStrength(payload);
        this.updates.next(state => ({
          ...state,
          wifi: { ...state.wifi, ...wifi },
        }));
        return true;

      case Command.QuerySsid:
        const ssid = PayloadParsers.parseSsid(payload);
        this.updates.next(state => ({
          ...state,
          wifi: { ...state.wifi, ssid },
        }));
        return true;

      case Command.QuerySsidPass:
        const password = PayloadParsers.parseSsidPassword(payload);
        this.updates.next(state => ({
          ...state,
          wifi: { ...state.wifi, password },
        }));
        return true;

      case Command.QueryVideoBitrate:
      case Command.SetVideoBitrate:
        const bitrate = PayloadParsers.parseVideoBitrate(payload);
        this.updates.next(state => ({
          ...state,
          camera: { ...state.camera, bitrate },
        }));
        return true;

      case Command.SetCameraMode:
        const mode = PayloadParsers.parseCameraMode(payload);
        this.updates.next(state => ({
          ...state,
          camera: { ...state.camera, mode },
        }));
        return true;

      case Command.SetExposureValues:
        const exposure = PayloadParsers.parseExposureValue(payload);
        this.updates.next(state => ({
          ...state,
          camera: { ...state.camera, exposure },
        }));
        return true;

      case Command.LightStrength:
        const light = PayloadParsers.parseLightStrength(payload);
        this.updates.next(state => ({
          ...state,
          sensors: { ...state.sensors, light },
        }));
        return true;

      case Command.QueryJpegQuality:
        const jpegQuality = PayloadParsers.parseJpegQuality(payload);
        this.updates.next(state => ({
          ...state,
          camera: { ...state.camera, jpegQuality },
        }));
        return true;

      case Command.QueryVersion:
        const version = PayloadParsers.parseVersion(payload);
        this.updates.next(state => ({
          ...state,
          status: { ...state.status, version },
        }));
        return true;

      case Command.FlightStatus:
        const {
          flight,
          speed,
          sensors,
          camera,
          battery,
          status,
        } = PayloadParsers.parseFlightStatus(payload);

        this.updates.next(state => ({
          ...state,
          battery: { ...state.battery, ...battery },
          flight: { ...state.flight, ...flight },
          sensors: { ...state.sensors, ...sensors },
          speed: { ...state.speed, ...speed },
          camera: { ...state.camera, ...camera },
          status: { ...state.status, ...status },
        }));
        return true;

      case Command.QueryHeightLimit:
        const heightLimit = PayloadParsers.parseHeightLimit(payload);
        this.updates.next(state => ({
          ...state,
          flight: { ...state.flight, heightLimit },
        }));
        return true;

      case Command.QueryLowBattThresh:
        const lowThreshold = PayloadParsers.parseLowBatteryThreshold(payload);
        this.updates.next(state => ({
          ...state,
          battery: { ...state.battery, lowThreshold },
        }));
        return true;

      case Command.LogHeader:
      case Command.DoTakeoff:
      case Command.DoLand:
        return true;

      default:
        const label = TelloPacket.getCommandLabel(command);
        if (!label) {
          console.warn(`Got a completely unknown command: ${command}`);
        }
        else {
          console.log(`No parser defined for ${label} (${command}) command, payload is ${payload.length} bytes long`);
        }
        return false;
    }
  }
}
