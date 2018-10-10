import { Tello } from './tello';

(async () => {
  const drone = new Tello();
  await drone.start();

  await drone.takeoff();
  setTimeout(() => drone.land(), 6000);
})();

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
