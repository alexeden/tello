import { pad } from './pad';

const twoDigits = pad(2, 'right', 0);

export const createTimestamp = () => {
  const d = new Date();
  return [
    [d.getFullYear(), twoDigits(d.getMonth() + 1), twoDigits(d.getDate())].join('-'),
    [twoDigits(d.getHours()), twoDigits(d.getMinutes()), twoDigits(d.getSeconds()), twoDigits(d.getMilliseconds())].join('-'),
  ].join('.');
};
