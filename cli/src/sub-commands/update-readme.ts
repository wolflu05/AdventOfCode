import fs from 'fs';
import { Command } from 'commander';
import { SolutionT, getAllSolutionsForYear } from '../utils';
import { baseFolder } from "../constants";
import path from "path";
import chalk from "chalk";

const updateReadmeCommand = new Command()
  .command("update-readme")
  .description(`update readme calender`)
  .alias("ur")
  .action(async () => {
    let out = "# 🎄 Advent Of Code\n\n";
    out += "This repository contains my [Advent of code](https://adventofcode.com) solutions solved in different programming languages.\n\n"

    const languages = fs.readdirSync(path.join(baseFolder, "languages"));
    const logos = languages.reduce<Record<string, string>>((logos, lang) => {
      const logoPath = path.join(baseFolder, "languages", lang, "lib", "meta", "logo.svg");
      if (fs.existsSync(logoPath)) logos[lang] = `<img height="14" alt="${lang}" src="${path.relative(baseFolder, logoPath)}"/>`;
      else logos[lang] = lang;
      return logos;
    }, {});
    const languageMeta = languages.reduce<Record<string, { name: string }>>((acc, lang) => {
      const metaPath = path.join(baseFolder, "languages", lang, "lib", "meta", "meta.cjs");
      try {
        acc[lang] = require(metaPath);
      } catch {
        acc[lang] = { name: "" }
      }
      return acc;
    }, {});

    for (let year = new Date().getFullYear(); year >= 2015; year--) {
      const solutionsList = await getAllSolutionsForYear(year);
      const solutions = solutionsList.reduce<Record<number, SolutionT[]>>((acc, solution) => {
        if (!(solution.day in acc)) acc[solution.day] = [];
        acc[solution.day].push(solution);
        return acc;
      }, {});

      // filter out empty years
      if (Object.keys(solutions).length === 0) continue;

      // generate calender
      const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

      const firstDay = new Date(year, 11, 1, 6, 0);
      const currentDay = new Date();
      let column = ((firstDay.getDay() - 1 + 7) % 7);
      let row = 0;
      let table = "| " + weekDays.join(" | ") + " |\n";
      table += "| " + weekDays.map(_ => ":-:").join(" | ") + " |\n";
      if (column !== 0) table += "|" + Array.from({ length: column }).map(_ => " ").join(" | ")
      for (let i = 1; i <= 25; i++) {
        const d = new Date(year, 11, i, 6, 0);
        const dayText = d <= currentDay ? `**[${i}](https://adventofcode.com/${year}/day/${i})**` : `${i}`;
        const cellContent = `${dayText} ${solutions[i]?.map(x => `[${logos[x.lang]}](${path.relative(baseFolder, x.path)})`).join(" ") || ""}`;

        table += "| " + cellContent;

        if (column === 6) {
          row++;
          table += " |\n";
        }
        column = (column + 1) % 7;
      }
      if (column !== 0) table += "| " + Array.from({ length: 7 - column }).map(_ => " ").join(" | ") + " |"

      // count languages
      const languagesCounterStr = Object.entries(solutionsList.reduce<Record<string, number>>((cnt, s) => {
        if (!(s.lang in cnt)) cnt[s.lang] = 0;
        cnt[s.lang]++;
        return cnt;
      }, {}))
        .sort((a, b) => b[1] - a[1])
        .filter(l => l[1] > 0)
        .map(([lang, c]) => `[${logos[lang]} ${languageMeta[lang].name}](${path.join("languages", lang, `${year}`)}): ${c}`)
        .join(", ");

      out += `## [${year}](https://adventofcode.com/${year})\n\n`;
      if (languagesCounterStr) out += `**Languages: ${languagesCounterStr}**\n\n`
      out += table;
      out += `\n\n\n`;
    }

    fs.writeFileSync(path.join(baseFolder, "README.md"), out, { encoding: "utf-8" });
    console.log(chalk.green("✔ README.md successfully updated."))
  });

export default updateReadmeCommand;
