// default config
module.exports = {
  default_module: 'api',
  weixin: {
    appid: 'wxf30e5ba08079df5d', // 小程序 appid
    secret: 'e7fd3341d32d0d8de6c5e975a02f1c20', // 小程序密钥
    mch_id: '', // 商户帐号ID
    partner_key: '', // 微信支付密钥
    notify_url: '' // 微信异步通知，例：https://www.nideshop.com/api/pay/notify
  },
  express: {
    // 快递物流信息查询使用的是快递鸟接口，申请地址：http://www.kdniao.com/
    appid: '1330269', // 对应快递鸟用户后台 用户ID
    appkey: '11b787e7-f3f1-44ab-8fb6-2137a48b3a7f', // 对应快递鸟用户后台 API key
    request_url: 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx'
  },
  //imgUrlPrefix: "http://127.0.0.1:8360",
  imgUrlPrefix: "http://cdn.flyinthesky.cn",

  imgRootPath:"/www", // 上传图片所在目录

  imgFileRelateDir : "/static/upload/pics/final/", // 图片所在正式目录
  imgFileTmpRelateDir : "/static/upload/pics/tmp/", // 图片所在临时目录，上传的图片，如果未保存则会在临时目录。临时目录在项目启动时会进行清除
  maxNumberOfGoodsInOrder : 10, // 每笔订单中单个商品可以购买的最大个数
};
