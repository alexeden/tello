declare const Player: any;

const h264Player = new Player({
  useWorker : true,
  workerFile : 'Decoder.js',
  webgl: 'auto',
  size: { width: 960, height: 720 },
});

document.getElementById('videoFeed')!.appendChild(h264Player.canvas);

const toUint8Array = str => {
  const array = new Uint8Array(new ArrayBuffer(str.length));
  let i;
  for (i = 0; i < str.length; i++) {
    array[i] = str.charCodeAt(i);
  }
  return array;
};

try {
  const videoSocket = new WebSocket(`wss://${window.location.host}/video`);
  videoSocket.onerror = () => videoSocket.close();
  videoSocket.onmessage = imgString =>
    imgString.data !== 'false'
      ? h264Player.decode(toUint8Array(imgString.data))
      : console.log(imgString);
}
catch (e) {
  console.log('video socket error: ', e);
}
