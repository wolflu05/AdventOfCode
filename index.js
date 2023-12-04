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
import { AsciiTable3 } from 'ascii-table3';
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
    const [solutions, langs] = (
      await fs.promises.readdir(yearFolderPath, {
        withFileTypes: true,
      })
    )
      .filter((dirent) => dirent.isFile())
      .map((file) => file.name)
      .reduce(([acc, langs], s) => {
        const day = parseInt(s.split("_")[0]);
        if (!(day in acc)) acc[day] = [];
        acc[day].push(s);
        langs.add(s.split(".").at(-1));
        return [acc, langs];
      }, [{}, new Set()]);

    const langsArr = [...langs];

    const generateTable = (top = true) => {
      const table = new AsciiTable3()
        .setWidths([10, 25, 15, 15, ...langsArr.map(_ => 15)])
        .setWrappings([false, false, true, true, ...langsArr.map(_ => false)])

      const style = table.getStyle();
      if (!top) {
        style.borders.top = { left: "", center: "", right: "", colSeparator: "" }
      }

      return table;
    }

    const headingTable = generateTable().addRow("Day", "Name", "Part 1", "Part 2", ...langsArr);
    console.log(headingTable.toString().trim());

    let time = 0;
    const answers = await getAnswers(program.year);

    for (const [day, files] of Object.entries(solutions)) {
      const promises = files.map(async (f) => {
        const startTime = performance.now();
        const res = await getPuzzleAnswer({
          year: program.year,
          day: day,
          filename: f,
          flags: program.flags || [],
          forceDownload: program.forceDownload,
          example: program.example,
          language: f.split(".").at(-1),
          saveAnswer: program.saveAnswer,
          check: program.check,
          stdout: null,
          stderr: null,
        });
        const t = round(performance.now() - startTime, 3);
        time += t;
        return { res, t };
      });

      const k = getSaveKey({ day: day, example: program.example });
      const solution = answers[k] || [null, null];
      const solutionStrArr = solution.map(x => chalk.blue(x) || chalk.grey("N/A"));

      const langRes = (await Promise.allSettled(promises)).reduce((acc, { status, value }, i) => {
        const lang = files[i].split(".").at(-1);

        let st = status === "fulfilled" ? ["green", "✔"] : ["red", "✖"];
        if (status === "fulfilled") {
          const p1 = checkPart(solution, value.res, 0);
          const p2 = checkPart(solution, value.res, 1);

          if ((!p1 || !p2)) {
            if ((p1 === false || p2 === false)) st = ["yellow", "!"];
            else st = ["grey", "?"];
          }
        }

        acc[lang] = (chalk[st[0]])(`${st[1]} ${value?.t ? `(${value.t}ms)` : "Error"}`);

        return acc;
      }, {});
      const langResArr = langsArr.map(l => langRes[l] || chalk.gray("N/A"));

      const name = files.length > 0 ? files[0].replace(/^\d+_(.*)\.\w+$/, "$1") : chalk.gray("N/A");

      const row = generateTable(false).addRow(chalk.green(`${program.year}/${day.padStart(2, 0)}`), name, ...solutionStrArr, ...langResArr);

      console.log(row.toString().trim());
    }

    const legendStr = `Legend: ${chalk.green("✔ - Success")}, ${chalk.red("✖ - error")}, ${chalk.yellow("! - invalid solution")}, ${chalk.grey("? - no saved answer/output solution found")}`;
    const legend = generateTable(false)
      .addRow(legendStr)
      .addRow(`Total time: ${chalk.green(`${round((time) / 1000, 3)}s`)}`)
      .setWidth(1, headingTable.getWidths().reduce((a, b) => a + b + 1));
    console.log(legend.toString().trim())

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

  try {
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
  } catch (err) {
    console.error(chalk.red("Error:"), err);
    process.exit(1);
  }
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

function checkPart(answers, res, i) {
  if (!answers[i]) return null;
  if (!res[i]) return undefined;

  if (`${answers[i]}` !== `${res[i]}`) {
    return false;
  }

  return true;
}

async function runPuzzle(args) {
  const startTime = performance.now();
  const res = await getPuzzleAnswer(args);
  const t = round(performance.now() - startTime, 3);

  const { day, year } = args;

  if (args.check) {
    const answers = await getAnswers(year, getSaveKey(args));

    const checkP = (answers, res, i) => {
      const result = checkPart(answers, res, i);
      if (result === false) {
        console.log(chalk.red(`❌ Part ${i + 1}: ${res[i]} !== ${answers[i]} (expected)`));
      }

      return result;
    }

    const p1 = checkP(answers, res, 0);
    const p2 = checkP(answers, res, 1);

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
  stdout = process.stdout,
  stderr = process.stderr,
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

  return new Promise((res, rej) => {
    cProcess.stdout.on("data", (data) => {
      const line = data.toString("utf-8");
      output += line;
      if (stdout) stdout.write(data);
    });
    if (stderr) cProcess.stderr.pipe(stderr);

    cProcess.on("close", (code) => {
      if (code > 0) return rej(`Returned non-zero exit code (${code})`);

      const lines = textToArray(output);
      if (lines.length === 2) {
        res(lines);
      } else {
        res([null, null]);
      }
    });

    cProcess.on("error", (err) => {
      rej(err)
    });
  });
}
