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
    const size = this.get('size') || 20;
    const name = this.get('name') || '';
    const category_id = this.get('category_id') || '';
    const sortChecked = this.get('sortChecked') || 0;
    const goodsTypeSelected = this.get('goodsTypeSelected') || 0;
    

    const model = this.model('goods');

    const params = {name: ['like', `%${name}%`]};
    if(!think.isEmpty(category_id))
    {
      params.category_id=category_id;
    }

    if(!think.isEmpty(goodsTypeSelected))
    {
      params.stock_type = goodsTypeSelected;
    }
    
    let sortParams = [];
    if(sortChecked==0)
    {
      sortParams = ['sort_order ASC'];
    }else{
      sortParams = ['id DESC'];
    }

    

    const data = await model.where(params).order(sortParams).page(page, size).countSelect();

    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('goods');

    const data = await model.where({id: id}).find();
    const gallery = await this.model('goods_gallery').where({goods_id: id}).limit(8).select();

    data.gallery = gallery;
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

    
    if(!think.isEmpty(data.attribute))
    {
      try{
        data.attribute = JSON.parse(data.attribute);
      }catch(e)
      {
        data.attribute = [];
      }
    }else{
      data.attribute = [];
    }
   

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    let id = this.post('id');

    const model = this.model('goods');
    values.is_on_sale = values.is_on_sale ? 1 : 0;
    values.is_new = values.is_new ? 1 : 0;
    values.is_hot = values.is_hot ? 1 : 0;

    values.brand_id = 0; // 品牌id不需要
    
    values.goods_desc = FileUtil.moveTmpImgToFinal(values.goods_desc); // 将商品详情图片移动到正式目录

    let movedPosterImgs = FileUtil.moveTmpImgToFinal(values.list_pic_url); // 将商品封面移动到正式目录
    if(movedPosterImgs && movedPosterImgs.length>0)
    {
      values.list_pic_url = movedPosterImgs[0];
    }

    values.goods_desc = JSON.stringify(values.goods_desc);
    values.attribute = JSON.stringify(values.attribute);
    
    if (id > 0) {
      await model.where({id: id}).update(values);
    } else {
      delete values.id;
      id = await model.add(values);
    }

    // 更新商品banner
    const gallery = values.gallery;
    if(gallery)
    {
      gallery.map((item)=>{


        let galleryModel = this.model('goods_gallery');
        item.goods_id = id;

        let movedImgs = FileUtil.moveTmpImgToFinal(item.img_url); // 将商品banner移动到正式目录
        if(movedImgs && movedImgs.length>0)
        {
          item.img_url = movedImgs[0];
        }

        if(item.id >0 )
        {
          galleryModel.where({goods_id: item.goods_id}).update(item);
        }else{
          galleryModel.add(item);
        }
      });
    }

    
    if(values.deletedGalleries && values.deletedGalleries.length>0)
    {
      let deletedGalleryPics = [];
      values.deletedGalleries.map((item)=>{
        
        if(item.id>0)
        {
          this.model('goods_gallery').where({id: item.id}).limit(1).delete();
        }
        deletedGalleryPics.push(item.img_url);
      });

        // 删除服务器中的商品banner图片文件
        FileUtil.deleteImg(deletedGalleryPics);
    }
  

    // 删除服务器中的详情图片文件
    FileUtil.deleteImg(values.deletedDescPics);

    return this.success(values);
  }

  async destoryAction() {
    const id = this.post('id');
    let obj = await this.model('goods').where({id: id}).limit(1).find();
    // TODO 删除图片

    if(obj)
    {

      // 删除封面
      FileUtil.deleteImg(obj.list_pic_url);

      // 删除详情
      try{
        obj.goods_desc = JSON.parse(obj.goods_desc);
      }catch(e)
      {
        obj.goods_desc = [];
      }
      FileUtil.deleteImg(obj.goods_desc);

      // 删除banner
      const gallery = await this.model('goods_gallery').where({goods_id: id}).select();

      if(gallery)
      {
        gallery.map((item)=>{
          FileUtil.deleteImg(item.img_url);
        });

        this.model('goods_gallery').where({goods_id: id}).delete(); // 删除banner数据
      }

      this.model('goods').where({id: id}).limit(1).delete(); // 删除商品数据
    }
    return this.success();
  }
};
