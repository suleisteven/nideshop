const fs = require('fs');
const Util = require('./util');
const Config = require('./config/config');

module.exports = class FileUtil {

    /**
     * 将图片移动到正式目录，该函数会自动检测图片是否在临时目录
     * @param {单个图片或者图片集合} imgUrls 
     */
    static moveTmpImgToFinal(imgUrls) {

        let results = [];
        if (imgUrls) {
            if (Util.isArray(imgUrls)) {
                imgUrls.map((url) => {
                    let result = this._moveSingleTmpImgToFinal(url);
                    if (result) {
                        results.push(result);
                    }
                });
            } else {
                let result = this._moveSingleTmpImgToFinal(imgUrls);

                if (result) {
                    results.push(result);
                }
            }
        }
        return results;
    }

    /**
     * 删除图片
     * @param {单个图片或者图片集合} imgUrls 
     */
    static deleteImg(imgUrls) {

        if (imgUrls) {
            if (Util.isArray(imgUrls)) {
                imgUrls.map((url) => {

                    this._deleteSingleImg(url);
                });
            } else {
                this._deleteSingleImg(imgUrls);
            }
        }
    }

    /**
     * 初始化图片目录
     */
    static initImgDir()
    {
        let finalDirPath = think.ROOT_PATH + Config.imgRootPath + Config.imgFileTmpRelateDir;
        let tmpDirPath = think.ROOT_PATH + Config.imgRootPath + Config.imgFileRelateDir;
        if (!fs.existsSync(finalDirPath)) {
            fs.mkdir(finalDirPath);
        }
        if (!fs.existsSync(tmpDirPath)) {
            fs.mkdir(tmpDirPath);
        }
    }

    /**
     * 清理临时文件夹
     */
    static clearTmpImg() {
        let targetDirPath = think.ROOT_PATH + Config.imgRootPath + Config.imgFileTmpRelateDir;
        this.deleteDir(targetDirPath);
    }

    static deleteDir(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    deleteDir(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }

    /**
     * 拷贝文件
     * @param {*} oriUrl 
     * @param {*} targetUrl 
     */
    static copyFile(oriUrl, targetUrl) {

    }

    static _moveSingleTmpImgToFinal(imgUrl) {
        let result = null;
        if (!imgUrl) {
            return result;
        }

        let path = "";
        let url = imgUrl;

        let index = url.indexOf(Config.imgFileTmpRelateDir); //先查找临时目录
        if (index < 0) // 不在临时目录，无需处理
        {
            return imgUrl;
        }

        let resultPrefix = "";
        if (url.startsWith("http")) {
            path = think.ROOT_PATH + Config.imgRootPath + url.substring(index, url.length);

            resultPrefix = url.substring(0, index);
        } else {
            path = url;
        }

        let fileNameTagIndex = path.lastIndexOf('/');
        if (fileNameTagIndex < 0) {
            fileNameTagIndex = path.lastIndexOf('\\');
        }

        let targetDirPath = think.ROOT_PATH + Config.imgRootPath + Config.imgFileRelateDir;
        let targetFileName = path.substring(fileNameTagIndex + 1, path.length);
        let targetFilePath = targetDirPath + targetFileName;

        think.mkdir(targetDirPath);

        fs.rename(path, targetFilePath, (err) => {

        });
        result = resultPrefix + Config.imgFileRelateDir + targetFileName;

        return result;
    }

    static _deleteSingleImg(imgUrl) {
        if (!imgUrl) {
            return;
        }
        let path = "";
        let url = imgUrl;
        if (url.startsWith("http")) {
            let index = url.indexOf(Config.imgFileTmpRelateDir); //先查找临时目录

            if (index < 0) {
                index = url.indexOf(Config.imgFileRelateDir); // 如果临时目录不存在，再查找正式目录
            }

            path = think.ROOT_PATH + Config.imgRootPath + url.substring(index, url.length);
        } else {
            path = url;
        }

        fs.exists(path, (isExists) => {
            if (isExists) {
                fs.unlinkSync(path); // 删除文件
            }
        })
    }

};


