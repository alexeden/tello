// tslint:disable no-invalid-this
import Vue from 'vue';
import { Subscription, pipe, merge, fromEvent } from 'rxjs';
import { filter, scan, map } from 'rxjs/operators';
import * as template from './remote-control.html';


enum Controls {
  Forward = 'KeyE',
  Left = 'KeyS',
  Backward = 'KeyD',
  Right = 'KeyF',
  RotateCCW = 'KeyJ',
  RotateCW = 'KeyL',
  Up = 'KeyI',
  Down = 'KeyK',
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
  props: {
    flying: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    const keycodes = Object.values(Controls);
    const keymapInit = keycodes.reduce((keymap, k) => ({ ...keymap, [k]: 0 }), {}) as ControlKeyMap;

    return {
      keymapValues: {
        fastMode: false,
        leftX: 0,
        leftY: 0,
        rightX: 0,
        rightY: 0,
      },
      keymap: merge(fromEvent<KeyboardEvent>(document, 'keydown'), fromEvent<KeyboardEvent>(document, 'keyup')).pipe(
        filter(e => !e.repeat && keycodes.includes(e.code)),
        scan<KeyboardEvent, ControlKeyMap>((keymap, e) => ({ ...keymap, [e.code]: ~~(e.type === 'keydown') }), keymapInit)
      ),
    };
  },
  methods: {
    handleCommand(cmd: string) {
      this.$emit('command', cmd);
    },
  },
  mounted() {
    (window as any).rc = this;
    this.keymap.pipe(
      map<ControlKeyMap, RemoteControl>(keymap => ({
        fastMode: false,
        leftX: (-1 * keymap[Controls.RotateCCW]) + keymap[Controls.RotateCW],
        leftY: (-1 * keymap[Controls.Down]) + keymap[Controls.Up],
        rightX: (-1 * keymap[Controls.Left]) + keymap[Controls.Right],
        rightY: (-1 * keymap[Controls.Backward]) + keymap[Controls.Forward],
      }))
    )
    .subscribe(rc => {
      this.$emit('change', rc);
      this.keymapValues = rc;
    });
  },
});
