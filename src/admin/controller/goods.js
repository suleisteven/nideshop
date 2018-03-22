const Base = require('./base.js');
const Config = require('../../common/config/config');
const Upload = require('./upload.js');

module.exports = class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const name = this.get('name') || '';

    const model = this.model('goods');
    const data = await model.where({name: ['like', `%${name}%`]}).order(['id DESC']).page(page, size).countSelect();

    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('goods');
    const data = await model.where({id: id}).find();

    try{
      data.goods_desc = JSON.parse(data.goods_desc);

      data.goods_desc.map((item, index)=>{
          if(!item.startsWith("http")) // 处理相对路径
          {
            item = Config.imgUrlPrefix + item;
            data.goods_desc[index] = item;
          }
      });

    }catch(e)
    {
      data.goods_desc = [];
    }

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('goods');
    values.is_on_sale = values.is_on_sale ? 1 : 0;
    values.is_new = values.is_new ? 1 : 0;
    values.is_hot = values.is_hot ? 1 : 0;

    values.goods_desc = JSON.stringify(values.goods_desc);

    

    if (id > 0) {
      await model.where({id: id}).update(values);
    } else {
      delete values.id;
      await model.add(values);
    }

    // 删除服务器中的图片文件
    Upload.deleteImg(values.deletedDescPics);

    return this.success(values);
  }

  async destoryAction() {
    const id = this.post('id');
    await this.model('goods').where({id: id}).limit(1).delete();
    // TODO 删除图片

    return this.success();
  }
};
