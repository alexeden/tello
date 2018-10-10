import { Stick } from './lib';
import { Clamp } from './utils';

export class TelloRemoteControl implements Stick {
  fastMode = false;
  @Clamp(-1, 1) leftX = 0;
  @Clamp(-1, 1) leftY = 0;
  @Clamp(-1, 1) rightX = 0;
  @Clamp(-1, 1) rightY = 0;

  applyToAll(fn: (axis: number) => number): this {
    this.leftX = fn(this.leftX);
    this.leftY = fn(this.leftY);
    this.rightX = fn(this.rightX);
    this.rightY = fn(this.rightY);
    return this;
  }

  apply<P extends keyof Stick>(prop: P, fn: (value: Stick[P]) => Stick[P]) {
    this[prop] = fn(this[prop]);
    return this;
  }

  set(stick: Partial<Stick>) {
    Object.assign(this, stick);
    return this;
  }

  reset() {
    return this.applyToAll(() => 0);
  }

  invert() {
    return this.applyToAll(axis => -1 * axis);
  }

  toString() {
    return `{ leftX: ${this.leftX}, leftY: ${this.leftY}, rightX: ${this.rightX}, rightY: ${this.rightY} }`;
  }
}
