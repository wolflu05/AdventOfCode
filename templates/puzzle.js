import chalk from 'chalk';
import { textToArray } from '../util/util.js';

const part1 = (list) => {
  console.log(list);

  // start here ...

  return { result: 0, text: `puzzle 1` };
};

const part2 = (list) => {
  return { result: 0, text: `puzzle 2` };
};

export default async ({ input }) => {
  let list = textToArray(input);

  return {
    part1: async () => part1(list),
    part2: async () => part2(list),
  };
};
