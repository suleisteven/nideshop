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

    const model = this.model('topic');
    const data = await model.where({title: ['like', `%${name}%`]}).order(['id DESC']).page(page, size).countSelect();

    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('topic');
    const data = await model.where({id: id}).find();

    try{
      data.content = JSON.parse(data.content);
      data.content.map((item, index)=>{
          if(!item.startsWith("http")) // 处理相对路径
          {
            item = Config.imgUrlPrefix + item;
            data.content[index] = item;
          }
      });
    }catch(e)
    {
      data.content = [];
    }

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    values.content = FileUtil.moveTmpImgToFinal(values.content); // 将详情图片移动到正式目录

    let movedPosterImgs = FileUtil.moveTmpImgToFinal(values.scene_pic_url); // 将封面移动到正式目录
    if(movedPosterImgs && movedPosterImgs.length>0)
    {
      values.scene_pic_url = movedPosterImgs[0];
    }

    values.content = JSON.stringify(values.content);

    const model = this.model('topic');
    values.is_show = values.is_show ? 1 : 0;
    values.is_new = values.is_new ? 1 : 0;
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
    let obj = await this.model('topic').where({id: id}).limit(1).find();
    if(obj)
    {

      // 删除封面
      FileUtil.deleteImg(obj.scene_pic_url);

      // 删除详情
      try{
        obj.content = JSON.parse(obj.content);
      }catch(e)
      {
        obj.content = [];
      }
      FileUtil.deleteImg(obj.content);

      this.model('topic').where({id: id}).limit(1).delete();
    }

    return this.success();
  }
};
