const Base = require('./base.js');
const fs = require('fs');
const Config = require('../../common/config/config');
const Util = require('../../common/util');

module.exports = class extends Base {
  async brandPicAction() {
    const brandFile = this.file('pic');
    if (think.isEmpty(brandFile)) {
      return this.fail('保存失败');
    }
    const that = this;

    let params = that.post(); // 透传参数

    const fileRootRelateDir = Config.imgRootPath;
    const fileRelateDir = Config.imgFileTmpRelateDir;

    const fileDir = think.ROOT_PATH + fileRootRelateDir + fileRelateDir;
    
    think.mkdir(fileDir);

    const filename = think.uuid(32) + '.jpg';
    const is = fs.createReadStream(brandFile.path);
    const os = fs.createWriteStream(fileDir + filename);
    is.pipe(os);

    return that.success({
      name: 'pic',
      params: params,
      fileUrl: Config.imgUrlPrefix + fileRelateDir + filename
    });
  }

  async brandNewPicAction() {
    const brandFile = this.file('brand_new_pic');
    if (think.isEmpty(brandFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/brand/' + think.uuid(32) + '.jpg';

    const is = fs.createReadStream(brandFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);

    return that.success({
      name: 'brand_new_pic',
      fileUrl: 'http://127.0.0.1:8360' + filename
    });
  }

  async categoryWapBannerPicAction() {
    const imageFile = this.file('wap_banner_pic');
    if (think.isEmpty(imageFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/category/' + think.uuid(32) + '.jpg';

    const is = fs.createReadStream(imageFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);

    return that.success({
      name: 'wap_banner_url',
      fileUrl: 'http://127.0.0.1:8360' + filename
    });
  }

  async topicThumbAction() {
    const imageFile = this.file('scene_pic_url');
    if (think.isEmpty(imageFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/topic/' + think.uuid(32) + '.jpg';

    const is = fs.createReadStream(imageFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);

    return that.success({
      name: 'scene_pic_url',
      fileUrl: 'http://127.0.0.1:8360' + filename
    });
  }

  async deleteImgAction()
  {

    console.log("deleteImg");
      const params = this.post();
      const that = this;


      return that.success({
        name: 'brand_new_pic',
      });
  }

};
