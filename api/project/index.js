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
const conf = require('../../util/config')
const confStore = new Configstore(pkg.name, {foo: 'bar'});
var repos = new Map();

exports.add  = function (options) {
  return new Promise ((resolve, reject) => {

    if (!options.owner && !options.repo) {
        github.getOrgs()
          .then((orgs) => selectLogin(orgs))
          .then((login) => selectRepo(login))
          .then((repo) => addRepo(repo))
          .then((projectId) => {
            showAddProjectDoneMsg(confStore.get(conf.LAST_ADDED_PROJECT), projectId)
            resolve()
          })
    } else if (options.owner == null && options.repo != null) {
        github.getOrgs()
          .then((orgs) => selectLogin(orgs))
          .then((login) => checkRepo(login, options.repo))
          .then((repo) => addRepo(repo))
          .then((projectId) => {
            showAddProjectDoneMsg(confStore.get(conf.LAST_ADDED_PROJECT), projectId)
            resolve()
          })
    } else if (options.owner != null && options.repo == null) {
        selectRepo(options.owner)
          .then((repo) => addRepo(repo))
          .then((projectId) => {
            showAddProjectDoneMsg(confStore.get(conf.LAST_ADDED_PROJECT), projectId)
            resolve()
        })
    } else if (options.owner != null && options.repo != null) {
        checkRepo(options.owner, options.repo)
          .then((repo) => addRepo(repo))
          .then((projectId) => {
            showAddProjectDoneMsg(confStore.get(conf.LAST_ADDED_PROJECT), projectId)
            resolve()
        })
    }
  })
}

exports.project = function (args, options) {
  return new Promise ((resolve, reject) => {
    if (args.projectName == null) {
      let userId = confStore.get('userId')
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
    github.checkRepo(options, function (repo) {
      resolve(repo)
    })
  })
}

function selectRepo(login) {
  return new Promise ((resolve, reject) => {
    github.getRepos(login, function (data) {
      let repoArray = []
      data.forEach(repo => {
        repoArray.push(repo.full_name)
        repos.set(repo.full_name, repo)
      })
      promptRepos(repoArray, (data) => {
        resolve(repos.get(data.repo))
      })
    })
  })
}

function selectLogin(orgs) {
  return new Promise ((resolve, reject) => {
    let orgArray = [confStore.get('login')]
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
      default: [confStore.get('userId')],
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
  return new Promise ((resolve, reject) => {
    var data = {
      name: repo.name,
      full_name: repo.full_name,
      owner: confStore.get('userId'),
      html_url: repo.html_url,
      git_url: repo.git_url,
      provider: "github"
    }
    confStore.set(conf.LAST_ADDED_PROJECT, repo.full_name)
    awProject.addProject(data).then(res => {
      if (res != null) {
        resolve(res.data.projectId)
      }
    }).catch(err => {
      console.error(err)
      confStore.delete(conf.LAST_ADDED_PROJECT)
      reject(err)
    })
  })
}

function showProjects (projects) {
  console.log(chalk.bold.yellow(confStore.get('login')) + chalk.yellow('\'' + ' Project list >'))
  projects.forEach((project, i) => {
    makeProjectFormat(project, i)
  })
}

function makeProjectFormat (project, index) {
  console.log(index + '. ' + chalk.green(`${project.full_name}`))
}

function showAddProjectDoneMsg (projectName, projectId) {
  console.log(chalk.bold.green(`${projectName}`) + ' is successfully added.')
}