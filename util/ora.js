import ora from 'ora';
import chalk from 'chalk';
import { performance } from "perf_hooks";
import { round } from './util.js';

export const oraPromise = (text, promise, resolveFunction, args, discard = false) => {
  const startTime = performance.now();

  const spinner = ora(text).start();

  return promise(args)
    .then((res) => {
      const t = round(performance.now() - startTime, 3);
      if (discard) {
        spinner.stop();
      } else {
        spinner.succeed(`${resolveFunction(res)} (${chalk.magenta(t + 'ms')})`);
      }
      return res;
    })
    .catch((e) => {
      const t = round(performance.now() - startTime, 3);
      spinner.fail(chalk.red(`${e.toString()} (failed after ${t + 'ms'})`));
      throw e;
    });
};
