import { argv } from "process"
import { exec } from "child_process"
import chalk from "chalk"

const info = () => chalk`
{yellow COMMANDS}
{blue ps   -- show running containers}
{blue stop -- stop all running containers}
`

type Keys = keyof typeof commands
let [, , ...args] = argv
let arg: Keys[]
arg = <Array<Keys>>args

const run = (cmd: string) => {
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(chalk`{red ${error.message}}`)
    }
    if (stderr) {
      console.error(chalk`{red ${stderr}}`)
    }
    if (stdout) {
      console.log(stdout)
    }
  })
}


const commands = {
  ps: () => {
    run(`docker  ps --format="table {{.ID}}\t{{.Names }}"`)
  },
  stop: () => {
    run(`docker stop $(docker ps -q)`)
  },
  info: () => {
    console.log(info())
  }
}

const main = () => {
  console.log(info())

  for (let cmd of arg) {
    try {
      commands[cmd]()
    } catch (error) {
      console.error(chalk`{red ${error.message}}`)
    }
  }
}

main()