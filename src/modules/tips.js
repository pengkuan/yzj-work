class Tips {
    constructor () {
        this.isShow = false
        this._options = {
            message: '请输入提示信息',
            duration: 2,
            className: '',
            type: 'none'
        }
    }
    show (params) {
        Object.assign(this._options, params)
        if (this.isShow) return
        this.createDom()
        this.isShow = true

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.remove()
                resolve(this)
            }, this._options.duration * 1000)
        })
    }
    createDom () {
        const node = document.createElement('div')
        const dom = document.createElement('div')
        const text = document.createTextNode(this._options.message)
        node.className = 'operate-tip'
        dom.className = 'tip-content'
        // dom.innerHTML = this._options.message
        let i = document.createElement('i')
        i.className = this._options.type
        dom.appendChild(i)
        dom.appendChild(text)
        this._options.className ? dom.classList.add(this._options.className) : ''
        node.appendChild(dom)
        document.body.appendChild(node)
        this.node = node
    }
    remove () {
        document.body.removeChild(this.node)
        this.isShow = false
    }

    install (Vue) {
        Vue.prototype.$tip = this
    }
}

const simpleTip = new Tips()

export default simpleTip
