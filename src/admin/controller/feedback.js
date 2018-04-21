const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const name = this.get('name') || '';
    const nickname = this.get('nickname') || '';

    const model = this.model('feedback');
    //const data = await model.order(['id DESC']).page(page, size).countSelect();

    let data;
    if(think.isEmpty(nickname) && think.isEmpty(name))
    {
      data = await model.field('nideshop_user.*,nideshop_feedback.user_id,nideshop_feedback.user_email,nideshop_feedback.msg_type,nideshop_feedback.msg_content,nideshop_feedback.msg_time').join('nideshop_user ON nideshop_user.id = nideshop_feedback.user_id').order(['id DESC']).page(page, size).countSelect();
    }else{
      data = await model.field('nideshop_user.*,nideshop_feedback.user_id,nideshop_feedback.user_email,nideshop_feedback.msg_type,nideshop_feedback.msg_content,nideshop_feedback.msg_time').join('nideshop_user ON nideshop_user.id = nideshop_feedback.user_id').where({"nideshop_user.username": ['like', `%${name}%`], 'nideshop_user.nickname' : ['like', `%${nickname}%`]}).order(['id DESC']).page(page, size).countSelect();
    }
    

    return this.success(data);
  }

};
