// tslint:disable no-invalid-this
import Vue from 'vue';
// import { WebSocketSubject } from 'rxjs/webSocket';
import { Subscription, pipe } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { retryBackoff } from 'backoff-rxjs';
import { Player } from './player';

const template = `
<div class="column gap-10">
  <h1>Hello, Tello</h1>
  <div class="column gap-10">
    <div class="row align-center gap-10">
      <p>Video Socket</p>
      <span class="text-green" v-if="videoConnected">Connected</span>
      <span class="text-red" v-else>Disconnected</span>
      <button
        v-if="!videoConnected" @click="connectVideo"
        class="bg-green hover:bg-green-dark text-white font-bold py-2 px-4 rounded">
        Reconnect
      </button>
    </div>

    <div class="row align-center gap-10">
      <p>State Socket</p>
      <span class="text-green" v-if="stateConnected">Connected</span>
      <span class="text-red" v-else>Disconnected</span>
      <button
        v-if="!stateConnected" @click="connectState"
        class="bg-green hover:bg-green-dark text-white font-bold py-2 px-4 rounded">
        Reconnect
      </button>
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
    (window as any).app = this;
    // this.connectVideo();
  },
  mounted() {
    const videoWrapper = this.$refs.videoWrapper as HTMLDivElement;
    videoWrapper.appendChild(this.player.canvas);
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
      stateSocket.onmessage = e => this.state = e.data;
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
