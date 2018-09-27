import * as fs from 'fs';
import * as path from 'path';
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
import { tag } from './utils';
import { TelloPacket } from './protocol';

const leftpad = (value: any, char: string | number = 0, w = 2) => repeat(char, 10).join('').concat(value).slice(-w);

const createTimestamp = () => {
  const d = new Date();
  return [
    [d.getFullYear(), leftpad(d.getMonth()), leftpad(d.getDate())].join('-'),
    [leftpad(d.getHours()), leftpad(d.getMinutes()), leftpad(d.getSeconds())].join('-'),
  ].join('.');
};

(async () => {
  const drone = new Tello();

  // const mediaPath = path.resolve(__dirname, '..', 'media');
  // const videoPath = path.join(mediaPath, `video.${createTimestamp()}.h264`);
  // const videoRecording = fs.createWriteStream(videoPath);
  // fs.symlinkSync(videoPath, path.join(mediaPath, 'latest'));

  // drone.videoStream.subscribe(videoRecording.write.bind(videoRecording));

  drone.flightStatus.pipe(tag('flight status', true)).subscribe();

  drone.start();
})();

/**
 * Use the below code for printing raw buffer data to a semi-readable text file
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
