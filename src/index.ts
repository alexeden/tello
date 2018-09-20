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
} from './constants';
import { tag } from './tag.operator';
import { UdpSubject } from './udp-subject';
import { TelloUtils } from './utils';
import { TelloPacket, PacketType, Command } from './lib';

(async () => {

  const pkt = TelloPacket.of({ type: PacketType.Set, command: Command.DoTakeoff, sequence: 484 });
  const buf = TelloPacket.toBuffer(pkt);
  console.log(buf);
  // const commandSocket = UdpSubject.create(TelloCommandClient).setTarget(TelloCommandServer).bind();
  // const stateSocket = UdpSubject.create(TelloStateClient);
  // const videoSocket = UdpSubject.create(TelloVideoClient).bind();

  // commandSocket.next(TelloControlCommands.Start());
  // commandSocket.next(TelloControlCommands.VideoOff());
  // commandSocket.next(TelloControlCommands.VideoOn());

  // videoSocket.pipe(
  //   take(100),
  //   map(buffer => {
  //     return buffer.slice(2);
  //   }),
  //   tag('video message length')
  // ).subscribe();

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
