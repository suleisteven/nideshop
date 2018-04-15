const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {

    const model = this.model('system_config');
    const data = await model.field(['key','value']).order(['id ASC']).select();

    let obj = new Object();
    
    data.map((item)=>{
      obj[item.key] = item.value;
    });
    
    return this.success(obj);
  }
};
