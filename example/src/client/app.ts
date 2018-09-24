// tslint:disable no-invalid-this
import Vue from 'vue';
import { WebSocketSubject } from 'rxjs/webSocket';
// import { Prop } from 'vue/types/options';
import { Subscription } from 'rxjs';


// const Dashboard = Vue.extend({
//   name: 'dashboard',
//   template: `
//     <h1>APP</h1>
//   `,

// });

const template = `
<div>
  <h1>Hello, Tello</h1>
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
    console.log('mounted');
    this.subscription = this.socket.asObservable().subscribe(
      msg => {
        this.latest = msg;
      }
    );
  },
});
