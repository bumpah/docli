const fs = require("fs")

/**
 * Output object config
 */
const OutputFile = {
  fileName: "./dist/index.js",
  output() {
    return fs.readFileSync(this.fileName)
      .toString()
      .split("\n")
  },
  fixedOutput: [],
  addLine(line) {
    this.fixedOutput.push(line)
  },
  writeOutput() {
    fs.writeFileSync(
      this.fileName,
      this.fixedOutput.join("\n")
    )
    fs.chmodSync(this.fileName, 0o775)
  }
}
/**
 * Node Application specific config
 */
const NodeApp = {
  env: "#!/usr/bin/env node",
  addAppEnv(line) {
    if (line !== this.env) {
      OutputFile.addLine(this.env)
    }
  },
}

const procedures = [
  () => {
    const output = OutputFile.output()
    let firstLine = true
    for (let line of output) {
      if (firstLine) {
        NodeApp.addAppEnv(line)
        firstLine = false
      }
      OutputFile.addLine(line)
    }
  },
  () => {
    OutputFile.writeOutput()
  }
]

for (let procedure of procedures) {
  procedure()
}
