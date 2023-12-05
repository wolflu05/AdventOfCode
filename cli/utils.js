import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fetchInput } from "./aoc.js";

export function throwError(message) {
  console.error("Error:", message);
  process.exit(1);
}

export const getTimeString = (timeInMs, delimiter = ':') => {
  let hours = Math.ceil((timeInMs / (1000 * 60 * 60)) % 60);
  let minutes = Math.floor((timeInMs / (1000 * 60)) % 60);
  let seconds = Math.floor((timeInMs / 1000) % 60);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  return [hours, minutes, seconds].join(delimiter);
};

export const textToArray = (text, trim = true) => trim ? text.split('\n').filter((x) => x) : text.split('\n');

export const round = (x, dp) => Math.round(x * parseInt('1' + '0'.repeat(dp))) /
  parseInt('1' + '0'.repeat(dp));

export function getInputFilePath(year, day, example) {
  const p = path.resolve('.input', `${year}`);
  const filePath = path.resolve(
    p,
    `${example ? `${day}_example` : day}` + '.txt'
  );
  return filePath;
}

export const getInput = async ({ year, day, cache = true, check = true, example = false }) => {
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

  const input = await fetchInput(year, day);

  console.log(
    `\n${chalk.green('✔')} Downloaded input file for year ${year}/${day}.`
  );

  const p = path.dirname(filePath);
  if (!fs.existsSync(p)) {
    await fs.promises.mkdir(p, { recursive: true });
  }

  await fs.promises.writeFile(filePath, input);

  return input;
};

export function getAnswerFilePath(year) {
  return path.resolve(".", ".input", `${year}`, "answers.json");
}

export async function getAnswers(year, key) {
  const answerFilePath = getAnswerFilePath(year);
  let answers = {};
  if (fs.existsSync(answerFilePath)) {
    answers = JSON.parse(await fs.promises.readFile(answerFilePath));
  }

  if (key) return answers[key] || [null, null];

  return answers;
}

export function getSaveKey(args) {
  let key = `${args.day}`;
  if (args.example) key += "_example";
  if (args.inputPath) key += "_" + path.resolve(process.cwd(), args.inputPath);

  return key;
}

export function checkPart(answers, res, i) {
  if (!answers[i]) return null;
  if (!res[i]) return undefined;

  if (`${answers[i]}` !== `${res[i]}`) {
    return false;
  }

  return true;
}
