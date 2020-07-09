const { info } = require('./utils/log')
const { cyan } = require('chalk')
const db = require('./utils/db')

function list() {
  let str = ''
  str += 'project:\n'

  db.getDB('project').forEach(item => {
    str += `  ${item}\n`
  })
  console.log(cyan(str))
}

module.exports = list