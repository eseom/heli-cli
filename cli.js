#!/usr/bin/env node

const fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn,
  program = require('commander'),
  pj = require(__dirname + '/package.json'),
  children = [],
  copyRecursiveSync = (src, dest) => {
    const stats = fs.statSync(src);
    const isDirectory = stats && stats.isDirectory();
    if (stats && isDirectory) {
      fs.mkdirSync(dest);
      fs.readdirSync(src).forEach((childItemName) => {
        copyRecursiveSync(path.join(src, childItemName),
          path.join(dest, childItemName));
      });
    } else {
      fs.linkSync(src, dest);
    }
  },
  exitCallback = () => children.forEach((child) => child.kill()),
  doInit = (environment) => {
    console.log('-- generating initial templates');
    copyRecursiveSync(`${__dirname}/template`, environment);
    pjson = fs.readFileSync(`${__dirname}/template/package.json`).toString();
    process.chdir(environment)

    // package json
    fs.writeFileSync(
      `${__dirname}/template/package.json`,
      pjson.replace('__PROJECT_NAME__', environment))

    console.log('-- installing dependency modules');
    const args = ['install'];
    const npm = spawn('npm', args, {
      env: process.env,
      stdio: 'inherit',
      detached: true
    });
    npm.on('close', (code) => {
      if (code !== 0) {
        throw new Error('npm ' + args.join(' '));
      } else {
        npm.unref();
      }
    });
    children.push(npm);
  },
  doDev = (environment, program) => {
    console.log(`
  _    _      _ _
 | |  | |    | (_)
 | |__| | ___| |_
 |  __  |/ _ \\ | |
 | |  | |  __/ | |
 |_|  |_|\\___|_|_|

Heli server started.
`);
    const args = ['-r', 'babel-register', '-r', 'babel-polyfill', 'app'];
    const nodeCommand = program.nodemon ? 'nodemon' : 'node'
    const node = spawn(nodeCommand, args, {
      env: process.env,
      stdio: 'inherit',
      detached: true
    });
    node.on('close', (code) => {
      if (code !== 0) {
        console.log('Heli server was killed.')
      } else {
        node.unref();
      }
    });
    children.push(node);
  };

process.on('SIGINT', exitCallback);
process.on('SIGTERM', exitCallback);

let command = '',
  environment = '';

program
  .version(`heli-cli ${pj.version}`)
  .arguments('<cmd> [env]')
  .option('-M --nodemon', 'use nodemon instead of node')
  .action((cmd, env) => {
    command = cmd;
    environment = env;
  })
  .parse(process.argv);

switch (command) {
  case 'init':
    doInit(environment);
    break;

  case 'dev':
    doDev(environment, program);
    break;

  default:
    program.outputHelp();
    break;
}
