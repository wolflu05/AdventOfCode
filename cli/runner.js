import path from 'path';
import { fileURLToPath } from 'url';
import { textToArray, throwError } from './utils.js';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Runner {
  constructor({ programFilename, inputPath, flags, language, stdout, stderr }) {
    this.programFilename = programFilename;
    this.inputPath = inputPath;
    this.flags = flags;
    this.language = language;
    this.stdout = stdout;
    this.stderr = stderr;
  }

  /**
   * Run a puzzle
   * @returns {Promise<[null | string, null | string]>}
   * @throws {Error}
   */
  async run() {
    throwError(`${this} does not implement a run function.`);
  }
}

export class ExecRunner extends Runner {
  getCmd() {
    throwError(`${this} does not implement the getCmd function.`);
  }

  getArgs() {
    return []
  }

  getEnv() {
    return {
      ...process.env,
      AOC_FLAGS: this.flags.join(","),
    }
  }

  async run() {
    const cmd = await Promise.resolve(this.getCmd());
    const args = await Promise.resolve(this.getArgs());
    const env = await Promise.resolve(this.getEnv());

    const cProcess = spawn(cmd, args, {
      cwd: path.join(__dirname, "..", "languages", this.language),
      env: env,
    });

    let output = "";

    return new Promise((res, rej) => {
      cProcess.stdout.on("data", (data) => {
        const line = data.toString("utf-8");
        output += line;
        if (this.stdout) this.stdout.write(data);
      });
      if (this.stderr) cProcess.stderr.pipe(this.stderr);

      cProcess.on("close", (code) => {
        if (code > 0) return rej(`Returned non-zero exit code (${code})`);

        const lines = textToArray(output);
        if (lines.length === 2) {
          res(lines);
        } else {
          res([null, null]);
        }
      });

      cProcess.on("error", (err) => {
        rej(err)
      });
    });
  }
}
