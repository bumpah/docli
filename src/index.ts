import { argv } from "process"
import { exec, spawn } from "child_process"
import chalk from "chalk"

const info = () => chalk`
{yellow COMMANDS}
{blue ps   -- show running containers}
{blue stop -- stop all running containers}
{blue res -- restart all running container}
{blue b <name> -- build docker containers}
`

type Keys = keyof typeof commands
let [, , ...args] = argv
let arg: Keys[]
arg = <Array<Keys>>args

console.log({ args })
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

const runSpawn = (prog: string, args: string[]) => {
  console.log('runSpawn', prog, { args })
  let app = spawn(prog, args)

  app.stdout.on('data', (data) => { console.log(chalk`{gray ${data}}`) })
  app.stderr.on('data', (data) => { console.log(chalk`{red ${data}}`) })
  app.on('exit', (_) => { console.log(chalk`{green DONE!}`) })
}


const commands = {
  ps: (args: string) => {
    run(`docker  ps --format="table {{.ID}}\t{{.Names }}"`)
  },
  stop: (args: string) => {
    console.log(chalk`{yellow Stopping all running containers...}`)
    run(`docker stop $(docker ps -q)`)
  },
  res: (args: string) => {
    if (args) {
      console.log(chalk`{yellow Restarting containers {green ${args}}...}`)
      run(`docker restart ${args}`)
    }
    else {
      console.log(chalk`{yellow Restarting all running containers...}`)
      run(`docker restart $(docker ps -q)`)
    }
  },
  b: (args: string) => {
    const [_, ...services] = args.split(' ')
    console.log(chalk`Now building containers {green ${services.join(' ')}}`)
    runSpawn(`docker-compose`, `build ${services.join(' ')}`.split(' '))
  },
  info: (args: string) => {
    console.log(info())
  }
}

const main = () => {
  console.log(info())
  for (let cmd of buildCommands()) {
    try {
      launch(cmd)
    } catch (error) {
      console.error(chalk`{red Error: tried to run "${cmd}"}`)
      console.error(chalk`{yellow Commands: ${Object.keys(commands).join(', ')}}`)
      console.error(chalk`{red Message: ${error.message}}`)
    }
  }
}

const launch = (cmd: Keys) => {
  let c = <Keys>cmd.split(' ')[0]
  let [, ...a]: string[] = cmd.split(' ')
  commands[c](a.join(' '))
}

const buildCommands = (): Keys[] => {
  const cmdList: Keys[] = []
  for (let c of arg) {
    let lastItem = cmdList.length - 1
    if (!Object.keys(commands).includes(c))
      cmdList[lastItem] += ` ${c}`
    else cmdList.push(c)
  }
  return cmdList
}

main()