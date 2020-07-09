const github = require('octonode')
const token = require('../config/token')
const client = github.client(token)
const db = require('./db')
const { error } = require('./log')
const config = require('../config')
const ora = require('ora')

function getRepoUrl(repoName) {
  return `https://api.github.com/repos/ckangwen/${repoName}/contents/src`
}

exports.storageRepoData = function storageRepoData(command) {
  const repo = config[command]
  const repoUrl = getRepoUrl(repo)
  const spinner = ora(`正在连接 ${repo}`).start();
  client.get(repoUrl, {}, (err, status, body) => {
    if (err) {
      spinner.stop()
      error('仓库连接失败，请稍后重试\n')
      process.exit()
    } else {
      console.log(body)
      spinner.stop()
      const projects = body.map(item => item.name)
      db.init(command)
      db.setDB(command, projects)
    }
  })
}
