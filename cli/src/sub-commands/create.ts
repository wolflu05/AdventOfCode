import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command, Option } from 'commander';
import { getAvailableLangs, getInputFilePath, minMaxValueParser, throwError } from '../utils';
import { getAocPuzzleName } from '../aoc';
import { baseFolder } from '../constants';


const createCommand = new Command()
  .command("create [name]")
  .description(`create file from template, if name not specified, the name will be fetched from the aoc site`)
  .alias("c")
  .requiredOption('-y --year <year>', 'year', minMaxValueParser({ min: 2015 }), new Date().getFullYear())
  .requiredOption('-d --day <day>', 'day', minMaxValueParser({ min: 1, max: 25 }), new Date().getDate())
  .addOption(new Option('-l --language <language>', 'specify language').makeOptionMandatory(true).choices(getAvailableLangs()))
  .action(async (name, { year, day, language }) => {
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

      // if no name is specified => fetch it from the aoc site
      if (name === undefined) {
        name = await getAocPuzzleName(year, day).then((x) => x?.replaceAll(/\W/g, ""));
      }

      const dayStr = day.toString().padStart(2, 0);
      const filename = path.join(
        yearFolderPath,
        `${dayStr}_${name}.${language}`
      );

      const existing = fs.readdirSync(yearFolderPath).find(f => f.startsWith(dayStr + "_"));
      if (existing) {
        throwError(`Nothing to create, file ${path.relative(baseFolder, path.join(yearFolderPath, existing))} already exists.`);
      }

      const template = (await fs.promises.readFile(templatePath, 'utf-8'))
        .replaceAll("{{year}}", year)
        .replaceAll("{{day}}", day)
        .replaceAll("{{name}}", name);

      await fs.promises.writeFile(filename, template, 'utf-8');

      console.log(`${chalk.green("✔ Successfully created:")} ${path.relative(baseFolder, filename)}`);

      const exampleFilePath = getInputFilePath(year, day, true);
      const exampleDirPath = path.dirname(exampleFilePath);
      if (!fs.existsSync(exampleDirPath)) {
        await fs.promises.mkdir(exampleDirPath, { recursive: true });
      }
      if (!fs.existsSync(exampleFilePath)) {
        await fs.promises.writeFile(exampleFilePath, "", "utf-8");
        console.log(`${chalk.green("✔ Successfully created example:")} ${path.relative(baseFolder, exampleFilePath)}`);
      } else {
        console.log(`${chalk.green("✔ Found existing example:")} ${path.relative(baseFolder, exampleFilePath)}`);
      }
    } catch (err) {
      throwError(err);
    }
  });

export default createCommand;
