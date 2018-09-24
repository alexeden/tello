import { UdpSubject } from './utils';
import {
  TelloCommandClient,
  TelloCommandServer,
  TelloVideoClient,
} from './tello.constants';
import { TelloPacketGenerator } from './protocol';

export class Tello {

  private readonly commandSocket: UdpSubject;
  private readonly videoSocket: UdpSubject;
  readonly generator: TelloPacketGenerator;

  constructor() {
    this.commandSocket = UdpSubject.create(TelloCommandClient).setTarget(TelloCommandServer).bind();
    this.videoSocket = UdpSubject.create(TelloVideoClient).bind();
    this.generator = new TelloPacketGenerator();
  }
}
