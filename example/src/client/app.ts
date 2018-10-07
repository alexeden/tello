// tslint:disable no-invalid-this
import Vue from 'vue';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Subscription, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';
import { Player } from './player';
import { error } from 'util';

// const h264Player = new Player({
//   size: { width: 1280, height: 720 },
//   statsListener: stats => (window as any).stats = stats,
// });

// document.getElementById('videoFeed')!.appendChild(h264Player.canvas);

// try {
//   const videoSocket = new WebSocket(`wss://${window.location.host}/video`);
//   videoSocket.onerror = () => videoSocket.close();
//   videoSocket.onmessage = e =>
//     e.data !== 'false'
//       ? h264Player.decode(e.data, { startProcessing: performance.now() })
//       : console.log(e);
// }
// catch (e) {
//   console.log('video socket error: ', e);
// }


const template = `
<div class="column gap-10">
  <h1>Hello, Tello</h1>
  <div class="column">
    <div class="row align-center gap-10">
      <p>Video Socket</p>
      <span class="c-green" v-if="videoConnected">Connected</span>
      <span class="c-alternate" v-else>Disconnected</span>
      <button v-if="!videoConnected" @click="connectVideo">Reconnect</button>
    </div>
    <div class="row align-center gap-10">
      <p>State Socket</p>
      <span class="c-green" v-if="stateConnected">Connected</span>
      <span class="c-alternate" v-else>Disconnected</span>
      <button v-if="!stateConnected" @click="connectState">Reconnect</button>
    </div>
  </div>
  <p v-if="stateSocket.isStopped">Socket is stopped</p>
  <pre>{{ state }}</pre>
  <div ref="videoWrapper"></div>
</div>
`;

new Vue({
  el: '#app',
  template,
  data() {
    return {
      player: new Player({ size: { width: 1280, height: 720 }}),
      state: null as null | any,
      stateSocket: new WebSocket(`wss://${window.location.host}/state`),
      videoSocket: new WebSocket(`wss://${window.location.host}/video`),
      stateConnected: false,
      videoConnected: false,
      subscriptions: [] as Subscription[],
    };
  },
  created() {
    // this.connectVideo();
  },
  mounted() {
    (window as any).app = this;
    const videoWrapper = this.$refs.videoWrapper as HTMLDivElement;
    videoWrapper.appendChild(this.player.canvas);
    // this.videoSocket.onerror = () => this.videoSocket.close();
    // this.videoSocket.onmessage = e => this.player.decode(e.data, { startProcessing: performance.now() });

    // const stateSubscription = this.stateSocket.asObservable()
    //   .pipe(retryBackoff({ initialInterval: 1000 }))
    //   .subscribe(
    //     msg => this.state = msg,
    //     error => console.error('State stream error: ', error)
    //   );


    // this.subscriptions.push(stateSubscription);
  },
  beforeDestroy() {
    let sub;
    // tslint:disable-next-line:no-conditional-assignment
    while (sub = this.subscriptions.shift()) {
      sub.unsubscribe();
    }
  },
  methods: {
    connectState() {
      const stateSocket = this.stateSocket.readyState !== WebSocket.OPEN && this.stateSocket.readyState !== WebSocket.CONNECTING
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
      stateSocket.onmessage = e => {
        this.state = e.data;
      };
      this.stateSocket = stateSocket;
    },
    connectVideo() {
      const { readyState } = this.videoSocket;
      const videoSocket = readyState !== WebSocket.OPEN && readyState !== WebSocket.CONNECTING
        ? new WebSocket(`wss://${window.location.host}/video`)
        : this.videoSocket;
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
  watch: {
    ['videoSocket'](is, was) {
      console.log(`videoSocket.readyState changed from ${was} to ${is}`);
    },
  },
});
