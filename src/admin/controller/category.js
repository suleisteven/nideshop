const Base = require('./base.js');
const Config = require('../../common/config/config');
const FileUtil = require('../../common/fileutil');

module.exports = class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    const model = this.model('category');
    // const data = await model.where({is_show: 1}).order(['sort_order ASC']).select();
    const data = await model.order(['sort_order ASC']).select();
    const topCategory = data.filter((item) => {
      return item.parent_id === 0;
    });
    const categoryList = [];
    topCategory.map((item) => {
      item.level = 1;
      categoryList.push(item);
      data.map((child) => {
        if (child.parent_id === item.id) {
          child.level = 2;
          categoryList.push(child);
        }
      });
    });
    return this.success(categoryList);
  }

  async topCategoryAction() {
    
    const model = this.model('category');
    const data = await model.where({parent_id: 0}).order(['sort_order ASC','id ASC']).select();

    return this.success(data);
  }


  async cascaderAction()
  {
      const model = this.model('category');
      //const data = await model.where({is_show: 1}).order(['sort_order ASC']).select();
      const data = await model.order(['sort_order ASC']).select();
      const topCategory = data.filter((item) => {
          return item.parent_id === 0;
      });
      const categoryList = [];
      topCategory.map((item) => {
          item.level = 1;
          //categoryList.push(item);
          item.children = [];
          data.map((child) => {
              if (child.parent_id === item.id) {
                  child.level = 2;
                  item.children.push(child);
                  //categoryList.push(child);
              }
          });
      });
      return this.success(topCategory);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('category');
    const data = await model.where({id: id}).order(['sort_order ASC']).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');


    let movedPosterImgs = FileUtil.moveTmpImgToFinal(values.wap_banner_url); // 将封面移动到正式目录
    if(movedPosterImgs && movedPosterImgs.length>0)
    {
      values.wap_banner_url = movedPosterImgs[0];
    }

    let movedPayQRCodeImgs = FileUtil.moveTmpImgToFinal(values.pay_qrcode); // 将收款码移动到正式目录
    if(movedPayQRCodeImgs && movedPayQRCodeImgs.length>0)
    {
      values.pay_qrcode = movedPayQRCodeImgs[0];
    }

    if(id==0)
    {
      values.level = 'L1';
    }else{
      values.level = 'L2';
    }

    const model = this.model('category');
    values.is_show = values.is_show ? 1 : 0;
    if (id > 0) {
      await model.where({id: id}).update(values);
    } else {
      delete values.id;
      await model.add(values);
    }
    return this.success(values);
  }

  async destoryAction() {
    const id = this.post('id');

    let obj = await this.model('category').where({id: id}).limit(1).find();

    // 删除封面
    FileUtil.deleteImg(obj.wap_banner_url);

    await this.model('category').where({id: id}).limit(1).delete();

    return this.success();
  }
};
