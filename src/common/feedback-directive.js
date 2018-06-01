let locked = false
let timer = null
const on = (el, eventName, fn) => {
    el.addEventListener(eventName, fn, false)
}
const off = (el, eventName, fn) => {
    el.removeEventListener(eventName, fn)
}
const addCls = (el, cls) => {
    const className = el.className
    if (className === cls) {
        return
    }
    const reg = new RegExp(`(^${cls} | ${cls} | ${cls}$)`)
    if (reg.test(className)) {
        return
    }
    el.className += ` ${cls}`
}

const removeCls = (el, cls) => {
    const className = el.className
    if (className === cls) {
        el.className = ''
        return
    }
    const reg = new RegExp(`(^${cls} | ${cls} | ${cls}$)`)
    if (reg.test(className)) {
        el.className = el.className.replace(RegExp.$1, '')
        return
    }
}

const handleStart = (el, {cls}) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        locked = true
        addCls(el, cls)
    }, 20)
}

const handlerEnd = (el, {cls}) => {
    clearTimeout(timer)
    if (!locked) {
        return
    }
    locked = false
    removeCls(el, cls)
}

export default function feeback (Vue) {
    let _startHandler = null
    let _endHandler = null
    const feedback = {
        bind (el, binding) {
            const value = binding.value
            _startHandler = handleStart.bind(null, el, value)
            _endHandler = handlerEnd.bind(null, el, value)
            on(el, 'touchstart', _startHandler)
            on(el, 'touchmove', _endHandler)
            on(el, 'touchend', _endHandler)
            on(el, 'touchcancel', _endHandler)
        },
        unbind (el, binding) {
            off(el, 'touchstart', _startHandler)
            off(el, 'touchmove', _endHandler)
            off(el, 'touchend', _endHandler)
            off(el, 'touchcancel', _endHandler)
            _startHandler = null
            _endHandler = null
        }
    }
    Vue.directive('fb', feedback)
}
