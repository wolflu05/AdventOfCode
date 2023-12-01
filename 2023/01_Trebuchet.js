import chalk from 'chalk';
import { textToArray } from '../util/util.js';

const WORD_NUMS = "one_two_three_four_five_six_seven_eight_nine".split("_");

const solve = (inp, p2 = false) => {
  return inp.map(x => {
    const nums = [];

    for (let i = 0; i < x.length; i++) {
      if (x[i].match(/^\d$/)) {
        nums.push(x[i]);
      }

      if (p2) {
        for (let n = 0; n < WORD_NUMS.length; n++) {
          if (x.startsWith(WORD_NUMS[n], i)) {
            nums.push(`${n + 1}`);
            break;
          }
        }
      }
    }

    return parseInt(nums.at(0) + nums.at(-1));
  }).reduce((a, b) => a + b);
}

const part1 = (list) => {
  const res = solve(list);

  return { result: res, text: `The sum of all the calibrated values is ${chalk.green(res)}.` };
};

const part2 = (list) => {
  const res = solve(list, true);

  return { result: res, text: `The new sum of all the calibrated values is ${chalk.green(res)}.` };
};

export default async ({ input }) => {
  let list = textToArray(input);

  return {
    part1: async () => part1(list),
    part2: async () => part2(list),
  };
};
