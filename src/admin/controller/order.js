const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const orderSn = this.get('orderSn') || '';
    const consignee = this.get('consignee') || '';

    const model = this.model('order');
    const data = await model.where({order_sn: ['like', `%${orderSn}%`], consignee: ['like', `%${consignee}%`]}).order(['id DESC']).page(page, size).countSelect();
    const newList = [];
    for (const item of data.data) {
      item.order_status_text = await this.model('order').getOrderStatusText(item.id);
      newList.push(item);
    }
    data.data = newList;
    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('order');

    const orderInfos = await model.field('nideshop_order.*,nideshop_region.name').join('nideshop_region ON nideshop_order.province = nideshop_region.id OR nideshop_order.city = nideshop_region.id OR nideshop_order.district = nideshop_region.id').where({'nideshop_order.id': id}).select();

    if(think.isEmpty(orderInfos))
    {
      return this.fail('订单不存在');
    }
    let orderInfo = orderInfos[0];

    let orderStatusText = await model.getOrderStatusText(id);
    orderInfo.orderStatusText = orderStatusText;

    let detailAddress = '';
    for(let i=0;i<orderInfos.length;++i)
    {
      detailAddress += orderInfos[i].name;
    }
    detailAddress += orderInfo.address;
    orderInfo.detailAddress = detailAddress; // 返回详细地址

    const goodsInfos = await this.model('order_goods').field('nideshop_goods.*').join('nideshop_goods ON nideshop_order_goods.goods_id = nideshop_goods.id').where({'nideshop_order_goods.order_id': id}).select();
    orderInfo.goodsInfos = goodsInfos;
    // const data = await model.where({id: id}).find();

    return this.success(orderInfo);
  }

  async orderStatusToTextAction() {

    
    const status = this.get('order_status');
    let orderStatusText = this.model('order').orderStatusToText(parseInt(status));
    return this.success(orderStatusText);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('order');

    if (id > 0 && !think.isEmpty(values.order_status)) {
      await model.where({id: id}).update({order_status: parseInt(values.order_status)});
    }else{
      return this.fail("订单错误");
    }
    
    return this.success(values);
  }

  async destoryAction() {
    const id = this.post('id');
    await this.model('order').where({id: id}).limit(1).delete();

    // 删除订单商品
    await this.model('order_goods').where({order_id: id}).delete();

    // TODO 事务，验证订单是否可删除（只有失效的订单才可以删除）

    return this.success();
  }
};
