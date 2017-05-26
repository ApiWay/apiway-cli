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

exports.add  = function (repo) {
  return new Promise ((resolve, reject) => {
    github.getOrgs()
    .then((orgs) => selectLogin(orgs))
    .then((login) => selectRepo(login))
    .then(() => {
      resolve()
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
        resolve(data)
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
