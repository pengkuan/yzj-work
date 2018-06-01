import Vue from 'vue'
import Raven from 'raven-js'

// 对 axios 的 post 和 get 方法的简单封装，便于提起数据
const http = {
    post () {
        return new Promise((resolve, reject) => {
            Vue.prototype.$axios.post(...arguments)
            .then(resp => {
                resolve(resp.data)
            })
            .catch((err) => {
                reject(err)
                Raven.captureException(new Error(JSON.stringify(err)))
            })
        })
    },
    get () {
        return new Promise((resolve, reject) => {
            Vue.prototype.$axios.get(...arguments)
            .then(resp => {
                resolve(resp.data)
            })
            .catch((err) => {
                reject(err)
                Raven.captureException(new Error(JSON.stringify(err)))
            })
        })
    }
}

Vue.prototype.$http = http

export default http
