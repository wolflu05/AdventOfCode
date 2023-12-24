import chalk from 'chalk';
import { Command } from 'commander';
import { AsciiTable3 } from 'ascii-table3';
import { checkPart, getAllSolutionsForYear, getAnswers, getAvailableLangs, getOrCreateInput, getRunner, getSaveKey, minMaxValueParser, round } from '../utils';

const allCommand = new Command()
  .command("all")
  .description(`run all puzzles from one year`)
  .alias("a")
  .option('-y --year <year>', 'year', minMaxValueParser({ min: 2015 }), new Date().getFullYear())
  .option('-e --example', `use _example suffixed input`, false)
  .option('-il --ignore-langs <lang...>', 'ignore some languages')
  .action(async ({ year, example, ignoreLangs }: { year: number, example: boolean, ignoreLangs?: string[] }) => {
    const allSolutions = (await getAllSolutionsForYear(year)).filter(({ lang }) => !ignoreLangs?.includes(lang));
    const availableLangs = getAvailableLangs().filter(l => !ignoreLangs?.includes(l));

    const generateTable = (top = true) => {
      const table = new AsciiTable3()
        .setWidths([10, 28, 18, 18, ...availableLangs.map(_ => 15)])
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
    const answers = await getAnswers(year, example);

    // group by day
    const solutions = allSolutions.reduce<Record<number, typeof allSolutions>>((acc, solution) => {
      if (!(solution.day in acc)) acc[solution.day] = [];
      acc[solution.day].push(solution);
      return acc;
    }, {});

    for (const [day, files] of Object.entries(solutions)) {
      const promises = files.map(async (f) => {
        const inputPath = await getOrCreateInput({
          year,
          day: parseInt(day),
          example,
        });

        const runner = await getRunner({
          language: f.lang,
          programFilename: f.path,
          inputPath: inputPath,
          example: example,
          flags: [],
          stdout: null,
          stderr: null,
        });

        const startTime = performance.now();

        const res = await runner.run();

        const t = round(performance.now() - startTime, 3);
        time += t;
        return { res, t };
      });

      const k = getSaveKey({ day: parseInt(day), year, example: example });
      const solution = answers[k] || [null, null];
      const solutionStrArr = solution.map(x => chalk.blue(x) || chalk.grey("N/A"));

      const langRes = (await Promise.allSettled(promises)).reduce<Record<string, string>>((acc, item, i) => {
        const lang = files[i].lang;

        let st: ["green" | "grey" | "yellow" | "red", string] = item.status === "fulfilled" ? ["green", "✔"] : ["red", "✖"];
        if (item.status === "fulfilled") {
          const p1 = checkPart(solution, item.value.res, 0);
          const p2 = checkPart(solution, item.value.res, 1);

          if ((!p1 || !p2)) {
            if ((p1 === false || p2 === false)) st = ["yellow", "!"];
            else st = ["grey", "?"];
          }
        }

        acc[lang] = (chalk[st[0]])(`${st[1]} ${item.status === "fulfilled" && item.value.t ? `(${item.value.t}ms)` : "Error"}`);

        return acc;
      }, {});
      const langResArr = availableLangs.map(l => langRes[l] || chalk.gray("N/A"));

      const name = files.length > 0 ? files[0].name : chalk.gray("N/A");

      const row = generateTable(false).addRow(chalk.green(`${year}/${day.padStart(2, "0")}`), name, ...solutionStrArr, ...langResArr);

      console.log(row.toString().trim());
    }

    const legendStr = `Legend: ${chalk.green("✔ - Success")}, ${chalk.red("✖ - error")}, ${chalk.yellow("! - invalid solution")}, ${chalk.grey("? - no saved answer/output solution found")}`;
    const legend = generateTable(false)
      .addRow(legendStr)
      .addRow(`Total time: ${chalk.green(`${round((time) / 1000, 3)}s`)}`)
      .setWidth(1, headingTable.getWidths().reduce((a, b) => a + b + 1));
    console.log(legend.toString().trim())
  })

export default allCommand;
