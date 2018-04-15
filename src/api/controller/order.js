const Base = require('./base.js');
const moment = require('moment');
const Config = require('../../common/config/config');

module.exports = class extends Base {
  /**
   * 获取订单列表
   * @return {Promise} []
   */
  async listAction() {
    const orderList = await this.model('order').where({ user_id: think.userId }).order(['id DESC']).page(1, 10).countSelect();
    const newOrderList = [];
    for (const item of orderList.data) {
      // 订单的商品
      item.goodsList = await this.model('order_goods').where({ order_id: item.id }).select();
      item.goodsCount = 0;
      item.goodsList.forEach(v => {
        item.goodsCount += v.number;
      });

      // 订单状态的处理
      item.order_status_text = await this.model('order').getOrderStatusText(item.id);

      // 可操作的选项
      item.handleOption = await this.model('order').getOrderHandleOption(item.id);

      newOrderList.push(item);
    }
    orderList.data = newOrderList;

    return this.success(orderList);
  }

  /**
   * 取消订单
   */
  async cancelAction()
  {
    const orderId = this.get('orderId');
    const model = this.model('order');
    const orderInfo = await model.where({ user_id: think.userId, id: orderId }).find();

    if (think.isEmpty(orderInfo)) {
      return this.fail('订单不存在');
    }

    // 订单为0和1，客服未确认状态时，可以取消
    if(orderInfo.order_status<=1)
    {
      await model.where({id: orderId}).update({order_status: 98});
    }else{
      return this.fail("当前订单已无法取消");
    }
    
    return this.success(orderId);
  }

  /**
   * 确认收货
   */
  async confirmAction()
  {
    const orderId = this.get('orderId');
    const model = this.model('order');
    const orderInfo = await model.where({ user_id: think.userId, id: orderId }).find();

    if (think.isEmpty(orderInfo)) {
      return this.fail('订单不存在');
    }

    // 订单为3，已发货时，可以确认收货
    if(orderInfo.order_status==3)
    {
      await model.where({id: orderId}).update({order_status: 9}); // 变为交易完成
    }else{
      return this.fail("当前订单已无法确认收货");
    }
    
    return this.success(orderId);
  }

  async detailAction() {
    const orderId = this.get('orderId');
    const orderInfo = await this.model('order').where({ user_id: think.userId, id: orderId }).find();

    if (think.isEmpty(orderInfo)) {
      return this.fail('订单不存在');
    }


    orderInfo.province_name = await this.model('region').where({ id: orderInfo.province }).getField('name', true);
    orderInfo.city_name = await this.model('region').where({ id: orderInfo.city }).getField('name', true);
    orderInfo.district_name = await this.model('region').where({ id: orderInfo.district }).getField('name', true);
    orderInfo.full_region = orderInfo.province_name + orderInfo.city_name + orderInfo.district_name;

    const latestExpressInfo = await this.model('order_express').getLatestOrderExpress(orderId);
    orderInfo.express = latestExpressInfo;

    const orderGoods = await this.model('order_goods').where({ order_id: orderId }).select();

    if(orderGoods && orderGoods.length>0)
    {

      let orderGoodsInfo = orderGoods[0];

      // 商家联系方式及收款码

      const goodsInfo = await this.model('goods').field('nideshop_goods.*').join('nideshop_order_goods ON nideshop_order_goods.goods_id = nideshop_goods.id').where({'nideshop_order_goods.goods_id': orderGoodsInfo.goods_id}).find();

      await this.model('goods').where({id: goodsInfo.category_id}).find();
      const category = await this.model('category').where({id: goodsInfo.category_id}).find();
      const categoryRoot = await this.model('category').where({id: category.parent_id}).find();
      orderInfo.seller_contact = categoryRoot.seller_contact;
      orderInfo.pay_qrcode = categoryRoot.pay_qrcode;
    }else{
      orderInfo.seller_contact = '';
      orderInfo.pay_qrcode = null;
    }

    // 订单状态的处理
    orderInfo.order_status_text = await this.model('order').getOrderStatusText(orderId);
    orderInfo.add_time = moment.unix(orderInfo.add_time*1000).format('YYYY-MM-DD HH:mm:ss');
    orderInfo.final_pay_time = moment('001234', 'Hmmss').format('mm:ss');
    // 订单最后支付时间
    if (orderInfo.order_status === 0) {
      // if (moment().subtract(60, 'minutes') < moment(orderInfo.add_time)) {
      orderInfo.final_pay_time = moment('001234', 'Hmmss').format('mm:ss');
      // } else {
      //     //超过时间不支付，更新订单状态为取消
      // }
    }

    orderInfo.freight_price = '根据实际情况收取,详情咨询客服';

    // 订单可操作的选择,删除，支付，收货，评论，退换货
    const handleOption = await this.model('order').getOrderHandleOption(orderId);

    return this.success({
      orderInfo: orderInfo,
      orderGoods: orderGoods,
      handleOption: handleOption
    });
  }

  /**
   * 提交订单
   * @returns {Promise.<void>}
   */
  async submitAction() {
    // 获取收货地址信息和计算运费
    const addressId = this.post('addressId');
    const checkedAddress = await this.model('address').where({ id: addressId }).find();
    if (think.isEmpty(checkedAddress)) {
      return this.fail('请选择收货地址');
    }
    const freightPrice = 0.00;

    // 获取要购买的商品

    this.model('goods').where()

    const checkedGoodsList = await this.model('cart').field('nideshop_cart.*,nideshop_goods.stock_type,nideshop_goods.goods_number,nideshop_goods.name').join('nideshop_goods ON nideshop_goods.id=nideshop_cart.goods_id').where({'nideshop_cart.user_id': think.userId, 'nideshop_cart.session_id':1, 'nideshop_cart.checked':1}).select();
    //const checkedGoodsList = await this.model('cart').where({ user_id: think.userId, session_id: 1, checked: 1 }).select();
    if (think.isEmpty(checkedGoodsList)) {
      return this.fail('请选择商品');
    }

    for (const cartItem of checkedGoodsList) {
      
      if(cartItem.goods_number < cartItem.number || cartItem.number > Config.maxNumberOfGoodsInOrder) // 库存不足
      {
        return this.fail('商品' + cartItem.name + '库存不足');
      }
    }

    // 获取订单使用的优惠券
    const couponId = this.post('couponId');
    const couponPrice = 0.00;
    if (!think.isEmpty(couponId)) {

    }

    let denmarkGoodsList = []; // 丹麦海外直邮的商品
    let amazonGoodsList = []; // 亚马逊海外代购的商品
    let otherGoodsList = []; // 其他的商品
    let allGoodsList = []; // 所有已分组商品集合

    // 对商品分类
    for (const cartItem of checkedGoodsList) {

      if(cartItem.stock_type==0) // 亚马逊代购
      {
        amazonGoodsList.push(cartItem);
      }else if(cartItem.stock_type==1) // 丹麦直邮
      {
        denmarkGoodsList.push(cartItem);
      }else // 其他
      {
        otherGoodsList.push(cartItem);
      }
    }
    allGoodsList.push(denmarkGoodsList);
    allGoodsList.push(amazonGoodsList);
    allGoodsList.push(otherGoodsList);


    let orderInfos = []; // 最后的订单结果信息集合

    // 开启事务，插入订单信息和订单商品
    const model = this.model('order');
    for(let i=0;i<allGoodsList.length;++i)
    {
      let curGoodsList = allGoodsList[i];
      if(curGoodsList.length ==0 )
      {
        continue;
      }

       // 统计总价
      let goodsTotalPrice = 0.00;
      for(let j=0;j<curGoodsList.length;++j)
      {
        let cartItem = curGoodsList[j];
        goodsTotalPrice += cartItem.number * cartItem.retail_price;
      }

      // 订单价格计算
      //const orderTotalPrice = goodsTotalPrice + freightPrice - couponPrice; // 订单的总价
      const orderTotalPrice = goodsTotalPrice + freightPrice; // 订单的总价
      const actualPrice = orderTotalPrice - 0.00; // 减去其它支付的金额后，要实际支付的金额
      const currentTime = parseInt(this.getTime() / 1000);

      const orderInfo = {
        order_sn: this.model('order').generateOrderNumber(),
        user_id: think.userId,

        // 收货地址和运费
        consignee: checkedAddress.name,
        mobile: checkedAddress.mobile,
        province: checkedAddress.province_id,
        city: checkedAddress.city_id,
        district: checkedAddress.district_id,
        address: checkedAddress.address,
        freight_price: 0.00,

        // 留言
        postscript: this.post('postscript'),

        // 使用的优惠券
        coupon_id: 0,
        coupon_price: couponPrice,

        add_time: currentTime,
        goods_price: goodsTotalPrice,
        order_price: orderTotalPrice,
        actual_price: actualPrice,
        order_status : 1, // 订单状态-默认为未付款
      };

      var orderId = null;
      orderId = await model.add(orderInfo);

      // const orderId = await this.model('order').add(orderInfo);
      orderInfo.id = orderId;
      if (!orderId) {
        return this.fail('订单提交失败');
      }

      // 添加当前的所有商品
      const orderGoodsData = [];
      for (const goodsItem of curGoodsList) {
        orderGoodsData.push({
          order_id: orderId,
          goods_id: goodsItem.goods_id,
          goods_sn: goodsItem.goods_sn,
          product_id: goodsItem.product_id,
          goods_name: goodsItem.goods_name,
          list_pic_url: goodsItem.list_pic_url,
          market_price: goodsItem.market_price,
          retail_price: goodsItem.retail_price,
          number: goodsItem.number,
          goods_specifition_name_value: goodsItem.goods_specifition_name_value,
          goods_specifition_ids: goodsItem.goods_specifition_ids
        });
      }
      await this.model('order_goods').addMany(orderGoodsData);

      orderInfos.push(orderInfo);
    }
    
    await this.model('cart').clearBuyGoods();
    return this.success({ orderInfos: orderInfos });
  }

  /**
   * 查询物流信息
   * @returns {Promise.<void>}
   */
  async expressAction() {
    const orderId = this.get('orderId');
    if (think.isEmpty(orderId)) {
      return this.fail('订单不存在');
    }
    const latestExpressInfo = await this.model('order_express').getLatestOrderExpress(orderId);
    return this.success(latestExpressInfo);
  }
};
