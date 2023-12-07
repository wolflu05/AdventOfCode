import { textToArray, readInput } from '../lib/utils.js';

const list = textToArray(readInput());

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

console.log(solve(list) || "-") // don't error if run with second example input
console.log(solve(list, true))
