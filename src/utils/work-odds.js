import Vue from 'vue'
/** 从vuex 的工作列表中删除指定的工作
* @param list {Array}
* @param work {any} 要删除的工作数据
* @param delay {Number} ms
* @returns {}
*/
export function delWorkData (list, work, delay) {
    if (!list) return
    let timer = setTimeout(() => {
        list.forEach((item, index) => {
            if (item.id === work.id) {
                list.splice(list.indexOf(item), 1)
            }
        })
        Vue.set(work, 'remove', false)
        clearTimeout(timer)
    }, delay)
}

export function addWorkData (list, work, delay, callback) {
    if (!list) return
    let timer = setTimeout(() => {
        // 添加元素
        list.unshift(work)
        Vue.set(work, 'isAdd', true)
        if (typeof callback === 'function') {
            callback.call(this)
        }
        clearTimeout(timer)
    }, delay)
}
