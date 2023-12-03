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
        PYTHONPATH: path.resolve(__dirname, "util", "py")
      }
    }
  }
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
  .option('-s --short', `only print result without the answer sentence`, false)
  .option('-fd --force-download', `force the download of the input file`)
  .option('-e --example', `use _example suffixed input`, false)
  .option('-l --language <language>', 'specify another language', 'js')
  .option('--no-check', 'ignore check answer with saved answer if existing')
  .option('-sa --save-answer', 'save the answer of this run for later validation');

program.parse(process.argv);

(async function run() {
  const p = path.resolve(`${program.year}`);

  if (fs.existsSync(p)) {
    if (program.all) {
      const dir = (
        await fs.promises.readdir(p, {
          withFileTypes: true,
        })
      )
        .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.js'))
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
          short: program.short,
          forceDownload: program.forceDownload,
          example: program.example,
          language: program.language,
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

    const pu = (await fs.promises.readdir(p)).find((file) =>
      file.startsWith(`${(program.day + '').padStart(2, 0)}_`) && file.endsWith(`.${program.language}`)
    );

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
        short: program.short,
        forceDownload: program.forceDownload,
        example: program.example,
        language: program.language,
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
      throw new Error('Nothing to create, file exists.');
    } else {
      throw new Error(
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
    throw new Error('Nothing for this year found.');
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
      if (!answers[i] || !res[i]) return;

      if (`${answers[i]}` !== `${res[i]}`) {
        console.log(chalk.red(`❌ Part ${i + 1}: ${res[i]} !== ${answers[i]} (expected)`))
      }
    }

    checkPart(answers, res, 0);
    checkPart(answers, res, 1);
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
  part,
  flags,
  inputPath,
  day: d,
  short,
  forceDownload,
  example,
  language,
}) {
  const getInputAsText = async () => {
    let inputText;

    if (inputPath) {
      const filePath = path.resolve(process.cwd(), inputPath);

      if (fs.existsSync(filePath)) {
        inputText = await fs.promises.readFile(filePath, 'utf-8');
      } else {
        throw new Error(`File "${filePath}" not found.`);
      }
    } else {
      inputText = await getInput(year, d, !forceDownload, true, example);
    }

    return inputText;
  }

  if (language !== "js") {
    const programFilePath = path.resolve(".", `${year}`, filename);

    if (!fs.existsSync(programFilePath)) {
      throw new Error(`This puzzle file was not found at ${programFilePath}.`);
    }

    let fullInputPath = getInputFilePath(year, d, example);
    if (inputPath) {
      fullInputPath = path.resolve(process.cwd(), inputPath);

      if (!fs.existsSync(fullInputPath)) {
        throw new Error(`File "${fullInputPath}" not found.`);
      }
    }

    const { cmd, args, env } = generateCMD(language, programFilePath, fullInputPath);
    const cProcess = spawn(cmd, args, {
      cwd: __dirname,
      env: {
        ...process.env,
        ...env
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
        if (code > 0) return res();

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

  let day = null;
  try {
    day = (await import(`./${year}/${filename}`)).default;
  } catch (err) {
    console.error(err);
    throw new Error('This puzzle was not found or a error occurred.');
  }
  if (day === null) throw new Error('This puzzle was not found.');

  const parseInput = async () => {
    const inputText = await getInputAsText();

    return day({ input: inputText, flags });
  };

  const { part1, part2 } = await oraPromise(
    'parse input',
    parseInput,
    () => 'input parsed successfully.',
    undefined,
    short
  );

  const args = { flags };
  const resolveFunction = (res) => {
    if (['string', 'number'].includes(typeof res)) {
      res = { text: res };
    }

    return res.text || res.result;
  };

  const result = [null, null];

  if (isNaN(part) || part === 0 || part === 1) {
    if (!short) {
      console.log(chalk.bold('Part 1:'));
    }

    const res = await oraPromise(
      'puzzle 1',
      part1,
      resolveFunction,
      args,
      short
    );

    // TODO: replace with res
    result[0] = res.result || res;

    if (short) {
      console.log(res.result);
    }
  }

  if (isNaN(part) || part === 0 || part === 2) {
    if (!short) {
      console.log(chalk.bold('Part 2:'));
    }

    const res = await oraPromise(
      'puzzle 2',
      part2,
      resolveFunction,
      args,
      short
    );

    // TODO: replace with res
    result[1] = res.result || res;

    if (short) {
      console.log(res.result);
    }
  }

  return result;
}
