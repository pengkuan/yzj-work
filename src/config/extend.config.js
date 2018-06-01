import { DatetimePicker } from 'mint-ui'
import Vue from 'vue'
import Axios from 'axios'
import Qs from 'qs'
import Speedsdk from 'speed-sdk'
import simpleTip from '@/modules/tips'
import selectPersons from '@/modules/selectPerson'
import vueTouchEvents from '@/lib/vue-touch-events'
import timeline from './build-date'

// 测速平台初始化pid 20171123135948
Speedsdk.init('20171123135948')

Vue.component(DatetimePicker.name, DatetimePicker)
Object.assign(Vue.prototype, {
    $speedsdk: Speedsdk,
    $mywork: {},
    $axios: Axios,
    timeline,
    $moment: require('@/lib/moment.min').moment,
    $qs: Qs,

    // 判断js桥的版本号，小于0.9.52使用web端的时间选择组件
    // 大于或等于则通过js桥使用客户端的时间选择组件
    $isOldBridge: (function () {
        if (!/Android|iPhone/.test(navigator.userAgent)) return true
        let match = navigator.userAgent.match(/Qing\/\d+\.\d+.\d+/) || ['']
        let version = match[0] && match[0].match(/\d+\.\d+.\d+/)[0].split('.')
        let isOld
        if (version[0] === '0') {
            if (parseInt(version[1]) < 9 ||
                (parseInt(version[1]) === 9 && parseInt(version[2]) < 52)) {
                isOld = true
            }
        } else {
            isOld = false
        }
        return isOld
    }()),

    /** ++++++++++++++++++
     * *
     * * 通用的原型方法，挂载到这个对象下
     * *
     +++++++++++++++++++++ **/
    $common: {
        // 解析url传过来的参数
        urlParams: (() => {
            let params = {}
            if (location.search) {
                let search = location.search.includes('voiceContent')
                    ? decodeURIComponent(decodeURIComponent(location.search)) : location.search
                let strArr = search.replace(/\?/, '').split('&')
                strArr.forEach(item => {
                    let val = item.split('=')
                    if (search.includes('voiceContent') && val[0] === 'msgId') {
                        // 如果是来自sophie，则把msgid放到voice属性里
                        params.voice = {}
                        params.voice[val[0]] = val[1]
                    } else {
                        // 如果来自sophie，则另做处理
                        if (item.includes('coops')) {
                            params.coops = JSON.parse(item.replace('coops=', ''))
                        } else {
                            params[val[0]] = val[1]
                        }
                    }
                })
            }
            return params
        })(),

        /**
         * @method env 判断当前web环境
         * @return {String} prod: 正式环境，localhost: 本地开发环境， dev: dev开发环境
         **/
        env: (() => {
            let env = 'prod'
            if (/172|127|localhost|:8800/.test(location.href)) {
                env = 'localhost'
            } else if (/kdtest/.test(location.href)) {
                env = 'dev'
            }
            return env
        })(),

        /**
         * 统计
         * @param {Object} val 事件
         **/
        datalyEvent (val, callback) {
            if (this.env === 'prod') {
                if (window._dataly) {
                    window._dataly.push(['_trackEvent', val, callback])
                } else {
                    setTimeout(() => {
                        window._dataly.push(['_trackEvent', val, callback])
                    }, 1000)
                }
            } else {
                console.log(JSON.stringify(val))
            }
        }
    },
    $proms: {
        // 当前环境是否为移动端
        isMobile: /Android|iPhone|iPad/g.test(navigator.userAgent),
        isDesktop: /10204|10221|10220/g.test(navigator.userAgent),

        // 当前环境是否为老版本桌面端
        isOldDesk: /10204/g.test(navigator.userAgent),

        /**
         * @method {compEnd} 兼容移动端 和 web、桌面端的不同操作
         * @param {function} mobileCb 移动端的回调
         * @param {function} webCb web端的回调
         * @return undefined
        */
        compEnd ({
            mobileCb = function () {},
            webCb = function (lappmask) {}
            } = {}) {
            if (this.$proms.isMobile || this.$proms.isDesktop) {
                this.$proms.isBridgeReady().then(val => {
                    mobileCb.call(this)
                })
            } else {
                this.$proms.onLappReady().then(val => {
                    webCb.call(this, val)
                })
            }
        },

        /**
         * @method {onLappReady} 在lappmask加载完成后，执行异步回调
         * @return {Promise} 返回一个Promise以便处理异步
        */
        onLappReady () {
            return new Promise((resolve, reject) => {
                if (typeof lappmask === 'object') {
                    resolve(lappmask)
                } else {
                    let timer = setInterval(() => {
                        if (typeof lappmask === 'object') {
                            resolve(lappmask)
                            clearInterval(timer)
                        }
                    }, 10)
                }
            })
        },
        selectPersons,

        // 移动端判断js桥是否准备就绪，否则会出现点击右上角功能键无效的情况
        isBridgeReady () {
            return new Promise(resolve => {
                if (window._isInited || Vue.prototype.$proms.isDesktop) {
                    resolve(true)
                } else {
                    let timer = setInterval(() => {
                        if (window._isInited) {
                            resolve(true)
                            clearInterval(timer)
                        }
                    }, 5)
                }
            })
        },
        // 检测
        isOldIE: (() => {
            let numArr = navigator.userAgent.match(/(MSIE \d+\.\d+)(?=;)/g) || []
            let isOld = false
            if (numArr[0]) {
                let num = parseInt(numArr[0].match(/\d+\.\d+/g))
                if (num < 10) isOld = true
            }
            return isOld
        })(),

        /**
         * 根据传入qing版本号，判断当前判断是否低于此版本
         * @param {string}qingVersion
         * @return {boolean}当前版本是否低于参数版本
         */
        belowWhichVersion: function (qingVersion) {
            if (!/Android|iPhone/.test(navigator.userAgent)) return true
            let match = navigator.userAgent.match(/Qing\/\d+\.\d+.\d+/) || ['']
            let version = match[0] && match[0].match(/\d+\.\d+.\d+/)[0].split('.')
            let qingVersionSplit = qingVersion.split('.')

            if (version[0] === qingVersionSplit[0]) {
                if (version[1] === qingVersionSplit[1]) {
                    return version[2] < qingVersionSplit[2]
                } else {
                    return parseInt(version[1]) < parseInt(version(1))
                }
            } else {
                return parseInt(version[0]) < parseInt(qingVersionSplit[0])
            }
        }
    }
})

Vue.use(simpleTip)
Vue.use(vueTouchEvents)

if (Vue.prototype.$common.urlParams.timestamp) {
    let dateObj = new Date(parseInt(Vue.prototype.$common.urlParams.timestamp))
    let date = new Date(`${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`)
    let obj = {
        date,
        time: date.getTime()
    }
    Vue.prototype.$mywork.selectedDay = obj
    // add by pengkuan
    Vue.prototype.$mywork.selectedDayOrigin = obj
}

