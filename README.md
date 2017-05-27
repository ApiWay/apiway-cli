# apiway-cli

CLI for apiway.io

![ApiWay Tech. Stack](https://github.com/ApiWay/apiway-cli/blob/master/docs/img/apiway_tech_stack.png)


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
