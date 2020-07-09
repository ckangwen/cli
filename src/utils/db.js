const low = require('lowdb')
const path = require('path')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(path.resolve(__dirname, '../../db.json'))
const db = low(adapter)

const initState = {
  shas: {},
  project: [],
  version: ''
}

db.defaults(initState).write()

exports.init = function init(name) {
  db.set(name, initState[name]).write()
}


exports.setDB = function setDB(name, key, value) {
  let stream = db
  const paths = name.split('.')
  paths.forEach(item => {
    stream = stream.get(item)
  })
  if (value) {
    stream.set(key, value).write()
  } else {
    stream.push(key).write()
  }
}


exports.getDB = function getDB(name, key, value) {
  let stream = db
  const paths = name.split('.')
  paths.forEach(item => {
    stream = stream.get(item)
  })
  if (!key) {
    return stream.value()
  } else if (value) {
    return stream.find({key, value}).value()
  } else {
    stream.find(key).value()
  }
}

exports.size = function size(name) {
  let stream = db
  const paths = name.split('.')
  paths.forEach(item => {
    stream = stream.get(item)
  })
  return stream.size().value()
}
