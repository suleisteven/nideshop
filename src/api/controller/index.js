const Base = require('./base.js');

module.exports = class extends Base {
  // async indexAction() {
  //   const banner = await this.model('ad').where({ad_position_id: 1}).select();
  //   const channel = await this.model('channel').order({sort_order: 'asc'}).select();
  //   const newGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({is_new: 1}).limit(4).select();
  //   const hotGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price', 'goods_brief']).where({is_hot: 1}).limit(3).select();
  //   const brandList = await this.model('brand').where({is_new: 1}).order({new_sort_order: 'asc'}).limit(4).select();
  //   const topicList = await this.model('topic').limit(3).select();

  //   const categoryList = await this.model('category').where({parent_id: 0, name: ['<>', '推荐']}).select();
  //   const newCategoryList = [];
  //   for (const categoryItem of categoryList) {
  //     const childCategoryIds = await this.model('category').where({parent_id: categoryItem.id}).getField('id', 100);
  //     const categoryGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({category_id: ['IN', childCategoryIds]}).limit(7).select();
  //     newCategoryList.push({
  //       id: categoryItem.id,
  //       name: categoryItem.name,
  //       goodsList: categoryGoods
  //     });
  //   }

  //   return this.success({
  //     banner: banner,
  //     channel: channel,
  //     newGoodsList: newGoods,
  //     hotGoodsList: hotGoods,
  //     brandList: brandList,
  //     topicList: topicList,
  //     categoryList: newCategoryList
  //   });
  // }


  async indexAction() {
    const banner = await this.model('ad').where({enabled:1}).order({ad_position_id: 'asc'}).select();
    //const channel = await this.model('channel').order({sort_order: 'asc'}).select();
    //const newGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({is_new: 1}).limit(4).select();


    //const hotGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price', 'goods_brief']).where({is_hot: 1}).limit(3).select();

    // 推荐商品改为随机推荐8条
    const hotGoods = await this.model().query('select id,name,list_pic_url,retail_price,goods_brief from nideshop_goods where is_on_sale=1 order by rand() limit 8');

    //const brandList = await this.model('brand').where({is_new: 1}).order({new_sort_order: 'asc'}).limit(4).select();
    //const topicList = await this.model('topic').limit(3).select();

    const categoryList = await this.model('category').where({parent_id: 0, name: ['<>', '推荐']}).order(['sort_order ASC']).select();
    const newCategoryList = [];

    for (const categoryItem of categoryList) {
      const childCategoryIds = await this.model('category').where({parent_id: categoryItem.id}).getField('id', 100);

      let categoryGoods = [];
      if(childCategoryIds.length>0)
      {
        categoryGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({category_id: ['IN', childCategoryIds], is_on_sale:1}).limit(7).select();
      }
      newCategoryList.push({
        id: categoryItem.id,
        name: categoryItem.name,
        goodsList: categoryGoods
      });
    }

    // {
    //   const categoryGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({stock_type: 1}).limit(7).select();
    //   newCategoryList.push({
    //     id: 1,
    //     name: "海外产地直达",
    //     goodsList: categoryGoods
    //   });
    // }
    
    // {
    //   const categoryGoods = await this.model('goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({stock_type: 0}).limit(7).select();
    //   newCategoryList.push({
    //     id: 0,
    //     name: "Amazon海淘直达",
    //     goodsList: categoryGoods
    //   });
    // }
      
    

    // return this.success({
    //   banner: banner,
    //   channel: channel,
    //   newGoodsList: newGoods,
    //   hotGoodsList: hotGoods,
    //   brandList: brandList,
    //   topicList: topicList,
    //   categoryList: newCategoryList
    // });

    return this.success({
      banner: banner,
      channel: [],
      newGoodsList: [],
      hotGoodsList: hotGoods,
      brandList: [],
      topicList: [],
      categoryList: newCategoryList
    });
  }
};
