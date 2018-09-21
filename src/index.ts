/**
 * Try this for getting codec info
 * ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 udp://0.0.0.0:11111
 *
 * ffprobe output:
 * Stream #0:0: Video: h264 (Main), yuv420p(progressive), 960x720, 25 fps, 25 tbr, 1200k tbn, 50 tbc
 */
// ffmpeg -i udp://0.0.0.0:11111 -f sdl "window title"
// import * as readline from 'readline';
import chalk from 'chalk';
import { fromEvent } from 'rxjs';
import {
  map,
  take,
  tap,
  filter,
} from 'rxjs/operators';
import {
  TelloControlCommands,
  TelloCommandClient,
  TelloCommandServer,
  TelloStateClient,
  TelloVideoClient,
  TelloReadCommands,
  TelloPacket, Type, Command,

} from './lib';
import { UdpSubject, tag } from './utils';


const connectRequest = () => {
  const connect = Buffer.from('conn_req:lh');
  connect[9] = TelloVideoClient.port & 0xff;
  connect[10] = TelloVideoClient.port >> 8;
  return connect;
};
const keyframeRequestPacket = () => {
  return TelloPacket.of({
    command: Command.QueryVideoSPSPPS,
    type: Type.Data2,
  });
};


(async () => {

  const pkt = TelloPacket.of({ type: Type.Set, command: Command.DoConnect, sequence: 0 });
  console.log('original: ', JSON.stringify(pkt, null, 4));
  const buf = TelloPacket.toBuffer(pkt);
  console.log('buffer: ', buf);
  const parsed = TelloPacket.fromBuffer(buf);
  console.log('parsed: ', JSON.stringify(parsed, null, 4));
  // const commandSocket = UdpSubject.create(TelloCommandClient).setTarget(TelloCommandServer).bind();
  // // const stateSocket = UdpSubject.create(TelloStateClient);
  // const videoSocket = UdpSubject.create(TelloVideoClient).bind();

  // commandSocket.pipe(
  //   // map(msg => msg.toString()),
  //   map(TelloPacket.fromBuffer),
  //   map((packet: any) => {
  //     packet.payload = packet.payload.toString();
  //     return packet;
  //   }),
  //   filter(({ command }) => command !== Command.FlightStatus),
  //   tag('Command response', true)
  //   // tap(response => {
  //   //   console.log(response);
  //   //   // const color = chalk[response.includes('unknown') ? 'redBright' : 'greenBright'];
  //   //   // console.log(`\n${color(response)}`);
  //   //   // ui.prompt();
  //   // })
  // ).subscribe();

  // videoSocket.pipe(
  //   // take(100),
  //   // map(buffer => {
  //   //   return buffer.slice(2);
  //   // }),
  //   tag('video message length')
  // ).subscribe();

  // commandSocket.next(TelloPacket.connectRequest());

  // const stickPkt = TelloPacket.toBuffer(TelloPacket.stickPacket());
  // const keyframePkt = TelloPacket.toBuffer(TelloPacket.keyframeRequestPacket());

  // setInterval(() => commandSocket.next(stickPkt), 20);
  // setInterval(() => commandSocket.next(keyframePkt), 1000);
  // commandSocket.next(connect);
  // commandSocket.next(TelloControlCommands.Start());
  // commandSocket.next(TelloControlCommands.VideoOff());
  // commandSocket.next(TelloControlCommands.VideoOn());



  // setInterval(
  //   () => {
  //     console.log(JSON.stringify(commandSocket.state, null, 2));
  //     commandSocket.next(TelloControlCommands.Start());
  //     commandSocket.next(TelloReadCommands.Battery);
  //   },
  //   5000
  // );
  // const ui = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout,
  //   prompt: chalk.gray('📡 Tello> '),
  // });

  // stateSocket.pipe(
  //   map(msg => msg.toString()),
  //   map(TelloUtils.parseState),
  //   tap(response => {
  //     readline.cursorTo(process.stdout, 0, 0);
  //     readline.clearScreenDown(process.stdout);
  //     ui.write(chalk.magentaBright(JSON.stringify(response, null, 2)));
  //     // ui.prompt();
  //   })

  //   // tag('state', true)
  // ).subscribe();

  // commandSocket.pipe(
  //   map(msg => msg.toString()),
  //   // tag('Command response')
  //   tap(response => {
  //     const color = chalk[response.includes('unknown') ? 'redBright' : 'greenBright'];
  //     console.log(`\n${color(response)}`);
  //     ui.prompt();
  //   })
  // ).subscribe();

  // commandSocket.pipe(
  //   map(msg => msg.toString()),
  //   // tag('Command response')
  //   tap(response => {
  //     const color = chalk[response.includes('unknown') ? 'redBright' : 'greenBright'];
  //     console.log(`\n${color(response)}`);
  //     ui.prompt();
  //   })
  // ).subscribe();

  // ui.prompt();

  // fromEvent<string>(ui, 'line').pipe(
  //   map(line => (line || '').trim())
  //   // tag('line')
  // ).subscribe(line => {
  //   if (line.length > 0) {
  //     commandSocket.next(Buffer.from(line));
  //     // filter(line => line.length > 0),
  //   }
  //   else {
  //     ui.prompt();
  //   }
  // });

  // ui.write(`OH HI`);

  // stateSocket.pipe(
  //   map(msg => msg.toString()),
  //   map(TelloUtils.parseState),
  //   tag('state', true)
  // ).subscribe();


})();
