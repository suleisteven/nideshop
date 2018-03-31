const Base = require('./base.js');
const Config = require('../../common/config/config');
const Upload = require('./upload.js');
const FileUtil = require('../../common/fileutil');

module.exports = class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const name = this.get('name') || '';

    const model = this.model('ad');
    const data = await model.where({name: ['like', `%${name}%`]}).order(['ad_position_id ASC']).page(page, size).countSelect();

    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('ad');
    const data = await model.where({id: id}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    let movedPosterImgs = FileUtil.moveTmpImgToFinal(values.image_url); // 将封面移动到正式目录
    if(movedPosterImgs && movedPosterImgs.length>0)
    {
      values.image_url = movedPosterImgs[0];
    }

    const model = this.model('ad');
    values.enabled = values.enabled ? 1 : 0;
    if (id > 0) {
      await model.where({id: id}).update(values);
    } else {
      delete values.id;
      await model.add(values);
    }

    // 删除服务器中的详情图片文件
    FileUtil.deleteImg(values.deletedPics);

    return this.success(values);
  }

  async destoryAction() {
    const id = this.post('id');

    let obj = await this.model('ad').where({id: id}).limit(1).find();
    if(obj)
    {

      // 删除封面
      FileUtil.deleteImg(obj.image_url);
      this.model('ad').where({id: id}).limit(1).delete();
    }

    return this.success();
  }
};
