import fs from 'fs';
import path from "path";
import chalk from 'chalk';
import chokidar from 'chokidar';
import { Command, Option } from 'commander';
import { performance } from 'perf_hooks';
import { AnswerT, SolutionT, checkPart, getAllSolutionsForYear, getAnswerFilePath, getAnswers, getAvailableLangs, getOrCreateInput, getRunner, getSaveKey, minMaxValueParser, round, throwError } from '../utils';
import { Runner } from "../runner";
import { baseFolder } from "../constants";

interface OptionsI {
  year: number;
  day: number;
  flags?: string[];
  input?: string;
  example: boolean;
  language?: string;
  watch: boolean;
  forceDownload?: boolean;
  check: boolean;
  saveAnswer?: boolean;
}

const runCommand = new Command()
  .command("run")
  .description("run an AdventOfCode solution")
  .alias("r")
  .option('-y --year <year>', 'year', minMaxValueParser({ min: 2015 }), new Date().getFullYear())
  .option('-d --day <day>', 'day', minMaxValueParser({ min: 1, max: 25 }), new Date().getDate())
  .option('-f --flags <flags...>', 'parse flags to the challenge')
  .option('-i --input <path>', `specify path to a custom input`)
  .option('-e --example', `use _example suffixed input`, false)
  .addOption(new Option('-l --language <language>', 'specify another language, defaults to existing files js then py is tried').choices(getAvailableLangs()))
  .option('-w --watch', 'run in watch mode', false)
  .option('-fd --force-download', `force the download of the input file`)
  .option('-nc --no-check', 'ignore check answer with saved answer if existing')
  .option('-sa --save-answer', 'save the answer of this run for later validation')
  .action(async ({ year, day, flags, input, example, language, watch, forceDownload, check, saveAnswer }: OptionsI) => {
    const solutions = (await getAllSolutionsForYear(year)).filter(({ day: d }) => d === day);

    // resolve lang and puzzle path
    let puzzleFile: SolutionT | undefined;
    if (language) {
      // if specified, try to use that language
      puzzleFile = solutions.find(({ lang }) => lang === language);
      if (!puzzleFile) {
        throwError(`There is no solution in ${language} for ${year}/${day}`);
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
    }

    if (!puzzleFile) {
      return throwError("No solution was found, create it with the \"aoc create\" command!");
    }

    const inputPath = await getOrCreateInput({
      year,
      day,
      cache: !forceDownload,
      example: example,
      customInputPath: input,
    });

    const runner = await getRunner({
      language: puzzleFile.lang,
      programFilename: puzzleFile.path,
      inputPath: inputPath,
      flags: flags || [],
    });

    const ref = { i: 0 };
    const run = async (i: number) => {
      try {
        await runPuzzle({
          year,
          day,
          customInputPath: input,
          example: example,
          saveAnswer: saveAnswer,
          check: check,
          runner,
          ref,
          i,
        });
      } catch (err) {
        throwError(err);
      }
    }

    if (watch) {
      const patterns = await Promise.resolve(runner.getWatchFilePatterns());
      const watcher = chokidar.watch(patterns, {
        persistent: true,
        cwd: baseFolder,
        awaitWriteFinish: {
          stabilityThreshold: 200
        }
      });

      watcher.on("change", async (p) => {
        ref.i++;
        let header = `${"-".repeat(10)} Detected change: ` + path.relative(baseFolder, p) + " ";
        header += ` [${ref.i}]`.padStart(95 - header.length, "-");
        console.log(chalk.blue(header));
        await Promise.resolve(runner.kill());
        await run(ref.i);
      });
    }

    await run(ref.i);
  });

interface RunPuzzleI {
  day: number;
  year: number;
  check: boolean;
  example: boolean;
  customInputPath?: string;
  saveAnswer?: boolean;
  runner: Runner;
  ref: { i: number };
  i: number;
}

async function runPuzzle({ day, year, check, example, customInputPath, saveAnswer, runner, ref, i }: RunPuzzleI) {
  const startTime = performance.now();
  let res: AnswerT;
  try {
    res = await runner.run();

  } catch (err) {
    console.log(chalk.red(`Error (after ${round(performance.now() - startTime, 3)}ms):`), err);
    return;
  }

  // fast return without calculating the result if the ref ids do not match
  if (ref.i !== i) return;

  const t = round(performance.now() - startTime, 3);

  const saveKey = getSaveKey({ day, year, example, inputPath: customInputPath });

  if (check) {
    const answers = await getAnswers(year, saveKey);

    const checkP = (answers: AnswerT, res: AnswerT, i: 0 | 1) => {
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

  if (saveAnswer && res) {
    let currentAnswers = await getAnswers(year);

    if (!(currentAnswers[saveKey])) currentAnswers[saveKey] = [null, null];

    if (res[0]) currentAnswers[saveKey][0] = `${res[0]}`;
    if (res[1]) currentAnswers[saveKey][1] = `${res[1]}`;

    const answerFilePath = getAnswerFilePath(year);
    await fs.promises.writeFile(answerFilePath, JSON.stringify(currentAnswers, null, 2), { encoding: "utf-8" });

    console.log(`${chalk.green("✔")} Answers saved for ${chalk.green(year)}/${chalk.green(day)}: ${JSON.stringify(currentAnswers[saveKey])}`);
  }

  process.stderr.write(chalk.green(`✔ Succeeded in ${t}ms\n`));

  return res;
}

export default runCommand;
