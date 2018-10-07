import { spawn, ChildProcess } from 'child_process';
import { Subject } from 'rxjs';

export class VideoUtils {
  static spawnEncoder(): ChildProcess {
    return spawn(
      'ffmpeg',
      [
        // Input options
        '-fflags', 'nobuffer',
        '-f', 'h264',
        '-i', '-',
        // Output options
        '-f', 'h264',
        '-dn', // disable data recording
        '-an', // disable audio recording
        '-sn', // disable subtitle recording
        '-r', '25', // Set frame rate; duplicate or drop input frames to achieve constant output frame rate
        '-vsync', 'drop', // video sync method (maybe try "drop")
        '-bsf:v', 'h264_mp4toannexb',
        '-fflags', 'flush_packets',
        // Encoder-specific options
        '-codec:v', 'libx264',
        // '-threads', '4',
        // '-thread_type', 'frame',
        '-preset', 'ultrafast',
        '-b:v', '3M',
        '-tune', 'zerolatency',
        '-x264-params', 'keyint=15',
        '-movflags', 'frag_keyframe+empty_moov',
        '-',
      ]
    );
  }

  static h264EncoderObservable(h264encoder: ChildProcess) {
    const h264NalUnit = Buffer.from([0, 0, 0, 1]);
    let h264chunks: Buffer[] = [];
    const outgoingSubject = new Subject<string>();
    h264encoder.stdout.on('data', (data: Buffer) => {
      const idx = data.indexOf(h264NalUnit);
      if (idx > -1 && h264chunks.length > 0) {
        h264chunks.push(data.slice(0, idx));
        outgoingSubject.next(Buffer.concat(h264chunks).toString('binary'));
        h264chunks = [];
        h264chunks.push(data.slice(idx));
      }
      else {
        h264chunks.push(data);
      }
    });

    h264encoder.stdout.on('error', err => outgoingSubject.error(err));
    h264encoder.stdout.on('close', () => outgoingSubject.complete());

    return outgoingSubject.asObservable();
  }
}
