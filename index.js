#!/usr/bin/env node
"use strict";

const prog = require('caporal');
var chalk       = require('chalk');
var figlet      = require('figlet');
var packageInfo = require('./package.json');
var awUser = require('./api/user');
var awProject = require('./api/project');

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

  // the project command
  .command('project', "Project command for apiway.io")
  .help('')
  .option('-a, --add <repo>', 'Add a TC repository')
  .option('-l, --list', 'List up added TC repositories')
  .action((args, options, logger) => {
    if (options.add) {
      let repo = {
        name: options.add,
        html_url: "www.xxx.xxx",
        git_url: "git@xxxxx",
      }
      awProject.add(repo ).then(() => {
        console.log('project add done')
      })
    }
  })

prog.parse(process.argv);
