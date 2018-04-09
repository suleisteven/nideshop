const Base = require('./base.js');
const fs = require('fs');
const _ = require('lodash');

module.exports = class extends Base {

    async indexAction() {
        return this.success();
    }

    async receiveWechatAction() {

        if(this.isPost)
        {
            let data = this.post();
            this.printObjectWithHead("post receiveWechat:", data);
            return this.success();

        }else if(this.isGet)
        {
            let data = this.get();
            this.printObjectWithHead("get receiveWechat:", data);

            this.body = this.get('echostr');
            return;
        }
    }

    printObjectWithHead(head, obj) {

        if(obj)
        {
            let str = JSON.stringify(obj)
            console.log(head + "----" + str);
        } else{
            console.log(head + " null");
            
        }

        // console.log(head + obj + " { ");
        // for (var field in obj) {
        //     if (obj[field] != null && typeof obj[field] != 'function') {
        //         if (typeof obj[field] == 'object') {
        //             this.printObjectWithHead(head + "    ", obj[field]);
        //         } else {
        //             console.log(head + "    " + field + ":" + obj[field] + " type :" + typeof obj[field]);
        //         }
        //     }
        // }
        // console.log(head + " } " + obj);
    }

};


