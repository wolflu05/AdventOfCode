#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';
import { performance } from 'perf_hooks';
import { AsciiTable3 } from 'ascii-table3';
import { fileURLToPath } from 'url';
import { getInputFilePath, getInput, throwError, round } from "./utils.js";
import { getAocPuzzleName } from './aoc.js';
import { getAnswers, getSaveKey, checkPart, getAnswerFilePath } from './utils.js';
import { Runner } from './runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


program
  .storeOptionsAsProperties()
  .version(JSON.parse(fs.readFileSync("./package.json")).version)
  .option(
    '-y --year <year>',
    'year of challenge to run',
    new Date().getFullYear()
  )
  .option('-d --day <day>', 'day of challenge to run', new Date().getDate())
  .option('-c --create [name]', `create file from template, if name not specified, the name will be fetched from the aoc site`)
  .option('-a --all', `run all puzzles from one year`)
  .option('-f --flags <flags...>', 'parse flags to the challenge')
  .option('-i --input <path>', `specify path to a custom input`)
  .option('-e --example', `use _example suffixed input`, false)
  .option('-l --language <language>', 'specify another language')
  .option('-fd --force-download', `force the download of the input file`)
  .option('-nc --no-check', 'ignore check answer with saved answer if existing')
  .option('-sa --save-answer', 'save the answer of this run for later validation');

program.parse(process.argv);


(async function run() {
  const languagesFolderPath = path.resolve(__dirname, "..", "languages");
  const availableLangs = fs.readdirSync(languagesFolderPath);

  // ------ create program
  if (program.create) {
    if (!program.language) {
      throwError("Language not specified, required for '--create'");
    }

    const languageFolderPath = path.join(languagesFolderPath, `${program.language}`);
    const yearFolderPath = path.join(languageFolderPath, `${program.year}`);

    if (!fs.existsSync(yearFolderPath)) {
      await fs.promises.mkdir(yearFolderPath, { recursive: true });
    }

    try {
      const templatePath = path.join(languageFolderPath, "lib", "meta", `template.${program.language}`);

      if (!fs.existsSync(templatePath)) {
        throwError(`No template for language ${program.language} found, create it at '${path.relative("..", templatePath)}'`);
      }

      // program.create is true if no name is specified => fetch it from the aoc site
      const challengeName = program.create === true ? await getAocPuzzleName(program.year, program.day).then(x => x.replaceAll(/\W/g, "")) : program.create;

      const template = (await fs.promises.readFile(templatePath, 'utf-8'))
        .replaceAll("{{year}}", program.year)
        .replaceAll("{{day}}", program.day)
        .replaceAll("{{challengeName}}", challengeName);

      const filename = path.join(
        yearFolderPath,
        `${(program.day.toString().padStart(2, 0))}_${challengeName}.${program.language}`
      );

      if (fs.existsSync(filename)) {
        throwError('Nothing to create, file exists.');
      }

      await fs.promises.writeFile(filename, template, 'utf-8');

      console.log(`${chalk.green("✔ Successfully created:")} ${path.relative("..", filename)}`);

      const exampleFilePath = getInputFilePath(program.year, program.day, true);
      const exampleDirPath = path.dirname(exampleFilePath);
      if (!fs.existsSync(exampleDirPath)) {
        await fs.promises.mkdir(exampleDirPath, { recursive: true });
      }
      await fs.promises.writeFile(exampleFilePath, "", "utf-8");
      console.log(`${chalk.green("✔ Successfully created example:")} ${path.relative("..", exampleFilePath)}`);
    } catch (err) {
      throw err;
    }

    return;
  }

  // get all solutions
  const allSolutions = (await Promise.all(availableLangs.map(lang => {
    const basePath = path.join(languagesFolderPath, lang, `${program.year}`);
    if (!fs.existsSync(basePath)) return [];

    return fs.promises.readdir(basePath, { withFileTypes: true }).then((files) => {
      return files
        .filter((file) => file.isFile())
        .map((file) => ({
          path: path.join(basePath, file.name),
          day: parseInt(file.name.split("_")[0], 10),
          name: file.name.replace(/^\d+_(.*)\.\w+$/, "$1"),
          lang: lang,
        }));
    });
  }))).flat();

  // ------ run all puzzles for one year
  if (program.all) {
    const generateTable = (top = true) => {
      const table = new AsciiTable3()
        .setWidths([10, 25, 15, 15, ...availableLangs.map(_ => 15)])
        .setWrappings([false, false, true, true, ...availableLangs.map(_ => false)])

      const style = table.getStyle();
      if (!top) {
        style.borders.top = { left: "", center: "", right: "", colSeparator: "" }
      }

      return table;
    }

    const headingTable = generateTable().addRow("Day", "Name", "Part 1", "Part 2", ...availableLangs);
    console.log(headingTable.toString().trim());

    let time = 0;
    const answers = await getAnswers(program.year);

    // group by day
    /** @type {Record<number, typeof allSolutions>} */
    const solutions = allSolutions.reduce((acc, solution) => {
      if (!(solution.day in acc)) acc[solution.day] = [];
      acc[solution.day].push(solution);
      return acc;
    }, {});

    for (const [day, files] of Object.entries(solutions)) {
      const promises = files.map(async (f) => {
        const startTime = performance.now();
        const res = await getPuzzleAnswer({
          year: program.year,
          day: day,
          filename: f.path,
          flags: program.flags || [],
          forceDownload: program.forceDownload,
          example: program.example,
          language: f.lang,
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
        const lang = files[i].lang;

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
      const langResArr = availableLangs.map(l => langRes[l] || chalk.gray("N/A"));

      const name = files.length > 0 ? files[0].name : chalk.gray("N/A");

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

  // Check if language is defined
  if (program.language && !availableLangs.includes(program.language)) {
    throwError(`Language ${program.language} not found.`);
  }

  // filter only solutions for today
  const solutions = allSolutions.filter(({ day }) => `${day}` === `${program.day}`);

  // resolve lang and puzzle path
  let puzzleFile = null;
  if (program.language) {
    // if specified, try to use that language
    puzzleFile = solutions.find(({ lang }) => lang === program.language);
    if (!puzzleFile) {
      throwError(`There is no solution in ${program.language} for ${program.year}/${program.day}`);
    }
  } else if (solutions.length > 1) {
    // if there is more than one, try js than py
    let has_found = false;
    for (const language of ["js", "py"]) {
      puzzleFile = solutions.find(({ lang }) => lang === language);

      if (puzzleFile) {
        console.log(chalk.yellow("Selected lang: " + puzzleFile.lang));
        has_found = true;
        break;
      }
    }

    if (!has_found) {
      const solutionLangs = solutions.map(x => x.lang).join(", ");
      throwError(`There is more than one solution (${solutionLangs}), specify one with the -l flag`);
    }
  } else if (solutions.length === 1) {
    // try the only existing solution
    puzzleFile = solutions[0];
  } else {
    throwError("No solution was found, create it with the -c flag");
  }

  try {
    await runPuzzle({
      year: program.year,
      day: program.day,
      filename: puzzleFile.path,
      flags: program.flags || [],
      inputPath: program.input,
      forceDownload: program.forceDownload,
      example: program.example,
      language: puzzleFile.lang,
      saveAnswer: program.saveAnswer,
      check: program.check,
    });
  } catch (err) {
    console.error(chalk.red("Error:"), err);
    process.exit(1);
  }
})();

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
  } else {
    console.log(chalk.yellow("Warning: solution not checked, '--no-check' is supplied."));
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
  if (!fs.existsSync(filename)) {
    throwError(`This puzzle file was not found at ${filename}.`);
  }

  let fullInputPath = getInputFilePath(year, d, example);
  if (inputPath) {
    fullInputPath = path.resolve(process.cwd(), inputPath);

    if (!fs.existsSync(fullInputPath)) {
      throwError(`File "${fullInputPath}" not found.`);
    }
  } else {
    await getInput({
      year: year,
      day: d,
      cache: !forceDownload,
      check: true,
      example: example,
    });
  }

  const runnerFile = path.resolve(__dirname, "..", "languages", language, "lib", "meta", "runner.js");
  if (!fs.existsSync(runnerFile)) {
    throwError(`There is no runner specified for ${language}`);
  }

  /** @type {Runner} */
  let runner = null;
  try {
    const Runner = (await import(runnerFile)).default;
    runner = new Runner({
      programFilename: filename,
      inputPath: fullInputPath,
      flags,
      language,
      stdout,
      stderr,
    });
  } catch (err) {
    throwError(`Runner for ${language} cannot be imported/created.`);
  }

  return runner.run();
}
