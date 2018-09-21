import chalk from 'chalk';
import { Observable, Subscriber } from 'rxjs';

export const tag = (tagText: string, stringify = false) => {
  return <T>(source: Observable<T>) =>
    new Observable((observer: Subscriber<T>) => {
      let count = 0;
      return source.subscribe({
        next(x) {
          console.log(chalk.cyan(`${tagText} #${++count} `), stringify ? JSON.stringify(x, null, 2) : x);
          observer.next(x);
        },
        error(err) {
          console.log(chalk.redBright(`${tagText} error after #${count} emissions `), err);
          observer.error(err);
        },
        complete() {
          console.log(chalk.greenBright(`${tagText} completed after #${count} emissions`));
          observer.complete();
        },
      });
    });
};
