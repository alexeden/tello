// tslint:disable no-invalid-this
import Vue from 'vue';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Subscription, pipe } from 'rxjs';
import { } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';


const template = `
<div>
  <h1>Hello, Tello</h1>
  <p v-if="stateSocket.isStopped">Socket is stopped</p>
  <pre>{{ state }}</pre>
</div>
`;

new Vue({
  el: '#app',
  template,
  data() {
    return {
      state: null as null | any,
      stateSocket: new WebSocketSubject(`wss://${window.location.host}/state`),
      videoSocket: new WebSocketSubject(`wss://${window.location.host}/video`),
      subscription: null as null | Subscription,
    };
  },
  mounted() {
    (window as any).app = this;
    this.subscription = this.stateSocket.asObservable()
      .pipe(retryBackoff({ initialInterval: 1000 }))
      .subscribe(
        msg => {
          this.state = msg;
        },
        error => {
          console.error(error);
        }
      );
  },
});
