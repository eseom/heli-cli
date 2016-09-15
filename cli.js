#!/usr/bin/env node

const
  path = require('path'),
  program = require('commander'),
  pj = require(__dirname + '/package.json');

program
  .version(`heli-cli ${pj.version}`)
  .command('run', 'run server')
  .command('init', 'create a brand new Heli project')
  .parse(process.argv)
