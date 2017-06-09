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
  .option('-d, --delete <projectId>', 'Delete a project with projectId')
  .action((args, options, logger) => {
    if (!options.list && !options.delete) {
      showHelp()
    }
    awProject.project(options)
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

