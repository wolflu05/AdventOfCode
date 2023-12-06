import fs from 'fs';
import path from 'path';
import chalk from "chalk";
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { AnswerT, textToArray, throwError } from './utils';
import { baseFolder } from "./constants";

interface RunnerConstructorI {
  programFilename: string;
  inputPath: string;
  flags: string[];
  language: string;
  stdout?: null | fs.WriteStream;
  stderr?: null | fs.WriteStream;
}

export class Runner {
  programFilename: string;
  inputPath: string;
  flags: string[];
  language: string;
  stdout?: null | fs.WriteStream;
  stderr?: null | fs.WriteStream;

  constructor({ programFilename, inputPath, flags, language, stdout, stderr }: RunnerConstructorI) {
    this.programFilename = programFilename;
    this.inputPath = inputPath;
    this.flags = flags;
    this.language = language;
    this.stdout = stdout;
    this.stderr = stderr;
  }

  async run(): Promise<AnswerT> {
    return throwError(`${this} does not implement a run function.`);
  }

  getWatchFilePatterns() {
    return [
      this.programFilename,
      this.inputPath,
      `languages/${this.language}/lib/**`,
    ]
  }

  kill(): Promise<void> | void { }
}

export class ExecRunner extends Runner {
  cProcess: ChildProcessWithoutNullStreams | null = null;

  getCmd(): string {
    return throwError(`${this} does not implement the getCmd function.`);
  }

  getArgs(): string[] {
    return []
  }

  getEnv() {
    return {
      ...process.env,
      AOC_FLAGS: this.flags.join(","),
    }
  }

  kill() {
    return new Promise<void>((res) => {
      if (!this.cProcess) {
        return res();
      }

      this.stdout?.write(chalk.yellow("Killing..."));
      let tId = setInterval(() => this.stdout?.write(chalk.yellow(".")), 1000);
      this.cProcess.on("close", () => {
        clearInterval(tId);
        this.stdout?.write(chalk.yellow("Killed\n"));
        res();
      });

      this.cProcess.kill();
    });
  }

  async run() {
    const cmd = await Promise.resolve(this.getCmd());
    const args = await Promise.resolve(this.getArgs());
    const env = await Promise.resolve(this.getEnv());

    const cProcess = spawn(cmd, args, {
      cwd: path.join(baseFolder, "languages", this.language),
      env: env,
    });
    this.cProcess = cProcess;

    let output = "";

    return new Promise<AnswerT>((res, rej) => {
      cProcess.stdout.on("data", (data) => {
        const line = data.toString("utf-8");
        output += line;
        if (this.stdout) this.stdout.write(data);
      });
      if (this.stderr) cProcess.stderr.pipe(this.stderr);

      cProcess.on("close", (code) => {
        this.cProcess = null;
        if (code && code > 0) return rej(`Returned non-zero exit code (${code})`);

        const lines = textToArray(output);
        if (lines.length === 2) {
          res(lines as AnswerT);
        } else {
          res([null, null]);
        }
      });

      cProcess.on("error", (err) => {
        this.cProcess = null;
        rej(err);
      });
    });
  }
}
