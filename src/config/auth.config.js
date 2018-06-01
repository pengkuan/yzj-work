import Vue from 'vue'
const proto = Vue.prototype
import { getUrlParam } from '@/utils/helper'

class Authority {
    constructor () {
        window.timePoints['startAuthen'] = Date.now()

        // 如果是本地调试，则不再走鉴权过程，写死参数
        if (proto.$common.env === 'localhost') {
            this.handleLocal()

        // 如果是非移动端，或者老版本(小于9.4)Android端，则走原来的鉴权方式
        } else if (location.href.indexOf('ticket') > -1) {
            const ticket = getUrlParam('ticket')

            proto.$proms.ready = new Promise((resolve, reject) => {
                proto.$axios.post('/cloudwork/work/auth', `ticket=${ticket}`).then(resp => {
                    const data = resp.data.data
                    this.setInfo(data)
                    resolve(resp)
                })
            })
        } else {
            this.getAuth()
        }
    }

    // 本地测试的一些配置
    handleLocal () {
        proto.$proms.ready = new Promise((resolve, reject) => {
            proto.$axios.post(
                '/cloudwork/work/authbyoid',
                `oid=5a6190ade4b085f93e9189c2`
            ).then(resp => {
                console.log('handleLocal:', resp)
                window.timePoints['getPersonInfo'] = Date.now()

                const data = resp.data.data
                this.setInfo(data)

                resolve(resp)
            })
        })
    }

    getAuth () {
        let _this = this

        proto.$proms.ready = new Promise((resolve, reject) => {
            // 获取应用Ticket
            window.qing.call('getTicket', {
                // 获取签名的接口，接收url参数
                signUrl: '/cloudwork/jsapi/generatesignature.json',
                // 接口结果字段匹配
                signFormat (data) {
                    return {
                        appId: data.appId,
                        timeStamp: data.timestamp,      // 必填，生成签名的时间戳
                        nonceStr: data.nonceStr,        // 必填，生成签名的随机字符串
                        signature: data.signature       // 必填，签名
                    }
                },
                // 获取ticket成功
                success (ticket) {
                    proto.$axios.post(`/cloudwork/work/auth?ticket=${ticket}`)
                        .then(resp => {
                            window.timePoints['getPersonInfo'] = Date.now()
                            let data = resp.data.data
                            _this.setInfo(data)
                            resolve(resp)
                        })
                },
                // 获取ticket失败
                error (error) {
                    console.info(error)
                }
            })
        })
    }
    setInfo (data) {
        proto.$axios.defaults.headers.common['X-Requested-openid'] = data.openid
        proto.$axios.defaults.headers.common['X-Requested-eid'] = data.eid
        proto.$userInfo = data
        this.clearTodo()
    }
    // 消除待办
    clearTodo () {
        if (location.search.indexOf('todoid') > -1) {
            let todoid = getUrlParam('todoid')
            proto.$axios.post(`/cloudwork/work/todo?todoid=${todoid}`)
        }
    }
}

new Authority()
