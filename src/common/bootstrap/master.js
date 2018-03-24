// invoked in master
console.log("Manster process starting");

const FileUtil = require('../fileutil');

FileUtil.clearTmpImg(); // 清空临时目录

FileUtil.initImgDir(); // 初始化目录

console.log("Manster process started");