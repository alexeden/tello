// tslint:disable no-invalid-this
import Vue from 'vue';
import { Subscription, pipe } from 'rxjs';
import { Player } from './player';
import * as template from './app.html';

new Vue({
  el: '#app',
  template,
  data() {
    return {
      player: new Player({ size: { width: 1280, height: 720 }}),
      state: {} as any,
      stateSocket: null as (null | WebSocket),
      videoSocket: null as (null | WebSocket),
      stateConnected: false,
      videoConnected: false,
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
  },
  methods: {
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
