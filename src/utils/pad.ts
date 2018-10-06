import { repeat, curry } from 'ramda';

export const pad = curry<number, 'left' | 'right', string | number, any, string>(
  (w, align: 'left' | 'right', char: string | number, value?: any) => {
    const buffer = repeat(`${char}`, 10).join('');
    return align === 'left'
      ? `${value}`.concat(buffer).slice(0, w)
      : buffer.concat(`${value}`).slice(-w);
  }
);
