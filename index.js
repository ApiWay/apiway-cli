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
    awProject.add(options).then((repo) => {
      console.log(chalk.green(`Successfully added ${repo}`));
    })
  })

  // the remove command
  .command('remove', "Project command for apiway.io")
  .help('')
  .option('-a, --add <repo>', 'Add a repository')
  .option('-o, --owner <owner>', 'A owner of a repository')
  .option('-l, --list', 'List up added TC repositories')
  .action((args, options, logger) => {
    awProject.add(options).then((repo) => {
      console.log(chalk.green(`Successfully added ${repo}`));
    })
  })

  // the project command
  .command('project', "Project command for apiway.io")
  .help('')
  .option('-a, --add <repo>', 'Add a repository')
  .option('-o, --owner <owner>', 'A owner of a repository')
  .option('-l, --list', 'List up added TC repositories')
  .action((args, options, logger) => {
    if (options.add) {
      awProject.add(options).then(() => {
        console.log('project add done')
      })
    }
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
