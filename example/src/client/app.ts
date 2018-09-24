// tslint:disable no-invalid-this
import Vue from 'vue';
import { WebSocketSubject } from 'rxjs/webSocket';
// import { Prop } from 'vue/types/options';
import { Subscription, pipe } from 'rxjs';
import { } from 'rxjs/operators';
import { retryBackoff } from 'backoff-rxjs';


// const Dashboard = Vue.extend({
//   name: 'dashboard',
//   template: `
//     <h1>APP</h1>
//   `,

// });

const template = `
<div>
  <h1>Hello, Tello</h1>
  <p v-if="socket.isStopped">Socket is stopped</p>
  <pre>{{ latest }}</pre>
</div>
`;

new Vue({
  el: '#app',
  template,
  data() {
    return {
      latest: null as null | any,
      socket: new WebSocketSubject(`wss://${window.location.host}`),
      subscription: null as null | Subscription,
    };
  },
  mounted() {
    (window as any).app = this;
    console.log('mounted');
    this.subscription = this.socket.asObservable().pipe(
      retryBackoff({
        initialInterval: 1000,
      })
    ).subscribe(
      msg => {
        this.latest = msg;
      },
      error => {
        console.error(error);
        // setTimeout(() => window.location.reload(), 1000);
      }
    );
  },
});
