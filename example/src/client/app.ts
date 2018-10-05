import { Player } from './player';

const h264Player = new Player({
  size: { width: 1280, height: 720 },
  statsListener: stats => (window as any).stats = stats,
});

document.getElementById('videoFeed')!.appendChild(h264Player.canvas);

try {
  const videoSocket = new WebSocket(`wss://${window.location.host}/video`);
  videoSocket.onerror = () => videoSocket.close();
  videoSocket.onmessage = e =>
    e.data !== 'false'
      ? h264Player.decode(e.data, { startProcessing: performance.now() })
      : console.log(e);
}
catch (e) {
  console.log('video socket error: ', e);
}
// // tslint:disable no-invalid-this
// import Vue from 'vue';
// import { WebSocketSubject } from 'rxjs/webSocket';
// import { Subscription, pipe } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { retryBackoff } from 'backoff-rxjs';
// import * as muxjs from 'mux.js';

// (window as any).muxjs = muxjs;

// const template = `
// <div>
//   <h1>Hello, Tello</h1>
//   <p v-if="stateSocket.isStopped">Socket is stopped</p>
//   <pre>{{ videoFrame }}</pre>
//   <pre>{{ state }}</pre>
//   <video ref="video" id="video" autoplay height="400" width="600" style="object-fit: contain; border: 1px solid black"></video>
// </div>
// `;

// new Vue({
//   el: '#app',
//   template,
//   data() {
//     return {
//       state: null as null | any,
//       videoFrame: 0,
//       stateSocket: new WebSocketSubject(`wss://${window.location.host}/state`),
//       videoStream: new WebSocket(`wss://${window.location.host}/video`),
//       mediaSource: new MediaSource(),
//       subscriptions: [] as Subscription[],
//     };
//   },
//   beforeMount() {
//     this.videoStream.binaryType = 'arraybuffer';
//   },
//   mounted() {
//     const video = this.$refs.video as HTMLVideoElement;
//     video.src = URL.createObjectURL(this.mediaSource);
//     const transmuxer = new muxjs.mp4.Transmuxer({});
//     this.mediaSource.addEventListener('sourceopen', _ => {

//       const srcBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
//       this.videoStream.binaryType = 'arraybuffer';

//       this.videoStream.onopen = ev => {
//         console.log('video stream opened');
//       };
//       this.videoStream.onerror = ev => {
//         console.log('video stream error', ev);
//       };

//       transmuxer.on('data', segment => {
//         console.log('got data!');
//         srcBuffer.appendBuffer(segment.data.buffer);
//       });
//       this.videoStream.onmessage = ev => {
//         (window as any).data = ev.data;
//         // const bytes = Uint8Array.from(ev.data);
//         const raw = ev.data;
//         const rawLength = raw.length;
//         const bytes = new Uint8Array(new ArrayBuffer(rawLength));
//         let i;
//         for (i = 0; i < rawLength; i++) {
//           bytes[i] = raw.charCodeAt(i);
//         }

//         transmuxer.push(Uint8Array.from(ev.data));
//         // console.log(muxjs.mp4.tools.textify(parsed));
//         // srcBuffer.addEventListener('updateend', () => {
//         //   this.mediaSource.endOfStream();
//         //   video.play();
//         //   console.log(this.mediaSource.readyState); // ended
//         // });
//         // if (!srcBuffer.updating) {
//         //   this.videoFrame++;
//         //   srcBuffer.appendBuffer(bytes);
//         //   video.play();
//         // }

//       };
//       this.videoStream.onclose = ev => {
//         console.log('video stream closed');
//       };
//     });


//     (window as any).app = this;
//     const stateSubscription = this.stateSocket.asObservable()
//       .pipe(retryBackoff({ initialInterval: 1000 }))
//       .subscribe(
//         msg => {
//           this.state = msg;
//         },
//         error => {
//           console.error(error);
//         }
//       );

//     // const videoSubscription = this.videoSocket
//     //   .pipe(retryBackoff({ initialInterval: 1000 }))
//     //   .subscribe(
//     //     msg => {
//     //       console.log('got frame');
//     //       this.videoFrame++;
//     //       // this.state = msg;
//     //     },
//     //     error => {
//     //       console.error(error);
//     //     }
//     //   );

//     this.subscriptions.push(stateSubscription);
//     // this.subscriptions.push(videoSubscription);
//   },
// });
