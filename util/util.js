import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import chalk from 'chalk';
import _ from 'lodash';
import { baseUrl, sessionCookie } from './constants.js';

/**
 * Fetch the input from the aoc server
 * @param {Number} year 
 * @param {Number} day 
 * @returns {String} input for the specified year/day 
 */
export const getInput = async (year, day) => {
  const url = `${baseUrl}/${year}/day/${day}/input`;

  return await (
    await fetch(url, {
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    })
  ).text();
};

/**
 * Get the input path for a specified day
 * @param {Number} year 
 * @param {Number} day 
 * @param {Boolean} example 
 * @returns 
 */
export function getInputFilePath(year, day, example) {
  const p = path.resolve('.input', `${year}`);
  const filePath = path.resolve(
    p,
    `${example ? `${day}_example` : day}` + '.txt'
  );
  return filePath;
}

/**
 * Get the input by either fetching them or returning the locally cached copy
 * @param {Number} year 
 * @param {Number} day 
 * @param {Boolean} cache use cache
 * @param {Boolean} check check if this challenge is already available
 * @param {Boolean} example use the _example suffixed input file
 * @returns 
 */
export const fetchInput = async (year, day, cache = true, check = true, example = false) => {
  if (check) {
    const date = new Date(year, 11, day, 5, 0, 0, 0);
    if (date > new Date()) {
      const diff = date - new Date();
      throw new Error(
        `this challenge is not yet available! Starts in ${getTimeString(diff)}h`
      );
    }
  }

  const filePath = getInputFilePath(year, day, example);

  if (cache && fs.existsSync(filePath)) {
    return await fs.promises.readFile(filePath, 'utf-8');
  }

  const input = await getInput(year, day);

  console.log(
    `\n${chalk.green('✔')} Downloaded input file for year ${year}/${day}.`
  );

  if (!fs.existsSync(p)) {
    await fs.promises.mkdir(p, { recursive: true });
  }

  await fs.promises.writeFile(filePath, input);

  return input;
};

/**
 * Format a time in ms to a string hh:mm:ss
 * @param {Number} timeInMs time in ms
 * @param {String} delimiter time separator (default: ":") 
 * @returns {String} hh:mm:ss
 */
export const getTimeString = (timeInMs, delimiter = ':') => {
  let hours = Math.ceil((timeInMs / (1000 * 60 * 60)) % 60);
  let minutes = Math.floor((timeInMs / (1000 * 60)) % 60);
  let seconds = Math.floor((timeInMs / 1000) % 60);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  return [hours, minutes, seconds].join(delimiter);
};

// ---- Parsing

/**
 * Parses a multiline string into an array
 * @param {String} text multiline string
 * @param {Boolean} trim if true, removes any lines that evaluate as falsy (e.g. empty lines)
 * @returns {Array<String>}
 */
export const textToArray = (text, trim = true) =>
  trim ? text.split('\n').filter((x) => x) : text.split('\n');

/**
 * Parses a one line string and separates it by a "," into an array
 * @param {String} list one line string
 * @returns {Array<String>}
 */
export const oneLineToArray = (list) => list.split(',');

/**
 * Converts a list of strings containing numbers to a list of numbers
 * @param {Array<String>} list list with strings 
 * @returns {Array<Number>} list of numbers
 */
export const listToNums = (list) => list.map((x) => +x);

/**
 * Parses a multiline string into an array of numbers
 * @param {String} text multiline string
 * @param {Boolean} trim if true, removes any lines that evaluate as falsy (e.g. empty lines)
 * @returns {Array<Number>}
 */
export const textToNums = (text, trim = true) => listToNums(textToArray(text, trim));

/**
 * Parses a one line string and separates it by a "," into an array of numbers
 * @param {String} text one line string
 * @returns {Array<Number>}
 */
export const oneLineToNums = (text) => listToNums(oneLineToArray(text));

/**
 * Counts the occurrences of c in s
 * @param {String} s string
 * @param {String} c char to count
 * @returns {Number}
 */
export const countChar = (s, c) =>
  s.split('').reduce((acc, ch) => (ch === c ? acc + 1 : acc), 0);

/**
 * Returns a list with every nth element if the source list
 * @template T
 * @param {Array<T>} list 
 * @param {Number} n 
 * @returns {Array<T>}
 */
export const everyNthElement = (list, n) =>
  list.reduce((l, e, i) => {
    if (i % n === 0) l.push(e);
    return l;
  }, []);

/**
 * Returns true if x is between min and max
 * @param {Number} x 
 * @param {Number} min 
 * @param {Number} max 
 * @returns {Boolean}
 */
export const between = (x, min, max) => x >= min && x <= max;

/**
 * Rounds a number x to dp digit points
 * @param {Number} x 
 * @param {Number} dp 
 * @returns {Number}
 */
export const round = (x, dp) =>
  Math.round(x * parseInt('1' + '0'.repeat(dp))) /
  parseInt('1' + '0'.repeat(dp));

/**
 * Fills a string with fill to a defined length.
 * @param {*} string source string
 * @param {*} fill fill char
 * @param {Number} length output length
 * @param {-1 | 1} mode -1: prepend / 1: append 
 * @returns {String}
 */
export const fillString = (string, fill, length, mode = 1) => {
  while (string.length <= length) {
    if (mode === -1) string = fill + string;
    if (mode === 1) string += fill;
  }
  return string;
};

/**
 * Enhanced JS modulo
 * @param {Number} n 
 * @param {Number} m 
 * @returns {Number}
 */
export const mod = (n, m) => ((n % m) + m) % m;

/**
 * Transposes an array [[1,2], [3,4]] => [[1,3], [2,4]]
 * @template T
 * @param {Array<Array<T>>} array 
 * @returns {Array<Array<T>>}
 */
export const transpose = (array) =>
  array[0].map((_, colIndex) => array.map((row) => row[colIndex]));

/**
 * Deepcopies an object
 * @template T
 * @param {T} inObject 
 * @returns {T}
 */
export const deepCopy = (inObject) => {
  return structuredClone(inObject);
};

/**
 * Filters the first list to only contain the elements that are also in all rest sets
 * @template T
 * @param {T[]} first list of elements
 * @param  {...Set<T>} rest list of sets
 * @returns {T[]}
 */
export const intersect = (first = [], ...rest) => {
  const restSets = rest.map((array) => new Set(array));
  return first.filter((e) => restSets.every((set) => set.has(e)));
};

/**
 * Returns true if all chars in the string are lowercase
 * @param {String} string 
 * @returns {Boolean}
 */
export const isLower = (string) => string === string.toLowerCase();

/**
 * Run defined test cases and log their result, useful if a lot of examples are provided
 * @template INP Input args [...args], if not an array, but an native type (string, number, boolean), it will be passed as a first argument to the solve function
 * @template OUT Output value
 * @param {String} name 
 * @param {(...args: INP) => OUT} solve solve function, will be called with the provided input
 * @param {Array<[INP, OUT]>} cases Array of test cases to run
 */
export const testCases = (name, solve, cases) => {
  if (typeof name === 'function') {
    [name, solve, cases] = ['---', name, solve];
  }

  console.log('\n' + chalk.blue(fillString(`------ ${name} `, '-', 40)));

  for (const i in cases) {
    const [input, output] = cases[i];
    let args = input;

    const isSimpleType = ['string', 'number', 'boolean'].includes(typeof args);

    if (isSimpleType) {
      args = [args];
    }

    const res = solve(...args);
    const passed = _.isEqual(res, output);

    if (passed) {
      console.log(
        i.padEnd(`${cases.length - 1}`.length, ' '),
        chalk.green('✔ passed'),
        isSimpleType ? input : '',
        res
      );
    } else {
      console.log(
        i.padEnd(`${cases.length - 1}`.length, ' '),
        chalk.red('X failed'),
        isSimpleType ? input : '',
        'got',
        res,
        'expected',
        output
      );
    }
  }

  console.log(chalk.blue('-'.repeat(40)));
};

/**
 * Returns a list of all possible combinations of a list of iterables
 * @link https://gist.github.com/cybercase/db7dde901d7070c98c48
 * @template T
 * @param {T[][]} iterables 
 * @param {Number} repeat 
 * @returns {T[][]}
 */
export const product = (iterables, repeat = 1) => {
  return Array.from({ length: repeat }, (_) => [...iterables]).reduce(
    (acc, value) => {
      const tmp = [];

      for (const a of acc) {
        for (const b of value) {
          tmp.push([...a, b]);
        }
      }

      return tmp;
    },
    [[]]
  );
};

/**
 * Enhanced set that can store multiple dimensions by serializing them inti a string using a delimiter
 * @template T
 */
export class EnhancedSet extends Set {
  /**
   * @param {Iterable<string>} iterable 
   * @param {Object} options
   * @param {String} options.delimiter element delimiter
   */
  constructor(iterable, { delimiter = '|' } = {}) {
    super(iterable);
    this.delimiter = delimiter;
  }

  /**
   * @param  {...T} cords 
   */
  addItem(...cords) {
    return this.add(cords.join(this.delimiter));
  }

  /**
   * @param  {...T} cords 
   */
  hasItem(...cords) {
    return this.has(cords.join(this.delimiter));
  }

  /**
   * @param  {...T} cords 
   */
  deleteItem(...cords) {
    return this.delete(cords.join(this.delimiter));
  }

  /**
   * @template R
   * @param {(item: T) => R} f map function
   * @returns {EnhancedSet<R>}
   */
  map(f) {
    const newSet = new EnhancedSet();
    for (const v of this.values()) newSet.add(f(...v.split(this.delimiter)));
    return newSet;
  }

  /**
   * Get the min value of a specific dimension
   * @param {Number} pos 
   */
  getMin(pos) {
    return Math.min(...this.map((...x) => +x[pos]));
  }

  /**
   * Get the max value of a specific dimension
   * @param {Number} pos 
   */
  getMax(pos) {
    return Math.max(...this.map((...x) => +x[pos]));
  }
}

const NEIGHBORS_DICT = {
  U: [-1, 0],
  D: [1, 0],
  L: [0, -1],
  R: [0, 1],
  UL: [-1, -1],
  UR: [-1, 1],
  DL: [1, -1],
  DR: [1, 1],
  S: [0, 0],
};

/**
 * Get the positions for walking though a graph structure
 * @param {Object} options 
 * @param {Object} options.direct include direct positions (U, D, L, R) (default: true)
 * @param {Object} options.diagonal include diagonal positions (UL, UR, DL, DR) (default: true)
 * @param {Object} options.includeSelf include self position (S) (default: false)
 * @returns {Partial<NEIGHBORS_DICT>}
 */
export const getPositions = ({
  direct = true,
  diagonal = true,
  includeSelf = false,
} = {}) => {
  let positions = [];

  if (direct) positions.push('U', 'D', 'L', 'R');
  if (diagonal) positions.push('UL', 'UR', 'DL', 'DR');
  if (includeSelf) positions.push('S');

  return positions.map((p) => NEIGHBORS_DICT[p]);
};

/**
 * Returns the line intersection point in a 2D space for two lines
 * @param {Number} a1
 * @param {Number} a2
 * @param {Number} b1
 * @param {Number} b2
 * @returns {[Number, Number] | null}
 * @link https://eli.thegreenplace.net/2008/08/15/intersection-of-1d-segments
 *
 * @example
 * 0,7   2, 5  -> [2, 5]
 * 0,7  -2, 3  -> [0, 3]
 * 0,7   4, 9  -> [4, 7]
 * 0,7  -4,10  -> [0, 7]
 * 0,7 -10,-2  -> null
 */
export const lineIntersection = (a1, a2, b1, b2) => {
  if (a2 >= b1 && b2 >= a1) {
    return [Math.max(a1, b1), Math.min(a2, b2)];
  }

  return null;
};

/**
 * Chunks an array by that element if the function returns false
 * @template T
 * @param {T[]} arr 
 * @param {(item: T, index: Number) => Boolean} func 
 * @returns {Array<T[]>}
 */
export const chunkBy = (arr, func) => {
  return arr.reduce((acc, e, i) => {
    if (func(e, i)) {
      acc[acc.length - 1].push(e);
    } else {
      acc.push([e]);
    }

    return acc;
  }, []);
};
