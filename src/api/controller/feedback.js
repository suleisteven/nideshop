const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * 获取用户的收货地址
   * @return {Promise} []
   */
  async indexAction() {

    let userId = this.getLoginUserId();

    const feedbackData = {
      user_name: "",
      user_email: this.post('mobile'),
      msg_title: "",
      msg_type: this.post('index'),
      msg_content: this.post('content'),
      user_id: userId,
      msg_time : this.getTime(),
    };

    if(userId>0)
    {
      const userInfo = await this.model('user').where({id: userId}).find();
      if(userInfo)
      {
        feedbackData.user_name = userInfo.nickname;
      }
    }

    await this.model('feedback').add(feedbackData);
    return this.success();
  }

 
};
