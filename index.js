#!/usr/bin/env node
"use strict";

const prog = require('caporal');
var chalk       = require('chalk');
var figlet      = require('figlet');
var packageInfo = require('./package.json');
var User = require('./api/user');

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
  .option('--oauth <oauth-provider>', 'OAuth provider (default: github)', ["github"])
  // .argument('<oauth-provider>', 'OAuth provider', ["github"])

  .action((args, options, logger) => {
    User.githubAuth(function(err, authed) {
      if (err) {
        switch (err.code) {
          case 401:
            console.log(chalk.red('Couldn\'t log you in. Please try again.'));
            break;
          case 422:
            console.log(chalk.red('You already have an access token.'));
            console.log(chalk.red('Delete the old access token (Go to https://github.com/settings/tokens)'));
            break;
        }
      }
      if (authed) {
        User.login()
        console.log(chalk.green('Sucessfully authenticated!'));
      }
    });
    // logger.info("Command 'order' called with:");
    // logger.info("arguments: %j", args);
    // logger.info("options: %j", options);
  })

prog.parse(process.argv);
