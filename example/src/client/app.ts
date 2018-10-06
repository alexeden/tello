// tslint:disable no-invalid-this
import Vue from 'vue';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Subscription, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';
import { Player } from './player';

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
<div>
  <h1>Hello, Tello</h1>
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
      state: null as null | any,
      videoFrame: 0,
      stateSocket: new WebSocketSubject(`wss://${window.location.host}/state`),
      videoSocket: new WebSocketSubject<string>(`wss://${window.location.host}/video`),
      subscriptions: [] as Subscription[],
      player: new Player({
        size: { width: 1280, height: 720 },
        statsListener: stats => (window as any).stats = stats,
      }),
    };
  },
  mounted() {
    (window as any).app = this;
    const videoWrapper = this.$refs.videoWrapper as HTMLDivElement;
    videoWrapper.appendChild(this.player.canvas);

    const videoSubscription = this.videoSocket.asObservable()
      .pipe(retryBackoff({ initialInterval: 1000 }))
      .subscribe(
        data => this.player.decode(data, { startProcessing: performance.now() }),
        err => console.error('Video stream error: ', err)
      );

    const stateSubscription = this.stateSocket.asObservable()
      .pipe(retryBackoff({ initialInterval: 1000 }))
      .subscribe(
        msg => {
          this.state = msg;
        },
        error => console.error('State stream error: ', error)
      );


    this.subscriptions.push(stateSubscription);
    this.subscriptions.push(videoSubscription);
  },
});
