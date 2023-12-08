import chalk from "chalk";
import fs from "fs";
import path from "path";
import { InvalidArgumentError } from "commander";
import { getAocPuzzleInput } from "./aoc";
import { baseFolder } from "./constants";
import { Runner } from './runner';


export function throwError(message: any) {
  console.error(chalk.red("Error:"), message);
  return process.exit(1);
}

export function throwWarning(message: any) {
  if (process.argv.includes("a") || process.argv.includes("all")) {
    return; // don't throw warnings in all mode
  }

  console.error(chalk.yellow("Warning:"), message);
}


export const getTimeString = (timeInMs: number) => {
  const SECOND = 1000;
  const MINUTE = SECOND * 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  let days = Math.floor((timeInMs / (DAY)));
  let hours = Math.floor((timeInMs - days * DAY) / HOUR);
  let minutes = Math.floor((timeInMs - days * DAY - hours * HOUR) / MINUTE);
  let seconds = Math.floor((timeInMs / 1000) % 60);

  let outStr = "";

  for (const [n, v] of Object.entries({ d: days, h: hours, m: minutes, s: seconds })) {
    outStr += `${n !== "d" ? v.toString().padStart(2, "0") : v}${n} `;
  }
  return outStr.trim();
};

export const textToArray = (text: string, trim = true) => trim ? text.split('\n').filter((x) => x) : text.split('\n');

export const round = (x: number, dp: number) => Math.round(x * parseInt('1' + '0'.repeat(dp))) /
  parseInt('1' + '0'.repeat(dp));

export function getInputFilePath(year: number, day: number, example?: boolean | string, customInputPath?: string, check = true) {
  const p = path.join(baseFolder, '.input', `${year}`);
  let postfix = "";

  if (customInputPath) {
    if (path.basename(customInputPath) !== customInputPath || customInputPath.includes(".")) {
      const fullInputPath = path.resolve(process.cwd(), customInputPath);
      if (!fs.existsSync(fullInputPath)) {
        throwError(`File "${fullInputPath}" not found.`);
      }

      return fullInputPath;
    }

    postfix += customInputPath;
  }

  if (example) {
    if (typeof example === "string") {
      postfix += `example_${example}`
    } else if (typeof example === "boolean") {
      // try to find the first matching example
      const startName = `${day}_example`;
      const examples = fs.readdirSync(p).filter(f => f.startsWith(startName));
      const exampleNames = examples.map(e => e.replace(/\d+_example_?(.*)\.txt/, "$1")).sort();
      if (exampleNames.length > 0) {
        postfix += exampleNames[0] ? "example_" + exampleNames[0] : "example";

        if (exampleNames.length > 1) {
          throwWarning(`There is more than one example (${exampleNames.join(", ")}) found in ${path.relative(baseFolder, p)}. Choosing the first: '${exampleNames[0]}'`);
        }
      } else if (check) {
        return throwError(`Example '${example}' cannot be found in ${path.relative(baseFolder, p)}.`);
      } else {
        postfix += "example";
      }
    }
  }

  const filePath = path.join(p, `${postfix ? `${day}_${postfix}` : day}` + '.txt');
  if (check && !fs.existsSync(filePath)) {
    throwError(`File "${path.relative(baseFolder, filePath)}" not found.`);
  }

  return filePath;
}

export const getOrCreateInput = async ({
  year,
  day,
  cache = true,
  example = false,
  customInputPath
}: { year: number, day: number, cache?: boolean, example: boolean | string, customInputPath?: string }) => {
  const filePath = getInputFilePath(year, day, example, customInputPath);

  if (cache && fs.existsSync(filePath)) {
    return filePath;
  }

  const input = await getAocPuzzleInput(year, day);

  const p = path.dirname(filePath);
  if (!fs.existsSync(p)) {
    await fs.promises.mkdir(p, { recursive: true });
  }

  await fs.promises.writeFile(filePath, input, { encoding: "utf-8" });

  console.log(
    `\n${chalk.green("✔ Downloaded input file")} for year ${year}/${day} to: ${path.relative(baseFolder, filePath)}.`
  );

  return filePath;
};

export function getAnswerFilePath(year: number, example: boolean | string) {
  return path.join(baseFolder, ".", ".input", `${year}`, example ? "answers_examples.json" : "answers.json");
}

export type AnswerT = [null | string, null | string]
export async function getAnswers(year: number, example: boolean | string): Promise<Record<string, AnswerT>>;
export async function getAnswers(year: number, example: boolean | string, key?: string): Promise<AnswerT>;
export async function getAnswers(year: number, example: boolean | string, key?: string) {
  const answerFilePath = getAnswerFilePath(year, example);
  let answers: Record<string, AnswerT> = {};
  if (fs.existsSync(answerFilePath)) {
    answers = JSON.parse(await fs.promises.readFile(answerFilePath, { encoding: "utf-8" }));
  }

  if (key) return answers[key] || [null, null];

  return answers;
}

export async function setAnswer(year: number, saveKey: string, example: boolean | string, answers: AnswerT) {
  let currentAnswers = await getAnswers(year, example);

  if (!(currentAnswers[saveKey])) currentAnswers[saveKey] = [null, null];

  if (answers[0]) currentAnswers[saveKey][0] = `${answers[0]}`;
  if (answers[1]) currentAnswers[saveKey][1] = `${answers[1]}`;

  const answerFilePath = getAnswerFilePath(year, example);
  await fs.promises.writeFile(answerFilePath, JSON.stringify(currentAnswers, null, 2), { encoding: "utf-8" });

  return currentAnswers[saveKey];
}

export function getSaveKey({ day, year, example, inputPath }: { day: number, year: number, example: boolean | string, inputPath?: string }) {
  let key = `${day}`;
  if (inputPath) {
    key = getInputFilePath(year, day, example, inputPath);
  }

  if (example) {
    if (typeof example === "string") {
      key += `_${example}`;
    } else if (typeof example === "boolean") {
      // try to find the first matching example
      const p = path.join(baseFolder, '.input', `${year}`);
      const startName = `${day}_example`;
      const examples = fs.readdirSync(p).filter(f => f.startsWith(startName));
      const exampleNames = examples.map(e => e.replace(/\d+_example_?(.*)\.txt/, "$1")).sort();
      if (exampleNames.length > 0) {
        key += exampleNames[0] ? "_" + exampleNames[0] : ""
      }
    }
  }

  return key;
}

export function checkPart(answers: AnswerT, res: AnswerT, i: 0 | 1) {
  if (!answers[i]) return null;
  if (!res[i]) return undefined;

  if (`${answers[i]}` !== `${res[i]}`) {
    return false;
  }

  return true;
}

export function intCliParser(value: any) {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.');
  }
  return parsedValue;
}

export function minMaxValueParser({ min, max }: { min?: number, max?: number }) {
  return (value: any) => {
    const v = intCliParser(value);
    if (min !== undefined && v < min) throw new InvalidArgumentError(`Too low, min value is ${min}.`);
    if (max !== undefined && v > max) throw new InvalidArgumentError(`Too high, max value is ${max}.`);
    return v;
  }
}

export const getAvailableLangs = () => {
  const languagesFolderPath = path.resolve(baseFolder, "languages");
  const availableLangs = fs.readdirSync(languagesFolderPath);

  return availableLangs;
}

export type SolutionT = {
  path: string,
  day: number,
  name: string,
  lang: string,
}

export const getAllSolutionsForYear = async (year: number) => {
  return (await Promise.all(getAvailableLangs().map((lang) => {
    const basePath = path.join(baseFolder, "languages", lang, `${year}`);
    if (!fs.existsSync(basePath)) return [];

    return fs.promises.readdir(basePath, { withFileTypes: true }).then((files) => {
      return files
        .filter((file) => file.isFile())
        .map<SolutionT>((file) => ({
          path: path.join(basePath, file.name),
          day: parseInt(file.name.split("_")[0], 10),
          name: file.name.replace(/^\d+_(.*)\.\w+$/, "$1"),
          lang: lang,
        }))
        .filter((s) => s.path.endsWith(`.${s.lang}`));
    });
  }))).flat();
}

export async function getRunner({
  language,
  programFilename,
  inputPath,
  flags,
  stdout = process.stdout,
  stderr = process.stderr,
}: {
  language: string,
  programFilename: string,
  inputPath: string,
  flags: string[],
  stdout?: any;
  stderr?: any;
}): Promise<Runner> {
  const runnerFile = path.resolve(baseFolder, "languages", language, "lib", "meta", "runner.cjs");

  if (!fs.existsSync(runnerFile)) {
    throwError(`There is no runner specified for ${language}`);
  }

  try {
    const Runner = (await import(runnerFile)).default;
    const runner: Runner = new Runner({
      programFilename,
      inputPath,
      flags,
      language,
      stdout,
      stderr,
    });

    return runner;
  } catch (err) {
    console.log(err)
    return throwError(`Runner for ${language} cannot be imported/created.`);
  }
}
