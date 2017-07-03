
var chalk       = require('chalk');
var CLI         = require('clui');
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var Spinner     = CLI.Spinner;
var ApiWay  = require('apiway.js')
let aw = new ApiWay({});
let awProject = aw.getProject();
let awInstance = aw.getInstance();
let awSchedule = aw.getSchedule();
var Configstore = require('configstore');
var pkg         = require('../package.json')
const conf = require('../util/config')
const confStore = new Configstore(pkg.name, {});

exports.getProjectsByUser = function (userId) {
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

function getProject (projectId) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Getting a project ...');
    status.start();
    awProject.getProject(projectId).then(res => {
      if (res != null) {
        status.stop()
        confStore.set(conf.LAST_SELECTED_PROJECT, res.data.data.full_name)
        resolve(res.data.data)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

function selectProject (projects) {
  return new Promise ((resolve, reject) => {
    var tmpProjects = new Map();
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

function getSchedulesByProject (project) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Getting schedules ...');
    status.start();
    awSchedule.getSchedulesByProject(project._id).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data.schedules)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
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

function getSchedulesByUser (userId) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Getting schedules ...');
    status.start();
    awSchedule.getSchedulesByUser(userId).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data.schedules)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

exports.getProject = getProject
exports.promptProjects = promptProjects
exports.getSchedulesByProject  = getSchedulesByProject
exports.getSchedulesByUser = getSchedulesByUser
exports.selectProject  = selectProject
