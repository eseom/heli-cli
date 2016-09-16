#!/usr/bin/env node

const
  fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn,
  program = require('commander'),
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
  execute = (project) => {
    console.log('-- generating initial templates');
    copyRecursiveSync(`${__dirname}/template`, project);
    pjson = fs.readFileSync(`${__dirname}/template/package.json`).toString();
    process.chdir(project)

    // package json
    fs.writeFileSync(
      `${__dirname}/template/package.json`,
      pjson.replace('__PROJECT_NAME__', project))

    console.log('-- installing dependency modules');
    const args = ['install'];
    const npm = spawn('npm', args, {
      env: process.env,
      stdio: 'inherit',
      detached: true
    });
    npm.on('close', (code) => {
      if (code !== 0)
        throw new Error('npm ' + args.join(' '));
      else
        npm.unref();
    });
    children.push(npm);
  };

['SIGINT', 'SIGTERM'].forEach((it) =>
  process.on(it, () => children.forEach((child) => child.kill()))
);

let projectValue;

program
  .arguments('project', 'project name')
  .action((project) => {
    projectValue = project;
  })
  .parse(process.argv);

if (typeof projectValue === 'undefined') {
  console.error('no proejct given!');
  process.exit(1);
}

execute(projectValue);
