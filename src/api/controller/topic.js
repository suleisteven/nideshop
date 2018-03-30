const Base = require('./base.js');

module.exports = class extends Base {
  async listAction() {
    const model = this.model('topic');
    const data = await model.field(['id', 'title', 'price_info', 'scene_pic_url', 'subtitle']).where({is_show:1}).page(this.get('page') || 1, this.get('size') || 10).countSelect();

    return this.success(data);
  }

  async detailAction() {
    const model = this.model('topic');
    const data = await model.where({id: this.get('id')}).find();

      // 处理商品图片详情，转换为前端能识别的h5标签
      try{
        data.content = JSON.parse(data.content);
      }catch(e)
      {
        data.content = [];
      }

      let tmpDesc = "";
      data.content.map((item)=>{

          if(!item.startsWith("http")) // 处理相对路径
          {
            item = Config.imgUrlPrefix + item;
          }

          tmpDesc += '<p><img src="' + item + '"/></p>';
      });
      data.content = tmpDesc;

    return this.success(data);
  }

  async relatedAction() {
    const model = this.model('topic');
    const data = await model.field(['id', 'title', 'price_info', 'scene_pic_url', 'subtitle']).limit(4).select();

    return this.success(data);
  }
};
