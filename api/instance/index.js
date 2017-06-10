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
let awInstance = aw.getInstance();
var Configstore = require('configstore');
var pkg         = require('../../package.json')
const conf = require('../../util/config')
const confStore = new Configstore(pkg.name, {foo: 'bar'});
var repos = new Map();
var tmpProjects = new Map();

exports.run = function (options) {
  return new Promise ((resolve, reject) => {
    let userId = confStore.get('userId')
    if (options.list) {
      getInstancesByUser(userId).then((data) => {
        showInstancesByUser(data, userId)
        resolve()
      })
    } else if (options.project == true) {
      getProjectsByUser(userId)
        .then((projects) => selectProject(projects))
        .then((project) => runProject(project))
        .then((instance) => {
          showRunProjectResult(instance)
          resolve()
          })
    } else if (options.project != null) {
        runProjectByName(options.project)
        .then((instance) => {
          showRunProjectResult(instance)
          resolve()
        })
    } else {
      console
    }
  })
}

function getProjectsByUser (userId) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Getting projects ...');
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

function selectProject (projects) {
  return new Promise ((resolve, reject) => {
    let array = []
    projects.forEach(project => {
      if (project.full_name) {
        array.push(project.full_name)
        tmpProjects.set(project.full_name, project)
      }
    })
    promptProjects(array, (data) => {
      resolve(tmpProjects.get(data.project))
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

function promptProjects (projects, callback) {
  var questions = [
    {
      name: 'project',
      type: 'list',
      message: 'Select a project',
      choices: projects
    }
  ];
  inquirer.prompt(questions).then(callback);
}

function runProjectByName (projectName) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Running project ...');
    status.start();
    confStore.set(conf.LAST_RUN_PROJECT, projectName)
    awInstance.addInstance({full_name: projectName}).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

function runProject (project) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Running project ...');
    status.start();
    confStore.set(conf.LAST_RUN_PROJECT, project.full_name)
    awInstance.addInstance({projectId: project._id}).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

function getInstancesByProject (project) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Getting instances ...');
    status.start();
    confStore.set(conf.LAST_ADDED_PROJECT, project.full_name)
    awInstance.getInstancesByProject(project._id).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data.instances)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

function getInstancesByUser (userId) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Getting instances ...');
    status.start();
    awInstance.getInstancesByUser(userId).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data.instances)
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
  console.log('[' + chalk.bold.yellow(confStore.get('login')) + '] Project list >')
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

function showInstancesByUser (instances, userId) {
  console.log('[' + chalk.bold.yellow(confStore.get(conf.LOGIN)) + '] Run History >')
  instances.forEach((instance, i) => {
    makeInstanceFormat(instance, i)
  })
}

function makeInstanceFormat (instance, index) {
  let status
  if (instance.status == "PASS") {
    status = chalk.blue(`${instance.status}  `)
  } else if (instance.status == "FAIL") {
    status = chalk.magenta(`${instance.status}  `)
  } else if (instance.status == "BROKEN") {
    status = chalk.red(`${instance.status}`)
  } else if (instance.status == "RUNNING") {
    status = chalk.green(`${instance.status}`)
  }

  let split = chalk.blue('|')
  console.log(`${index}. ${status}${split}${instance.project.full_name}${split}id:${instance._id}${split}report:${instance.reportHtml}`)
}

function showRunProjectResult (instance) {
  console.log(chalk.bold.green(`${instance.project.full_name}`) + ' is successfully started.(InstanceID:' + chalk.blue(`${instance._id}`) + ')')
}
