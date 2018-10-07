import { spawn } from 'child_process';

export class VideoUtils {
  static spawnEncoder() {
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
}
