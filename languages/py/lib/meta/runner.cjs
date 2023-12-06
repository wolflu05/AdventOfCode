const path = require("path");
const { ExecRunner } = require("../../../../cli/dist/runner.js");

class PythonRunner extends ExecRunner {
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
      PYTHONUNBUFFERED: 1,
    }
  }
}

module.exports = PythonRunner;
