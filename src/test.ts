import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import {
  map,
  take,
  tap,
  filter,
} from 'rxjs/operators';
import {
  repeat,
} from 'ramda';
import { Tello } from './tello';
import { TelloPacketGenerator, TelloPacket, Packet, Command } from './protocol';


const leftpad = (value: any, char: string | number = 0, w = 2) => repeat(char, 10).join('').concat(value).slice(-w);

const createTimestamp = () => {
  const d = new Date();
  return [
    [d.getFullYear(), leftpad(d.getMonth() + 1), leftpad(d.getDate())].join('-'),
    [leftpad(d.getHours()), leftpad(d.getMinutes()), leftpad(d.getSeconds())].join('-'),
  ].join('.');
};

(async () => {
  const drone = new Tello();
  // const h264encoder = spawn(
  //   'ffmpeg',
  //   [
  //     '-fflags', 'nobuffer',
  //     '-f', 'h264',
  //     '-i', '-',
  //     '-r', '30',
  //     '-c:v', 'libx264',
  //     '-b:v', '3M',
  //     '-preset', 'ultrafast',
  //     '-tune', 'zerolatency',
  //     '-vsync', '0',
  //     '-async', '1',
  //     '-bsf:v', 'h264_mp4toannexb',
  //     '-x264-params', 'keyint=15:scenecut=0',
  //     '-movflags', 'frag_keyframe+empty_moov',
  //     '-an',
  //     '-f', 'h264',
  //     '-',
  //   ]
  // );

  // drone.videoStream.subscribe(videoChunk =>  h264encoder.stdin.write(videoChunk));


  // h264encoder.stdout.on('error', error => {
  //   console.log('h264encoder stdout error: ', error);
  // });

  // h264encoder.stderr.on('data', data => {
  //   console.log('h264encoder stderr data: ', data.toString());
  // });

  // console.log(TelloPacket.toBuffer(drone.generator.logHeader(Buffer.of(0xff))));

  await drone.start();

  await drone.takeoff();
  // await drone.land();

  setTimeout(() => drone.land(), 7000);
})();

// (async () => {
//   const drone = new Tello();

//   const mediaPath = path.resolve(__dirname, '..', 'media');
//   const videoPath = path.join(mediaPath, `video.${createTimestamp()}.h264`);
//   const videoRecording = fs.createWriteStream(videoPath);
//   fs.symlinkSync(videoPath, path.join(mediaPath, 'latest'));

//   // drone.videoStream.subscribe(videoRecording.write.bind(videoRecording));

//   drone.flightStatus.pipe(tag('flight status', true)).subscribe();

//   drone.start();
// })();

// (async () => {
//   const drone = new Tello();
//   const rawCommandPath = path.join(path.resolve(__dirname, '..', 'media'), `commands.${createTimestamp()}.txt`);
//   const rawCommandOutput = fs.createWriteStream(rawCommandPath);
//   drone.rawCommandStream.pipe(
//     filter(TelloPacket.bufferIsPacket),
//     map((buf, i) => {
//       const packet = TelloPacket.fromBuffer(buf);
//       const bufString = [...buf].map(val => `0x${leftpad(val.toString(16))}`).join(', ');
//       const index = leftpad(i, ' ', 6);
//       const commandId = leftpad(`"${packet.command}"`, ' ', 6);
//       const bufLength = leftpad(`(${buf.length})`, ' ', 8);
//       return `${index} ${commandId} ${bufLength}:\t [${bufString}]\n`;
//     })
//   )
//   .subscribe(rawCommandOutput.write.bind(rawCommandOutput));
//   drone.start();
// })();

/**
 * Use the below code for printing raw buffer data from the command stream to a semi-readable text file
 * (handy for command data analysis and verifying responses from the drone)
 * (async () => {
 *   const drone = new Tello();
 *   const rawCommandPath = path.join(path.resolve(__dirname, '..', 'media'), `commands.${createTimestamp()}.txt`);
 *   const rawCommandOutput = fs.createWriteStream(rawCommandPath);
 *   drone.rawCommandStream.pipe(
 *     filter(TelloPacket.bufferIsPacket),
 *     map((buf, i) => {
 *       const packet = TelloPacket.fromBuffer(buf);
 *       const bufString = [...buf].map(val => `0x${leftpad(val.toString(16))}`).join(', ');
 *       const index = leftpad(i, ' ', 6);
 *       const commandId = leftpad(`"${packet.command}"`, ' ', 6);
 *       const bufLength = leftpad(`(${buf.length})`, ' ', 8);
 *       return `${index} ${commandId} ${bufLength}:\t [${bufString}]\n`;
 *     })
 *   )
 *   .subscribe(rawCommandOutput.write.bind(rawCommandOutput));
 *   drone.start();
 * })();
 */

/**
 * Use the below code for printing raw video buffer data to a semi-readable text file
 * (handy for frame analysis and understanding the video data patterns)
 * (async () => {
 *   const drone = new Tello();
 *   const rawVideoPath = path.join(path.resolve(__dirname, '..', 'media'), `raw.${createTimestamp()}.txt`);
 *   const rawVideoOutput = fs.createWriteStream(rawVideoPath);
 *   drone.rawVideoStream.pipe(
 *     map((frame, i) => {
 *       const frameString = [...frame].slice(0, 20).map(val => `0x${leftpad(val.toString(16))}`).join(', ');
 *       return `${leftpad(i, ' ', 6)} (${leftpad(frame.length, ' ', 6)}):\t [${frameString}]\n`;
 *     })
 *   )
 *   .subscribe(rawVideoOutput.write.bind(rawVideoOutput));
 *   drone.start();
 * })();
 */
