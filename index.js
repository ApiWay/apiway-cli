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
  .help(`OAuth login`)
  .alias('sign-in')
  .argument('<oauth-provider>', 'OAuth provider', ["github"])

  .option('-n, --number <num>', 'Number of pizza', prog.INT, 1)
  .option('-d, --discount <amount>', 'Discount offer', prog.FLOAT)
  .option('-p, --pay-by <mean>', 'Pay by option')
  .complete(function() {
    return Promise.resolve(['cash', 'credit-card']);
  })

  // --extra will be auto-magicaly autocompleted by providing the user with 3 choices
  .option('-e <ingredients>', 'Add extra ingredients', ['pepperoni', 'onion', 'cheese'])
  .option('--add-ingredients <ingredients>', 'Add extra ingredients', prog.LIST)
  .action((args, options, logger) => {
    User.githubAuth(function(err, authed) {
      if (err) {
        switch (err.code) {
          case 401:
            console.log(chalk.red('Couldn\'t log you in. Please try again.'));
            break;
          case 422:
            console.log(chalk.red('You already have an access token.'));
            break;
        }
      }
      if (authed) {
        console.log(chalk.green('Sucessfully authenticated!'));
      }
    });
    // logger.info("Command 'order' called with:");
    // logger.info("arguments: %j", args);
    // logger.info("options: %j", options);
  })

  // the "return" command
  .command('return', 'Return an order')
  // <kind> will be auto-magicaly autocompleted by providing the user with 3 choices
  .argument('<order-id>', 'Order id')
  // enable auto-completion for <from-store> argument using a Promise
  .complete(function() {
    return Promise.resolve(['#82792', '#71727', '#526Z52']);
  })
  .argument('<to-store>', 'Store id')
  .option('--ask-change <other-kind-pizza>', 'Ask for other kind of pizza')
  .complete(function() {
    return Promise.resolve(["margherita", "hawaiian", "fredo"]);
  })
  .option('--say-something <something>', 'Say something to the manager')
  .action(function(args, options, logger) {
    return Promise.resolve("wooooo").then(function (ret) {
      logger.info("Command 'return' called with:");
      logger.info("arguments: %j", args);
      logger.info("options: %j", options);
      logger.info("promise succeed with: %s", ret);
    });
  });

prog.parse(process.argv);
