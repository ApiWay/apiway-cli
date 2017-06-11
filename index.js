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
  .option('-p, --projectId <projectId>', 'Specify a projectID')
  .option('-l, --list', 'Show project list')
  .option('-s, --subscriber <subscriber>',
    'Set subscriber email to notify test result \n' +
    '  (e.g.) -s aaa@gmail.com,bbb@emil.com')
  .option('-t, --interval <interval>',
    'Set schedule with interval time \n' +
    '  (e.g.) 1h, 4h, 1d, 2d \n' +
    'Range: 1h~24h, 1d~31d')
  .option('-w, --when <when>',
    'Set schedule with time \n' +
    '  (e.g.) 45m = 01:45, 02:45, ... , 24:45 \n' +
    '         13h = 13:00 Sun, 13:00 Mon, ... , 13:00 Sat)  \n' +
    'Range: 1m ~ 59m, 1h~24h')
  .option('-c, --cron <cron>',
    'Set schedule with cron expression\n' +
    '  (e.g.) * */1 * * * = 01:00, 02:00 ... every hour \n' +
    '         * * */3 * * = every three days  \n')
  .option('-d, --delete <projectId>', 'Delete a project with projectId')
  .option('-b, --branch <branch>', 'Change branch')
  .action((args, options, logger) => {
    if (!options.list && !options.delete
        && !options.projectId
        && !options.branch
        && !options.subscriber
        && !options.when && !options.interval && !options.cron) {
      showHelp()
    }
    awProject.project(options).then((res) => {
    }, (err) => {
      showHelp(err)
    })
  })

  // the run command
  .command('run', "Project command for apiway.io")
  .help('')
  .option('-p, --project <projectFullName>', 'Project name (ex. bluehackmaster/apiway-cli')
  .option('-l, --list', 'Show run history')
  .option('-i, --instanceId <instanceId>', 'Show a information of instance')
  .action((args, options, logger) => {
    if (!options.project && !options.list && !options.instanceId) {
      showHelp()
    }
    awInstance.run(options).then((res) => {
    }, (err) => {
      showHelp(err)
    })
  })

prog.parse(process.argv);

function showHelp(err) {
  if (err) {
    console.log(chalk.red(err));
  }
  let argv = []
  process.argv.forEach(arg => {
    argv.push(arg)
  })
  argv[3] = '-h'
  prog.parse(argv)
}

