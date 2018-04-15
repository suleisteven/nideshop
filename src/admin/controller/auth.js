const Base = require('./base.js');

module.exports = class extends Base {
  async loginAction() {
    const username = this.post('username');
    const password = this.post('password');

    const admin = await this.model('admin').where({ username: username }).find();
    if (think.isEmpty(admin)) {
      return this.fail(401, '用户名或密码不正确');
    }

    if (think.md5(password + '' + admin.password_salt) !== admin.password) {
      return this.fail(400, '用户名或密码不正确');
    }

    // 更新登录信息
    await this.model('admin').where({ id: admin.id }).update({
      last_login_time: parseInt(Date.now() / 1000),
      last_login_ip: this.ctx.ip
    });

    const TokenSerivce = this.service('token', 'admin');
    const sessionKey = await TokenSerivce.create({
      user_id: admin.id
    });

    if (think.isEmpty(sessionKey)) {
      return this.fail('登录失败');
    }

    const userInfo = {
      id: admin.id,
      username: admin.username,
      avatar: admin.avatar,
      admin_role_id: admin.admin_role_id,
      last_login_time: admin.last_login_time,
      last_login_ip: admin.last_login_ip
    };

    return this.success({ token: sessionKey, userInfo: userInfo });
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('admin');
    const data = await model.where({id: id}).find();

    return this.success(data);
  }
  
  async storeAction() {
    const id = this.post('id');
    const oldPassword = this.post('oldPassword');
    const newPassword = this.post('newPassword');

    if(think.isEmpty(id) || think.isEmpty(oldPassword) || think.isEmpty(newPassword))
    {
      return this.fail("参数错误");
    }

    const admin = await this.model('admin').where({ id: id }).find();

    if(think.isEmpty(admin))
    {
      return this.fail("用户不存在");
    }

    if (think.md5(oldPassword + '' + admin.password_salt) !== admin.password) {
      return this.fail(400, '原密码错误');
    }

    let realNewPassword = think.md5(newPassword + '' + admin.password_salt);
    
    await this.model('admin').where({ id: admin.id }).update({
      password: realNewPassword
    });

    return this.success("密码修改成功，请重新登录");
  }

};
