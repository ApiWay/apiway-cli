![logo](https://github.com/ApiWay/apiway-design/blob/master/img/logo.png)
# ApiWay: CLI
Command Line Interface for apiway.io

![ApiWay CLI](https://github.com/ApiWay/apiway-cli/blob/master/docs/img/apiway-cli.gif)

## Installation
```shell
$ npm install apiway-cli -g
```

## Usage
### Login
Default git provider is Github
```shell
$ apiway login
```
### Add
: Command to add a project
Dialog mode
```shell
$ apiway add
```
You can specify a repository name
(default owner is authenticated user)
```shell
$ apiway add -r repo
```
You can specify a owner name
```shell
$ apiway add -o owner
```
You can specify both repository and owner
```shell
$ apiway add -r repo -o owner
```

### Run
: Command to run a project

Dialog mode
```shell
$ apiway run 
```
You can specify a project name
```shell
$ apiway run -p project
```
Show running projects
```shell
$ apiway run -l
```
### Project
Show added projects.
```shell
$ apiway project -d
```

![ApiWay Tech. Stack](https://github.com/ApiWay/apiway-cli/blob/master/docs/img/apiway_tech_stack.png)


## Related Projects
#### Web App
* [apiway-web](https://github.com/ApiWay/apiway-web)
#### API
* [apiway-api](https://github.com/ApiWay/apiway-api)
#### SDK
##### Javascript
* [apiway-sdk-js](https://github.com/ApiWay/apiway-sdk-js)
* [npm: apiway.js](https://www.npmjs.com/package/apiway.js)
#### Job
* [apiway-job](https://github.com/ApiWay/apiway-job)
#### Cloud (Kubernetes)
* [apiway-cloud-orchestration](https://github.com/ApiWay/apiway-cloud-orchestration)
#### Design
* [apiway-design](https://github.com/ApiWay/apiway-design)
