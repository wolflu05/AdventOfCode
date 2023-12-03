#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';
import { performance } from 'perf_hooks';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { fillString, round, textToArray } from './util/util.js';
import { getAocPuzzleName, getInput, getInputFilePath } from './util/aoc_util.js';
import { oraPromise } from "./util/ora.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateCMD = (lang, file, inputPath) => {
  if (lang === "py") {
    return {
      cmd: "python3",
      args: [file, inputPath],
      env: {
        PYTHONPATH: path.resolve(__dirname, "util", "py"),
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
  .option('-c --create [name]', `create file from template`)
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

(async function run() {
  const p = path.resolve(`${program.year}`);

  if (fs.existsSync(p)) {
    if (program.all) {
      const dir = (
        await fs.promises.readdir(p, {
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

    const solutions = (await fs.promises.readdir(p)).filter((file) =>
      file.startsWith(`${(program.day + '').padStart(2, 0)}_`)
    );

    let pu = null;
    let language = program.language;
    if (program.language) {
      pu = solutions.find(file => file.endsWith(`.${program.language}`));
      if (!pu) {
        throwError(`There is no solution in ${program.language} for ${program.year}/${program.day}`);
      }
    } else if (solutions.length > 1) {
      for (const lang of ["js", "py"]) {
        pu = solutions.find(file => file.endsWith(`.${lang}`));

        if (pu) {
          console.log(chalk.yellow("Selected lang: " + lang));
          language = lang;
          break;
        }
      }
    } else {
      pu = solutions[0];
      language = pu.split(".").at(-1);
    }

    if (
      pu &&
      parseInt(pu.slice(0, 2)) === parseInt(program.day) &&
      !program.create
    ) {
      await runPuzzle({
        year: program.year,
        day: program.day,
        filename: pu,
        part: +program.part,
        flags: program.flags || [],
        inputPath: program.input,
        forceDownload: program.forceDownload,
        example: program.example,
        language: language,
        saveAnswer: program.saveAnswer,
        check: program.check,
      });
    } else if (program.create && !pu) {
      try {
        const template = (
          await fs.promises.readFile(
            path.resolve('templates', `puzzle.${program.language}`),
            'utf-8'
          )
        )
          .replaceAll("'{{year}}'", program.year)
          .replaceAll("'{{day}}'", program.day);

        const challengeName = program.create === true ? await getAocPuzzleName(program.year, program.day).then(x => x.replaceAll(/\W/g, "")) : program.create;
        await fs.promises.writeFile(
          path.resolve(
            `${program.year}`,
            `${('0' + program.day).slice(-2)}_${challengeName}.${program.language}`
          ),
          template,
          'utf-8'
        );
      } catch (err) {
        throw err;
      }
    } else if (pu) {
      throwError('Nothing to create, file exists.');

    } else {
      throwError(
        'challenge not found, you can create it with the -c flag'
      );
    }
  } else if (program.create) {
    try {
      await fs.promises.mkdir(path.resolve(`${program.year}`));
      run();
    } catch (err) {
      throw err;
    }
  } else {
    throwError('Nothing for this year found.');
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

async function runPuzzle(args) {
  const res = await getPuzzleAnswer(args);

  const { day, year } = args;

  if (args.check) {
    const answers = await getAnswers(year, getSaveKey(args));

    const checkPart = (answers, res, i) => {
      if (!answers[i] || !res[i]) return null;

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
