const { ExecRunner } = require("../../../../cli/dist/runner");

class JSRunner extends ExecRunner {
  getCmd() {
    return "node"
  }

  getArgs() {
    return [this.programFilename, this.inputPath]
  }
}

module.exports = JSRunner;
