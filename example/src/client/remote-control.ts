// tslint:disable no-invalid-this
import Vue from 'vue';
import { Subscription, pipe, merge, fromEvent } from 'rxjs';
import { filter, scan, map } from 'rxjs/operators';
import * as template from './remote-control.html';


enum Controls {
  Forward = 'KeyW',
  Left = 'KeyA',
  Backward = 'KeyS',
  Right = 'KeyD',
  RotateCCW = 'KeyJ',
  RotateCW = 'KeyK',
}

type ControlKeyMap = {
  [P in Controls]: 0 | 1
};

export interface RemoteControl {
  fastMode: boolean;
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
}

export const RemoteControlComponent = Vue.extend({
  template,
  name: 'remote-control',
  data() {
    const keycodes = Object.values(Controls);
    const keymapInit = keycodes.reduce((keymap, k) => ({ ...keymap, [k]: 0 }), {}) as ControlKeyMap;

    return {
      keymap: merge(fromEvent<KeyboardEvent>(document, 'keydown'), fromEvent<KeyboardEvent>(document, 'keyup')).pipe(
        filter(e => !e.repeat && keycodes.includes(e.code)),
        scan<KeyboardEvent, ControlKeyMap>((keymap, e) => ({ ...keymap, [e.code]: ~~(e.type === 'keydown') }), keymapInit)
      ),
    };
  },
  mounted() {
    this.keymap.pipe(
      map<ControlKeyMap, RemoteControl>(keymap => ({
        fastMode: false,
        leftX: (-1 * keymap[Controls.RotateCCW]) + keymap[Controls.RotateCW],
        leftY: 0,
        rightX: (-1 * keymap[Controls.Left]) + keymap[Controls.Right],
        rightY: (-1 * keymap[Controls.Backward]) + keymap[Controls.Forward],
      }))
    )
    .subscribe(rc => this.$emit('change', rc));
  },
});
