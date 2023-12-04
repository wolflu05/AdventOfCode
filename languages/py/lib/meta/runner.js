import path from 'path';
import { fileURLToPath } from 'url';
import { ExecRunner } from "../../../../cli/runner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class PythonRunner extends ExecRunner {
  getCmd() {
    return "python3"
  }

  getArgs() {
    return [this.programFilename, this.inputPath]
  }

  getEnv() {
    return {
      ...super.getEnv(),
      PYTHONPATH: path.resolve(__dirname, "..", ".."),
    }
  }
}
