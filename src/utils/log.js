const { green, cyan, red } = require('chalk');
const path = require('path');
const fs = require('fs');
const version = require('../../package.json').version

exports.help = () => {
  console.log(green('Usage :'));
  console.log();
  console.log(green('1. wen project <options>           生成应用模版'));

  console.log();
}

exports.version = () => {
  console.log();
  console.log(green('Version : ' + version));
  console.log();
  process.exit();
}

exports.info = (msg) => {
  console.log(cyan("Info : " + msg));
}

exports.error = (msg) => {
  console.log(red("Error : " + msg));
}
