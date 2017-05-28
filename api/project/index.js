"use strict";

var chalk       = require('chalk');
var CLI         = require('clui');
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var Spinner     = CLI.Spinner;
var github = require('../github');
var _           = require('lodash');
var Promise = require('promise');
var git         = require('simple-git')();
var touch       = require('touch');
var fs          = require('fs');
var files       = require('../../lib/files');
var ApiWay  = require('apiway.js')
let aw = new ApiWay({});
let awUser = aw.getUser();
let awProject = aw.getProject();
var Configstore = require('configstore');
var pkg         = require('../../package.json')
const conf = new Configstore(pkg.name, {foo: 'bar'});

exports.add  = function (options) {
  return new Promise ((resolve, reject) => {

    if (!options.owner && !options.repo) {
        github.getOrgs()
          .then((orgs) => selectLogin(orgs))
          .then((login) => selectRepo(login))
          .then((fullName) => {
            resolve(fullName)
          })
    } else if (options.owner == null && options.repo != null) {
        github.getOrgs()
          .then((orgs) => selectLogin(orgs))
          .then((login) => checkRepo(login, options.repo))
          .then((fullName) => {
            resolve(fullName)
          })
    } else if (options.owner != null && options.repo == null) {
          selectRepo(options.owner)
          .then((fullName) => {
            resolve(fullName)
          })
    } else if (options.owner != null && options.repo != null) {
          checkRepo(options.owner, options.repo)
          .then((fullName) => {
            resolve(fullName)
          })
    }
  })
}

exports.project = function (args, options) {
  return new Promise ((resolve, reject) => {
    if (args.projectName == null) {
      let userId = conf.get('userId')
      getProjectsByUser(userId).then((data) => {
        showProjects(data)
      })
    }
  })
}

function checkRepo(owner, repo) {
  return new Promise ((resolve, reject) => {
    let options = {
      owner: owner,
      repo: repo
    }
    github.checkRepo(options, function (fullName) {
      resolve(fullName)
    })
  })
}

function selectRepo(login) {
  return new Promise ((resolve, reject) => {
    github.getRepos(login, function (data) {
      let repoArray = []
      data.forEach(repo => {
        repoArray.push(repo.full_name)
      })
      promptRepos(repoArray, (data) => {
        resolve(data.repo)
      })
    })
  })
}

function selectLogin(orgs) {
  return new Promise ((resolve, reject) => {
    let orgArray = [conf.get('login')]
    orgs.forEach(org => {
      orgArray.push(org.login)
    })
    promptOrg(orgArray, (data) => {
      resolve(data.user)
    })
  })
}

function promptRepos(repos, callback) {
  var questions = [
    {
      name: 'repo',
      type: 'list',
      message: 'Select a repository',
      choices: repos
    }
  ];
  inquirer.prompt(questions).then(callback);
}

function promptOrg(orgs, callback) {
  var questions = [
    {
      name: 'user',
      type: 'list',
      message: 'Select a user or organization',
      choices: orgs,
      default: [conf.get('userId')],
    }
  ];
  inquirer.prompt(questions).then(callback);
}

function getProjectsByUser (userId) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Geting projects ...');
    status.start();
    awProject.getProjectsByUser(userId).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data.projects)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

function addRepo (repo) {
  var data = {
    name: repo.name,
    full_name: repo.full_name,
    owner: conf.get('userId'),
    html_url: repo.html_url,
    git_url: repo.git_url,
    provider: "github"
  }
  awProject.addProject(data).then(res => {
    console.log(res)
    if (res!= null) {
      resolve(res.data)
    }
  }).catch(err => {
    console.error(err)
    reject(err)
  })
}

function showProjects (projects) {
  console.log(chalk.bold.yellow(conf.get('login')) + chalk.yellow('\'' + ' Project list >'))
  projects.forEach((project, i) => {
    makeProjectFormat(project, i)
  })
}

function makeProjectFormat (project, index) {
  console.log(index + '. ' + chalk.green(`${project.full_name}`))
}
