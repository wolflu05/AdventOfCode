const fs = require("fs");
const { Runner } = require("../../../../cli/dist/runner");
const { Braingoat } = require("@wolflu05/braingoat");
const { run } = require("./brainfuck");

const freshRequire = (file) => {
  const resolvedFile = require.resolve(file);
  const temp = require.cache[resolvedFile];
  delete require.cache[resolvedFile];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const modified = require(resolvedFile);
  require.cache[resolvedFile] = temp;
  return modified;
};



class BFRunner extends Runner {
  async run() {
    const bgCode = fs.readFileSync(this.programFilename, { encoding: "utf-8" });

    const bg = new Braingoat(bgCode);
    bg.compile();

    const outPath = this.programFilename.replace(/\.bf$/, ".b");
    const code = bg.bfCode.replaceAll(/(.{79})/g, "$1\n") + "\n";

    fs.writeFileSync(outPath, code, { encoding: "utf-8" });

    this.log(`Brainfuck output file written to ${outPath}`);
    const input = fs.readFileSync(this.inputPath, { encoding: "utf-8" });

    const res = run(code, input, 30_000);
    this.log(res);

    const splitted = res.split("\n").filter(x => x).map(x => x || "-");

    if (splitted.length === 2) {
      return splitted
    }

    return [null, null];
  }

  log(message) {
    if (this.stdout) {
      this.stdout.write(message + "\n");
    }
  }
}

module.exports = BFRunner;
