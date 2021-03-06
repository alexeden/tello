import { H264Decoder } from './h264';

if (typeof window === 'undefined') {
  (async () => {
    let decoderIsReady = false;

    const decoder = new H264Decoder({
      decodedImageListener: (buffer, width, height, infos) => {
        // buffer needs to be copied because we give up ownership
        const copyU8 = new Uint8Array(buffer.length);
        copyU8.set(buffer, 0);
        const message = {
          buf: copyU8.buffer,
          length: buffer.length,
          width,
          height,
          infos,
        };
        postMessage(message, [copyU8.buffer as any]); // 2nd parameter is used to indicate transfer of ownership
      },
    });


    self.addEventListener('message', e => {
      if (e.data && e.data.type === 'Broadway.js - Worker init') {
        decoderIsReady = true;
        postMessage({ consoleLog: 'broadway worker initialized' });
      }
      else if (decoderIsReady && e.data.buf) {
        decoder.decode(
          new Uint8Array(e.data.buf, e.data.offset || 0, e.data.length),
          e.data.info
        );
      }
      else {
        console.log('not sure what to do with this message event: ', e);
      }
    });

    await decoder.start();

  })();
}
else {
  console.log('NOT RUNNING, NOT A WORKER');
}
