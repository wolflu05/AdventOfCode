#!/usr/bin/env node

import { config } from 'dotenv';
config();

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import fetch from 'node-fetch';
import { program } from 'commander';
import { performance } from 'perf_hooks';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { fillString, round, textToArray } from './util/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://adventofcode.com';
const sessionCookie = process.env.SESSIONCOOKIE;

const generateCMD = (lang, file, inputPath) => {
  if (lang === "py") {
    return {
      cmd: "python3",
      args: [file, inputPath],
      env: {
        PYTHONPATH: path.resolve(__dirname, "util"),
      }
    }
  }

  if (lang === "js") {
    return {
      cmd: "node",
      args: [file, inputPath],
    }
  }

  throwError(`Language ${lang} has no defined cmd generator.`)
}


program
  .storeOptionsAsProperties()
  .version(JSON.parse(fs.readFileSync("./package.json")).version)
  .option(
    '-y --year <year>',
    'year of challenge to run',
    new Date().getFullYear()
  )
  .option('-d --day <day>', 'day of challenge to run', new Date().getDate())
  .option('-p --part <part>', `part of challenge to run`)
  .option('-c --create [name]', `create file from template, if name not specified, the name will be fetched from the aoc site`)
  .option('-a --all', `run all puzzles from one year`)
  .option('-f --flags <flags...>', 'parse flags to the challenge')
  .option('-i --input <path>', `specify path to a custom input`)
  .option('-fd --force-download', `force the download of the input file`)
  .option('-e --example', `use _example suffixed input`, false)
  .option('-l --language <language>', 'specify another language')
  .option('--no-check', 'ignore check answer with saved answer if existing')
  .option('-sa --save-answer', 'save the answer of this run for later validation');

program.parse(process.argv);

function throwError(message) {
  console.error("Error:", message);
  process.exit(1);
}

const fetchInput = async (year, day) => {
  const url = `${baseUrl}/${year}/day/${day}/input`;

  return await (
    await fetch(url, {
      headers: {
        Cookie: `session=${sessionCookie}`,
      },
    })
  ).text();
};

function getInputFilePath(year, day, example) {
  const p = path.resolve('.input', `${year}`);
  const filePath = path.resolve(
    p,
    `${example ? `${day}_example` : day}` + '.txt'
  );
  return filePath;
}

const getInput = async (year, day, cache = true, check = true, example = false) => {
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

const getTimeString = (timeInMs, delimiter = ':') => {
  let hours = Math.ceil((timeInMs / (1000 * 60 * 60)) % 60);
  let minutes = Math.floor((timeInMs / (1000 * 60)) % 60);
  let seconds = Math.floor((timeInMs / 1000) % 60);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  return [hours, minutes, seconds].join(delimiter);
};

const getAocPuzzleName = async (year, day) => {
  const url = `${baseUrl}/${year}/day/${day}`;

  const html = await fetch(url).then(res => res.text());

  const nameMatch = html.match(/<h2>--- Day \d+: (.*) ---<\/h2>/);

  return nameMatch?.[1] || null;
}

(async function run() {
  const yearFolderPath = path.resolve(`${program.year}`);

  if (program.create) {
    if (!fs.existsSync(yearFolderPath)) {
      await fs.promises.mkdir(yearFolderPath);
    }

    if (!program.language) {
      throwError("Language not specified, required for -c");
    }

    try {
      const templatePath = path.resolve('templates', `puzzle.${program.language}`);

      if (!fs.existsSync(templatePath)) {
        throwError(`No template for language ${program.language} found`);
      }

      const template = (await fs.promises.readFile(templatePath, 'utf-8'))
        .replaceAll("'{{year}}'", program.year)
        .replaceAll("'{{day}}'", program.day);

      const challengeName = program.create === true ? await getAocPuzzleName(program.year, program.day).then(x => x.replaceAll(/\W/g, "")) : program.create;

      const filename = path.resolve(
        `${program.year}`,
        `${('0' + program.day).slice(-2)}_${challengeName}.${program.language}`
      );

      if (fs.existsSync(filename)) {
        throwError('Nothing to create, file exists.');
      }

      await fs.promises.writeFile(filename, template, 'utf-8');
    } catch (err) {
      throw err;
    }

    return;
  }

  if (!fs.existsSync(yearFolderPath)) {
    throwError("No solutions for this year found.");
  }

  if (program.all) {
    const dir = (
      await fs.promises.readdir(yearFolderPath, {
        withFileTypes: true,
      })
    )
      .filter((dirent) => dirent.isFile())
      .map((file) => file.name);
    let startTime = performance.now();

    for (const puzzle of dir) {
      let s = `------ ${puzzle} `;
      while (s.length < 41) s += '-';

      let st = performance.now();

      console.log(chalk.blue(fillString(`------ ${puzzle} `, '-', 40)));
      await runPuzzle({
        year: program.year,
        day: +puzzle.split('_')[0],
        filename: puzzle,
        part: +program.part,
        flags: program.flags || [],
        forceDownload: program.forceDownload,
        example: program.example,
        language: puzzle.split(".").at(-1),
        saveAnswer: program.saveAnswer,
        check: program.check,
      });

      console.log(
        `${chalk.blue(
          fillString(`------ ${round(performance.now() - st, 3)}ms `, '-', 40)
        )}\n`
      );
    }

    console.log(
      chalk.blue(`
------------------------------------
Total time: ${round((performance.now() - startTime) / 1000, 3)}s 
------------------------------------`)
    );

    return;
  }

  // get all solutions for the specified day
  const solutions = (await fs.promises.readdir(yearFolderPath)).filter((file) =>
    file.startsWith(`${(program.day + '').padStart(2, 0)}_`)
  );

  // resolve lang and puzzle path
  let puzzlePath = null;
  let language = program.language;
  if (program.language) {
    // if specified, try to use that language
    puzzlePath = solutions.find(file => file.endsWith(`.${program.language}`));
    if (!puzzlePath) {
      throwError(`There is no solution in ${program.language} for ${program.year}/${program.day}`);
    }
  } else if (solutions.length > 1) {
    // if there is more than one, try js than py
    let has_found = false;
    for (const lang of ["js", "py"]) {
      puzzlePath = solutions.find(file => file.endsWith(`.${lang}`));

      if (puzzlePath) {
        console.log(chalk.yellow("Selected lang: " + lang));
        language = lang;
        has_found = true;
        break;
      }
    }

    if (!has_found) {
      const solutionLangs = solutions.map(x => x.split(".").at(-1)).join(", ");
      throwError(`There is more than one solution (${solutionLangs}), specify one with the -l flag`);
    }
  } else if (solutions.length === 1) {
    // try the only existing solution
    puzzlePath = solutions[0];
    language = puzzlePath.split(".").at(-1);
  } else {
    throwError("No solution was found, create it with the -c flag");
  }

  await runPuzzle({
    year: program.year,
    day: program.day,
    filename: puzzlePath,
    part: +program.part,
    flags: program.flags || [],
    inputPath: program.input,
    forceDownload: program.forceDownload,
    example: program.example,
    language: language,
    saveAnswer: program.saveAnswer,
    check: program.check,
  });
})();

function getAnswerFilePath(year) {
  return path.resolve(".", ".input", `${year}`, "answers.json");
}

async function getAnswers(year, key) {
  const answerFilePath = getAnswerFilePath(year);
  let answers = {};
  if (fs.existsSync(answerFilePath)) {
    answers = JSON.parse(await fs.promises.readFile(answerFilePath));
  }

  if (key) return answers[key] || [null, null];

  return answers;
}

function getSaveKey(args) {
  let key = `${args.day}`;
  if (args.example) key += "_example";
  if (args.inputPath) key += path.resolve(process.cwd(), args.inputPath);

  return key;
}

async function runPuzzle(args) {
  const startTime = performance.now();
  const res = await getPuzzleAnswer(args);
  const t = round(performance.now() - startTime, 3);

  const { day, year } = args;

  if (args.check) {
    const answers = await getAnswers(year, getSaveKey(args));

    const checkPart = (answers, res, i) => {
      if (!answers[i]) return null;
      if (!res[i]) return undefined;

      if (`${answers[i]}` !== `${res[i]}`) {
        console.log(chalk.red(`❌ Part ${i + 1}: ${res[i]} !== ${answers[i]} (expected)`))
        return false
      }

      return true;
    }

    const p1 = checkPart(answers, res, 0);
    const p2 = checkPart(answers, res, 1);

    if (p1 === null || p2 === null) {
      const partString = [p1 === null ? "part 1" : "", p2 === null ? "part 2" : ""].join(", ");
      console.log(chalk.yellow(`Warning: no saved answer found to check against for: ${chalk.bold.white(partString)}`));
    }

    if (p1 === undefined || p2 === undefined) {
      const partString = [p1 === undefined ? "part 1" : "", p2 === undefined ? "part 2" : ""].join(", ");
      console.log(chalk.yellow(`Warning: no answer in the solution output found to check against for: ${chalk.bold.white(partString)}`));
    }
  }

  if (args.saveAnswer && res) {
    let currentAnswers = await getAnswers(year);

    const key = getSaveKey(args);

    if (!(currentAnswers[key])) currentAnswers[key] = [null, null];

    if (res[0]) currentAnswers[key][0] = `${res[0]}`;
    if (res[1]) currentAnswers[key][1] = `${res[1]}`;

    const answerFilePath = getAnswerFilePath(year);
    await fs.promises.writeFile(answerFilePath, JSON.stringify(currentAnswers, null, 2), { encoding: "utf-8" });

    console.log(`${chalk.green("✔")} Answers saved for ${chalk.green(year)}/${chalk.green(day)}: ${JSON.stringify(currentAnswers[key])}`);
  }

  process.stderr.write(chalk.green(`✔ Succeeded in ${t}ms\n`));

  return res;
}

async function getPuzzleAnswer({
  year,
  filename,
  flags,
  inputPath,
  day: d,
  forceDownload,
  example,
  language,
}) {
  const programFilePath = path.resolve(".", `${year}`, filename);

  if (!fs.existsSync(programFilePath)) {
    throwError(`This puzzle file was not found at ${programFilePath}.`);
  }

  let fullInputPath = getInputFilePath(year, d, example);
  if (inputPath) {
    fullInputPath = path.resolve(process.cwd(), inputPath);

    if (!fs.existsSync(fullInputPath)) {
      throwError(`File "${fullInputPath}" not found.`);
    }
  } else if (!fs.existsSync(fullInputPath)) {
    await getInput(year, d, !forceDownload, true, example);
  }

  const { cmd, args, env } = generateCMD(language, programFilePath, fullInputPath, flags);
  const cProcess = spawn(cmd, args, {
    cwd: __dirname,
    env: {
      ...process.env,
      ...env,
      AOC_FLAGS: flags.join(",")
    }
  });

  let output = "";

  return new Promise((res) => {
    cProcess.stdout.on("data", (data) => {
      const line = data.toString("utf-8");
      output += line;
      process.stdout.write(data);
    });
    cProcess.stderr.pipe(process.stderr);

    cProcess.on("close", (code) => {
      if (code > 0) return res([null, null]);

      const lines = textToArray(output);
      if (lines.length === 2) {
        res(lines);
      } else {
        res([null, null]);
      }
    });

    cProcess.on("error", (err) => {
      console.error(err);
      process.exit(1);
    });
  });
}
