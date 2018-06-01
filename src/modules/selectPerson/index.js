/**
 * 通用人员选择方法
 */
import webSelect from './webSelect'

const win = window
// const doc = document

function toggleReturnBtn (state) {
    // 隐藏或显示web端返回按钮
    var obj = {
        needBack: state
    }
    win.parent.postMessage(JSON.stringify(obj), '*')
}

export default function (options) {
    window.location.hash = '#selectPerson'
    webSelect({
        multi: options.multi,
        needSession: options.needSession,
        needContract: options.needContract,
        onSelect: function (data, historyLen) {
            let keysArr = Object.keys(data)
            let array = []
            for (let i = 0; i < keysArr.length; i++) {
                let key = keysArr[i]
                let person = data[key]
                person.personName = person.name
                person.openId = person.personId = person.oId
                array.push(person)
            }
            toggleReturnBtn(true)

            /* 解决“选人”后页面顶部左侧“返回”消失的问题
            if (historyLen > 0) {
                doc.getElementById('personBridge').contentWindow.history.go(-historyLen)
            }
            */

            options.success && options.success(array)
        },

        onCancel: function (historyLen) {
            toggleReturnBtn(true)
            /* 解决“选人”后页面顶部左侧“返回”消失的问题
            if (historyLen > 0) {
                doc.getElementById('personBridge').contentWindow.history.go(-historyLen)
            }
            */
            options.cancel && options.cancel()
        }
    })
    toggleReturnBtn(false)
}
