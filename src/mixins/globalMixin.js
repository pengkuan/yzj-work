export default {
    methods: {
        /**
         * @method 设置webviewtitle
         * @param {string} title 标题, 默认值：时间助手
         * @return undefined
         */
        xtSetTitle (title = '时间助手') {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', { title })
                },
                webCb: lappmask => {
                    lappmask.resetTitle(title)
                }
            })
        },

        /**
         * @method 右上角保存按钮
         * @param {string} 按钮的文字
         * @param {string} 类型：新建日程，新建会议，新建记事
         * @param {function} callback
         * @return undefined
         */
        xtCreateSave (btnText, type, callback) {
            this.$common.datalyEvent({
                event: '提交' + type + '按钮点击'
            })
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('createPop', {
                        popTitle: btnText,
                        popTitleCallBackId: 'addWork'
                    }, resp => {
                        callback.call(this, resp)
                    })
                },
                webCb: lappmask => {
                    lappmask.removeCreatePop()
                    const obj = {
                        needBack: true
                    }
                    window.parent.postMessage(JSON.stringify(obj), '*')
                    lappmask.createPop([{
                        text: btnText,
                        callBack: evt => {
                            callback.call(this, evt)
                        }
                    }])
                }
            })
        }
    }
}
