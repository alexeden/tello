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
import { broadcast } from './server';
import {
  map,
  take,
  tap,
  filter,
} from 'rxjs/operators';
import {
  TelloCommandClient,
  TelloCommandServer,
  TelloStateClient,
  TelloVideoClient,
  TelloPacket, Type, Command, Packet,
  UdpSubject, tag,
} from '../../dist';


(async () => {


})();
