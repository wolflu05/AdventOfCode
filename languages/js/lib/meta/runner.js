import { ExecRunner } from "../../../../cli/runner.js";

export default class JSRunner extends ExecRunner {
  getCmd() {
    return "node"
  }

  getArgs() {
    return [this.programFilename, this.inputPath]
  }
}
