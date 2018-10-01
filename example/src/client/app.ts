// tslint:disable no-invalid-this
import Vue from 'vue';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Subscription, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';


const template = `
<div>
  <h1>Hello, Tello</h1>
  <p v-if="stateSocket.isStopped">Socket is stopped</p>
  <pre>{{ videoFrame }}</pre>
  <pre>{{ state }}</pre>
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
      videoSocket: new WebSocketSubject({
        url: `wss://${window.location.host}/video`,
        // binaryType: 'arraybuffer',
      }),
      subscriptions: [] as Subscription[],
    };
  },
  mounted() {
    (window as any).app = this;
    const stateSubscription = this.stateSocket.asObservable()
      .pipe(retryBackoff({ initialInterval: 1000 }))
      .subscribe(
        msg => {
          this.state = msg;
        },
        error => {
          console.error(error);
        }
      );

    const videoSubscription = this.videoSocket
      .pipe(retryBackoff({ initialInterval: 1000 }))
      .subscribe(
        msg => {
          console.log('got frame');
          this.videoFrame++;
          // this.state = msg;
        },
        error => {
          console.error(error);
        }
      );

    this.subscriptions.push(stateSubscription);
    this.subscriptions.push(videoSubscription);
  },
});
