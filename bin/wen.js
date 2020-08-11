#! /usr/bin/env node
const { Command } = require('commander');
const commander = new Command();
const version = require('../package.json').version
const project = require('../src/project')
const list = require('../src/list')
const style = require('../src/style')
const db = require('../src/utils/db')

commander.version(version)
  .option('-p, --project <name>', 'clone application template')
  .option('-l, --list', 'show list')
  .option('-s, --style', 'crawle element style')

commander
  .command('project <name> [options]')
  .description('添加组件 -c 添加页面 -p')
  .action((name, output) => {
    project(name, output)
  })


  commander
  .command('list')
  .description('查看列表')
  .action((name, options) => {
    list()
  })

  commander
  .command('style <url> <selector> [output]')
  .description('爬取网页元素的css样式')
  .action((url, selector, output) => {
    style(url, selector, output)
  })

commander.parse(process.argv);