#!/usr/bin/env node

const
  fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn,
  program = require('commander'),
  children = [],
  execute = (env, nodemon) => {
    console.info(`
  _    _      _ _
 | |  | |    | (_)
 | |__| | ___| |_
 |  __  |/ _ \\ | |
 | |  | |  __/ | |
 |_|  |_|\\___|_|_|

Heli server started.
`);
    const args = ['-r', 'babel-register', '-r', 'babel-polyfill', 'app'];
    const nodeCommand = nodemon ? 'nodemon' : 'node'
    if (!env)
      env = 'dev';
    process.env['EXEC_ENV'] = env
    const node = spawn(nodeCommand, args, {
      env: process.env,
      stdio: 'inherit',
      detached: true
    });
    node.on('close', (code) => {
      if (code !== 0)
      ;
      else
        node.unref();
    });
    children.push(node);
  };

['SIGINT', 'SIGTERM'].forEach((it) =>
  process.on(it, () => children.forEach((child) => child.kill()))
);

program
  .option('-E, --env <env>', 'server running mode')
  .option('-N, --nodemon', 'use nodemon instead of node')
  .parse(process.argv);

execute(program.env, program.nodemon);
