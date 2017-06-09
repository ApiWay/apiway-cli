#!/usr/bin/env node
"use strict";

const prog = require('caporal');
var chalk       = require('chalk');
var figlet      = require('figlet');
// var _           = require('lodash');
var packageInfo = require('./package.json');
var awUser = require('./api/user');
var awProject = require('./api/project');
var awInstance = require('./api/instance');
var util = require('./util');

util.clear()

console.log(
  chalk.blue(
    figlet.textSync('ApiWay', { horizontalLayout: 'full' })
  )
);

prog
  .version(packageInfo.version)
  // the "login" command
  .command('login', 'Login to apiway.io')
  .help(`Login with OAuth`)
  .alias('sign-in')
  .option('-o, --oauth <oauth-provider>', 'OAuth provider (default: github)', ["github"])
  .action((args, options, logger) => {
    awUser.login()
    // logger.info("Command 'order' called with:");
    // logger.info("arguments: %j", args);
    // logger.info("options: %j", options);
  })

  // the add command
  .command('add', "Add a project")
  .help('')
  .option('-r, --repo <repo>', 'repository name')
  .option('-o, --owner <owner>', 'A owner of a repository')
  .action((args, options, logger) => {
    if (options.repo == true) {
      console.log(chalk.red('Need a repository name'));
      showHelp()
    }
    if (options.owner == true) {
      console.log(chalk.red('Need a owner name'));
      showHelp()
    }
    awProject.add(options).then(() => {
    })
  })

  // the project command
  .command('project', "Project command for apiway.io")
  .help('')
  .option('-l, --list', 'Show project list')
  .option('-t, --time <time>', 'Update schedule. Every time (e.g. 1h, 4h, 1d, 2d)  (require -u)')
  .option('-w, --when <when>', 'Update schedule. When time is (e.g. 45m = 01:45, 02:45, 03:45)  (require -u)')
  .option('-d, --delete <projectId>', 'Delete a project with projectId')
  .option('-p, --projectId <projectId>', 'Specify a projectID')
  .action((args, options, logger) => {
    if (!options.list && !options.delete && !options.update
        && !options.projectId
        && !options.when && !options.time) {
      showHelp()
    }
    awProject.project(options).then((err, res) => {
      if (err) {
        showHelp(err)
      }
    })
  })

  // the run command
  .command('run', "Project command for apiway.io")
  .help('')
  .option('-p, --project <projectFullName>', 'Project name (ex. bluehackmaster/apiway-cli')
  .option('-l, --list', 'Show run history')
  .action((args, options, logger) => {
    if (!options.project && !options.list) {
      showHelp()
    }
    awInstance.run(options)
  })

prog.parse(process.argv);

function showHelp() {
  let argv = []
  process.argv.forEach(arg => {
    argv.push(arg)
  })
  argv[3] = '-h'
  prog.parse(argv)
}

