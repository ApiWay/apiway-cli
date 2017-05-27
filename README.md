# apiway-cli

CLI for apiway.io

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
### Add a project
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
$ apiway project -r repo -o owner
```

