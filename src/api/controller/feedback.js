const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * 获取用户的收货地址
   * @return {Promise} []
   */
  async indexAction() {

    const feedbackData = {
      user_name: "",
      user_email: this.post('mobile'),
      msg_title: "",
      msg_type: this.post('index'),
      msg_content: this.post('content'),
      user_id: this.getLoginUserId(),
      msg_time : tihs.getTime(),
    };

    await this.model('feedback').add(feedbackData);
    return this.success();
  }

 
};
