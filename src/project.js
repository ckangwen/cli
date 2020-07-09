const db = require('./utils/db')
const inquirer = require('inquirer')
const ora = require('ora')
const download = require('download-git-repo')
const { error, info } = require('./utils/log')
const { storageRepoData } = require('./utils/github')
const config = require('./config')


async function project(name, output) {
  if (db.size('project') <= 0) {
    info('初次连接，正在检索仓库...')
    await storageRepoData('project')
  }
  const projects = db.getDB('project')
  if (projects.indexOf(name) < 0) {
    error(`${name} 不存在于仓库中！`)
    process.exit()
  }
  if (name) {
    downloadFile(name)
  } else {
    const questions = [{
      type: 'input',
      name: 'name',
      message: 'template name',
    }];

    inquirer.prompt(questions).then(function (answers) {
      const projectName = answers.name
      downloadFile(projectName)
    });
  }
}

function downloadFile(projectName) {
  const spinner = ora(`Loading ${projectName}`).start();
  const repoUrl = config['project']
  //下载项目
  download(repoUrl, `src/${projectName}`, function (err) {
    if (!err) {
      spinner.stop()
      info(`${projectName} download success.`);
    } else {
      error('下载失败');
    }
  });
}

module.exports = project