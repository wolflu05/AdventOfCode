#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { program } from 'commander';
import { performance } from 'perf_hooks';
import { fetchInput, fillString, round } from './util/util.js';
import { oraPromise } from "./util/ora.js";


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
  .option('-c --create <name>', `create file from template`)
  .option('-a --all', `run all puzzles from one year`)
  .option('-f --flags <flags...>', 'parse flags to the challenge')
  .option('-i --input <path>', `specify path to a custom input`)
  .option('-s --short', `only print result without the answer sentence`, false)
  .option('-fd --force-download', `force the download of the input file`)
  .option('-e --example', `use _example suffixed input`, false);

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
      file.startsWith(`${(program.day + '').padStart(2, 0)}_`)
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
      });
    } else if (program.create && !pu) {
      try {
        const template = (
          await fs.promises.readFile(
            path.resolve('templates', 'puzzle.js'),
            'utf-8'
          )
        )
          .replace("'%{year}%'", program.year)
          .replace("'%{day}%'", program.day);

        await fs.promises.writeFile(
          path.resolve(
            `${program.year}`,
            `${('0' + program.day).slice(-2)}_${program.create}.js`
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

async function runPuzzle({
  year,
  filename,
  part,
  flags,
  inputPath,
  day: d,
  short,
  forceDownload,
  example,
}) {
  let day = null;
  try {
    day = (await import(`./${year}/${filename}`)).default;
  } catch (err) {
    console.error(err);
    throw new Error('This puzzle was not found or a error occurred.');
  }
  if (day === null) throw new Error('This puzzle was not found.');

  const parseInput = async () => {
    let inputText;

    if (inputPath) {
      const filePath = path.resolve(process.cwd(), inputPath);

      if (fs.existsSync(filePath)) {
        inputText = await fs.promises.readFile(filePath, 'utf-8');
      } else {
        throw new Error(`File "${filePath}" not found.`);
      }
    } else {
      inputText = await fetchInput(year, d, !forceDownload, true, example);
    }

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

    if (short) {
      console.log(res.result);
    }
  }
}
