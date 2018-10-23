// tslint:disable no-invalid-this
import { app, ActionType, ActionsType, View, h } from 'hyperapp';
import { Player } from './player';
import { filter, scan, map } from 'rxjs/operators';
import { DroneAerialGraphic, DroneFrontGraphic } from './common/DroneGraphic';

const state = {
  count: 0,
};

type State = typeof state;

type Action = 'up' | 'down';

type Actions = {
  [A in Action]: ActionType<State, Actions>;
};

const actions: ActionsType<State, Actions> = {
  down: (value: number) => s => ({ count: s.count - value }),
  up: (value: number) => s => ({ count: s.count + value }),
};

const view: View<State, Actions> = (s, a) => (
  <div>
    <h1>{s.count}</h1>
    <button onclick={() => a.down(1)}>-</button>
    <button onclick={() => a.up(1)}>+</button>
    <DroneAerialGraphic flying={true} />
    <DroneFrontGraphic flying={true} />
  </div>
);

app<State, Actions>(state, actions, view, document.body);
// interface Status {
//   flying: boolean;
//   onGround: boolean;
//   hovering: boolean;
//   batteryLow: boolean;
//   batteryVeryLow: boolean;
// }

// enum Controls {
//   Forward = 'KeyW',
//   Left = 'KeyA',
//   Backward = 'KeyS',
//   Right = 'KeyD',
//   RotateCCW = 'KeyJ',
//   RotateCW = 'KeyK',
// }

// type ControlKeyMap = {
//   [P in Controls]: 0 | 1
// };


// Vue.use(VueRx);

// new Vue({
//   el: '#app',
//   template,
//   components: {
//     remoteControl: RemoteControlComponent,
//   },
//   data() {
//     return {
//       player: new Player({ size: { width: 960, height: 720 }}),
//       state: {} as any,
//       rcSocket: null as (null | WebSocket),
//       stateSocket: null as (null | WebSocket),
//       videoSocket: null as (null | WebSocket),
//       rcConnected: false,
//       stateConnected: false,
//       videoConnected: false,
//       remoteControl: {
//         fastMode: false,
//         leftX: 0,
//         leftY: 0,
//         rightX: 0,
//         rightY: 0,
//       } as RemoteControl,
//       subscriptions: [] as Subscription[],
//     };
//   },
//   created() {
//     (window as any).app = this;
//     this.connectState();
//     this.connectRemoteControl();
//     // this.connectVideo();

//   },
//   mounted() {
//     const videoWrapper = this.$refs.videoWrapper as HTMLDivElement;
//     videoWrapper.appendChild(this.player.canvas);
//   },
//   beforeDestroy() {
//     let sub;
//     // tslint:disable-next-line:no-conditional-assignment
//     while (sub = this.subscriptions.shift()) {
//       sub.unsubscribe();
//     }
//   },
//   computed: {
//     connected(): boolean {
//       return this.stateConnected && this.videoConnected;
//     },
//     battery(): any {
//       return this.state && this.state.battery || {};
//     },
//     status(): Status {
//       return {
//         flying: false,
//         onGround: false,
//         hovering: false,
//         batteryLow: false,
//         batteryVeryLow: false,
//         ...(this.state && this.state.status || {}),
//       };
//     },
//   },
//   methods: {
//     handleRemoteControlCommand(cmd: string) {
//       console.log(cmd);
//       switch (cmd) {
//         case 'connect':
//           this.sendCommand(0x0001);
//           break;
//         case 'takeoff':
//           this.sendCommand(0x0054);
//           break;
//         case 'land':
//           this.sendCommand(0x0055);
//           break;
//         default:
//           throw new Error(`Unknown command sent by the RC component: ${cmd}`);
//       }
//     },
//     sendCommand(command: number, data: any = null) {
//       if (!this.stateConnected) return;

//       this.stateSocket!.send(JSON.stringify({
//         command,
//         data,
//       }));
//     },
//     sendRc(rc: RemoteControl) {
//       if (!this.rcConnected) return;

//       this.rcSocket!.send(JSON.stringify(rc));
//     },
//     connectState() {
//       const stateSocket = (!this.stateSocket || this.stateSocket!.readyState !== WebSocket.OPEN && this.stateSocket.readyState !== WebSocket.CONNECTING)
//         ? new WebSocket(`wss://${window.location.host}/state`)
//         : this.stateSocket;
//       const { readyState } = stateSocket;
//       this.stateConnected = readyState === WebSocket.OPEN;
//       stateSocket.onopen = () => this.stateConnected = true;
//       stateSocket.onerror = errorEvent => {
//         console.error('state socket error', errorEvent);
//         this.stateConnected = false;
//       };
//       stateSocket.onclose = () => this.stateConnected = false;
//       stateSocket.onmessage = e => this.state = JSON.parse(e.data);
//       this.stateSocket = stateSocket;
//     },
//     connectRemoteControl() {
//       const rcSocket = (!this.rcSocket || this.rcSocket!.readyState !== WebSocket.OPEN && this.rcSocket.readyState !== WebSocket.CONNECTING)
//         ? new WebSocket(`wss://${window.location.host}/rc`)
//         : this.rcSocket;
//       const { readyState } = rcSocket;
//       this.rcConnected = readyState === WebSocket.OPEN;
//       rcSocket.onopen = () => this.rcConnected = true;
//       rcSocket.onerror = errorEvent => {
//         console.error('rc socket error', errorEvent);
//         this.rcConnected = false;
//       };
//       rcSocket.onclose = () => this.rcConnected = false;
//       this.rcSocket = rcSocket;
//     },
//     connectVideo() {
//       const videoSocket = (!this.videoSocket || this.videoSocket!.readyState !== WebSocket.OPEN && this.videoSocket.readyState !== WebSocket.CONNECTING)
//         ? new WebSocket(`wss://${window.location.host}/video`)
//         : this.videoSocket;
//       const { readyState } = videoSocket;
//       this.videoConnected = readyState === WebSocket.OPEN;
//       videoSocket.onopen = () => this.videoConnected = true;
//       videoSocket.onerror = errorEvent => {
//         console.error('video socket error', errorEvent);
//         this.videoConnected = false;
//       };
//       videoSocket.onclose = () => {
//         this.videoConnected = false;
//       };
//       videoSocket.onmessage = e => this.player.decode(e.data, { startProcessing: performance.now() });
//       this.videoSocket = videoSocket;
//     },
//   },
// });
