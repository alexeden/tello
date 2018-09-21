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
  TelloPacket, Type, Command, GetCommand, DataTwoCommand, Packet, DataOneCommand,

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
    command: DataTwoCommand.QueryVideoSpsPps,
    type: Type.DataTwo,
  });
};

let seq = 0;

const setDateTimePacket = (): Packet => {

  const buf = Buffer.alloc(15);
  const now = new Date();
  buf.writeUInt8(0x00, 0);
  buf.writeUInt16LE(now.getFullYear(), 1);
  buf.writeUInt16LE(now.getMonth(), 3);
  buf.writeUInt16LE(now.getDay(), 5);
  buf.writeUInt16LE(now.getHours(), 7);
  buf.writeUInt16LE(now.getMinutes(), 9);
  buf.writeUInt16LE(now.getSeconds(), 11);
  buf.writeUInt16LE(now.getMilliseconds() * 1000 & 0xffff, 13);

  return TelloPacket.of({
    command: DataOneCommand.SetDateTime,
    type: Type.DataOne,
    payload: buf,
    sequence: seq++,
  });
};

const stickPacket = (): Packet => {
  const payload = Buffer.allocUnsafe(11);
  let packedAxes = 1024 & 0x07ff;
  packedAxes |= 1024 & 0x07ff << 11;
  packedAxes |= 1024 & 0x07ff << 22;
  packedAxes |= 1024 & 0x07ff << 33;
  payload[0] = packedAxes;
  payload[1] = packedAxes >> 8;
  payload[2] = packedAxes >> 16;
  payload[3] = packedAxes >> 24;
  payload[4] = packedAxes >> 32;
  payload[5] = packedAxes >> 40;
  const now = new Date();
  payload[6] = now.getHours();
  payload[7] = now.getMinutes();
  payload[8] = now.getSeconds();
  const ms = now.getMilliseconds();
  payload[9] = ms & 0xff;
  payload[10] = ms >> 8;

  return TelloPacket.of({
    type: Type.DataTwo,
    command: DataTwoCommand.SetStick,
    sequence: 0,
    payload,
  });
};

const seenCommands = new Set();

(async () => {

  // const pkt = TelloPacket.of({ type: Type.Set, command: Command.DoConnect, sequence: 0 });
  // console.log('original: ', JSON.stringify(pkt, null, 4));
  // const buf = TelloPacket.toBuffer(pkt);
  // console.log('buffer: ', buf);
  // const parsed = TelloPacket.fromBuffer(buf);
  // console.log('parsed: ', JSON.stringify(parsed, null, 4));
  const commandSocket = UdpSubject.create(TelloCommandClient).setTarget(TelloCommandServer).bind();
  // // const stateSocket = UdpSubject.create(TelloStateClient);
  // const videoSocket = UdpSubject.create(TelloVideoClient).bind();

  commandSocket.pipe(
    // map(msg => msg.toString()),
    map(TelloPacket.fromBuffer),
    map(packet => {
      // packet.payload = packet.payload.toString();
      seenCommands.add(packet.command.toString(16));
      return seenCommands;
    })
    // filter(({ command }) => command === DataTwoCommand.QueryVideoSpsPps),
    // tag('Command response')
    // tap(response => {
    //   console.log(response);
    //   // const color = chalk[response.includes('unknown') ? 'redBright' : 'greenBright'];
    //   // console.log(`\n${color(response)}`);
    //   // ui.prompt();
    // })
  ).subscribe();

  // videoSocket.pipe(
  //   // take(100),
  //   // map(buffer => {
  //   //   return buffer.slice(2);
  //   // }),
  //   tag('video message length')
  // ).subscribe();

  commandSocket.next(connectRequest());

  const stickPkt = TelloPacket.toBuffer(stickPacket());
  const keyframePkt = TelloPacket.toBuffer(keyframeRequestPacket());
  // const keyframePkt = TelloPacket.toBuffer(keyframeRequestPacket());

  setInterval(() => commandSocket.next(TelloPacket.toBuffer(setDateTimePacket())), 500);
  setInterval(() => commandSocket.next(stickPkt), 200);
  setInterval(() => commandSocket.next(keyframePkt), 1000);
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
