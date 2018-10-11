// tslint:disable no-invalid-this
import Vue from 'vue';
import VueRx from 'vue-rx';
import { Subscription, pipe, merge, fromEvent } from 'rxjs';
import { Player } from './player';
import * as template from './app.html';
import { filter, scan, map } from 'rxjs/operators';
import { RemoteControl, RemoteControlComponent } from './remote-control';

interface Status {
  flying: boolean;
  onGround: boolean;
  hovering: boolean;
  batteryLow: boolean;
  batteryVeryLow: boolean;
}

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


Vue.use(VueRx);

new Vue({
  el: '#app',
  template,
  components: {
    remoteControl: RemoteControlComponent,
  },
  data() {
    return {
      player: new Player({ size: { width: 1280, height: 720 }}),
      state: {} as any,
      stateSocket: null as (null | WebSocket),
      videoSocket: null as (null | WebSocket),
      stateConnected: false,
      videoConnected: false,
      remoteControl: {
        fastMode: false,
        leftX: 0,
        leftY: 0,
        rightX: 0,
        rightY: 0,
      } as RemoteControl,
      subscriptions: [] as Subscription[],
    };
  },
  created() {
    (window as any).app = this;
    this.connectState();
    // this.connectVideo();

  },
  mounted() {
    const videoWrapper = this.$refs.videoWrapper as HTMLDivElement;
    videoWrapper.appendChild(this.player.canvas);

    // this.keymap.pipe(
    //   map<ControlKeyMap, RemoteControl>(keymap => ({
    //     fastMode: false,
    //     leftX: (-1 * keymap[Controls.RotateCCW]) + keymap[Controls.RotateCW],
    //     leftY: 0,
    //     rightX: (-1 * keymap[Controls.Left]) + keymap[Controls.Right],
    //     rightY: (-1 * keymap[Controls.Backward]) + keymap[Controls.Forward],
    //   }))
    // )
    // .subscribe(console.log);
  },
  beforeDestroy() {
    let sub;
    // tslint:disable-next-line:no-conditional-assignment
    while (sub = this.subscriptions.shift()) {
      sub.unsubscribe();
    }
  },
  computed: {
    connected(): boolean {
      return this.stateConnected && this.videoConnected;
    },
    battery(): any {
      return this.state && this.state.battery || {};
    },
    status(): Status {
      return {
        flying: false,
        onGround: false,
        hovering: false,
        batteryLow: false,
        batteryVeryLow: false,
        ...(this.state && this.state.status || {}),
      };
    },
  },
  subscriptions() {

    return {
    };
  },
  methods: {
    handleRemoteControlCommand(cmd: string) {
      console.log(cmd);
      switch (cmd) {
        case 'connect':
          this.send(0x0001);
          break;
        case 'takeoff':
          this.send(0x0054);
          break;
          case 'land':
          this.send(0x0055);
          break;
        default:
          throw new Error(`Unknown command sent by the RC component: ${cmd}`);
      }
    },
    handleRemoteControlChange(rc: RemoteControl) {
      console.log(rc);
    },
    send(command: number, data: any = null) {
      if (!this.stateConnected) return;

      this.stateSocket!.send(JSON.stringify({
        command,
        data,
      }));
    },
    connectState() {
      const stateSocket = (!this.stateSocket || this.stateSocket!.readyState !== WebSocket.OPEN && this.stateSocket.readyState !== WebSocket.CONNECTING)
        ? new WebSocket(`wss://${window.location.host}/state`)
        : this.stateSocket;
      const { readyState } = stateSocket;
      this.stateConnected = readyState === WebSocket.OPEN;
      stateSocket.onopen = () => this.stateConnected = true;
      stateSocket.onerror = errorEvent => {
        console.error('state socket error', errorEvent);
        this.stateConnected = false;
      };
      stateSocket.onclose = () => this.stateConnected = false;
      stateSocket.onmessage = e => this.state = JSON.parse(e.data);
      this.stateSocket = stateSocket;
    },
    connectVideo() {
      const videoSocket = (!this.videoSocket || this.videoSocket!.readyState !== WebSocket.OPEN && this.videoSocket.readyState !== WebSocket.CONNECTING)
        ? new WebSocket(`wss://${window.location.host}/video`)
        : this.videoSocket;
      const { readyState } = videoSocket;
      this.videoConnected = readyState === WebSocket.OPEN;
      videoSocket.onopen = () => this.videoConnected = true;
      videoSocket.onerror = errorEvent => {
        console.error('video socket error', errorEvent);
        this.videoConnected = false;
      };
      videoSocket.onclose = () => {
        this.videoConnected = false;
      };
      videoSocket.onmessage = e => this.player.decode(e.data, { startProcessing: performance.now() });
      this.videoSocket = videoSocket;
    },
  },
});
