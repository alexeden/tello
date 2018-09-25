import { Tello } from './tello';

(async () => {
  const drone = new Tello();
  await drone.start();

})();
