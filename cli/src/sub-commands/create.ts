import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command, Option } from 'commander';
import { spawnSync } from "child_process";
import { getAvailableLangs, getInputFilePath, getTimeString, minMaxValueParser, throwError } from '../utils';
import { getAocExample, getAocPuzzleName, getAocPuzzlePage, hasPuzzleStarted } from '../aoc';
import { baseFolder } from '../constants';


const createCommand = new Command()
  .command("create [name]")
  .description(`create file from template, if name not specified, the name will be fetched from the aoc site`)
  .alias("c")
  .requiredOption('-y --year <year>', 'year', minMaxValueParser({ min: 2015 }), new Date().getFullYear())
  .requiredOption('-d --day <day>', 'day', minMaxValueParser({ min: 1, max: 25 }), new Date().getDate())
  .option('-nw --no-wait', 'don\'t wait until the challenge is available', true)
  .addOption(new Option('-l --language <language>', 'specify language').makeOptionMandatory(true).choices(getAvailableLangs()))
  .action(async (name, { wait, year, day, ...args }) => {
    const hasStarted = hasPuzzleStarted(year, day);

    if (!wait || hasStarted === true) return await create(name, { year, day, ...args });

    // start in wait mode
    let Tid: NodeJS.Timeout | undefined;

    const updateCountdown = () => {
      const hasStarted = hasPuzzleStarted(year, day);

      if (hasStarted === true) {
        clearInterval(Tid);
        console.log("\nThe puzzle has started now. Creating...");
        setTimeout(() => {
          create(name, { year, day, ...args });
        }, 1000);

        return;
      }

      process.stdout.write(`This puzzle is not yet available! Waiting until it unlocks. (${getTimeString(hasStarted)})\r`);
    }

    Tid = setInterval(updateCountdown, 1000);
    updateCountdown();
  });

async function create(name: string | undefined, { year, day, language }: { year: number, day: number, language: string }) {
  const languageFolderPath = path.join(baseFolder, "languages", language);
  const yearFolderPath = path.join(languageFolderPath, `${year}`);

  if (!fs.existsSync(yearFolderPath)) {
    await fs.promises.mkdir(yearFolderPath, { recursive: true });
  }

  try {
    const templatePath = path.join(languageFolderPath, "lib", "meta", `template.${language}`);

    if (!fs.existsSync(templatePath)) {
      throwError(`No template for language ${language} found, create it at '${path.relative(baseFolder, templatePath)}'`);
    }

    const dayStr = day.toString().padStart(2, "0");
    const existing = fs.readdirSync(yearFolderPath).find(f => f.startsWith(dayStr + "_"));
    if (existing) {
      throwError(`Nothing to create, file ${path.relative(baseFolder, path.join(yearFolderPath, existing))} already exists.`);
    }

    // if no name is specified => fetch it from the aoc site
    const puzzlePage = await getAocPuzzlePage(year, day);
    if (name === undefined) {
      name = getAocPuzzleName(puzzlePage)?.replaceAll(/\W/g, "");
    }

    const filename = path.join(
      yearFolderPath,
      `${dayStr}_${name}.${language}`
    );

    const template = (await fs.promises.readFile(templatePath, 'utf-8'))
      .replaceAll("{{year}}", `${year}`)
      .replaceAll("{{day}}", `${day}`)
      .replaceAll("{{name}}", `${name}`);

    await fs.promises.writeFile(filename, template, 'utf-8');

    console.log(`${chalk.green("✔ Successfully created:")} ${path.relative(baseFolder, filename)}`);

    const exampleFilePath = getInputFilePath(year, day, true);
    const exampleDirPath = path.dirname(exampleFilePath);
    if (!fs.existsSync(exampleDirPath)) {
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
    }
    if (!fs.existsSync(exampleFilePath)) {
      await fs.promises.writeFile(exampleFilePath, getAocExample(puzzlePage) || "", "utf-8");
      console.log(`${chalk.green("✔ Successfully created example:")} ${path.relative(baseFolder, exampleFilePath)}`);
    } else {
      console.log(`${chalk.green("✔ Found existing example:")} ${path.relative(baseFolder, exampleFilePath)}`);
    }

    try {
      spawnSync("code", ["-r", filename, exampleFilePath]);
    } catch { }
  } catch (err) {
    throwError(err);
  }
}

export default createCommand;
