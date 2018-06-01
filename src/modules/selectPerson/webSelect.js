import config from '@/config/env.config'

// 仅用作Web端选人
function extend (defaultOptions, options) {
    if (typeof (options) !== 'object') {
        options = {}
    }
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            defaultOptions[key] = options[key]
        }
    }
    return defaultOptions
}

var defaultOption = {
    onSelect: null,
    onCancel: null,
    multi: false
}

var doc = document

function SelectPerson (option) {
    if (this instanceof SelectPerson) {
        this.options = extend(defaultOption, option)
        return this.init(this.options)
    } else {
        return new SelectPerson(option)
    }
}

SelectPerson.prototype = {
    init: function (options) {
        this.createIframe(options.multi, options.needSession, options.needContract)
        this.addEvent()
        return this
    },
    createIframe: function (multi, needSession, needContract) {
        var ifrm = doc.createElement('iframe')
        ifrm.id = 'personBridge'
        // 默认单选
        ifrm.setAttribute('src', `${config.serverRootUrl}space/c/js/bridge/select/persons?multiple=${multi || false}&existingSessionIsNeed=${needSession || false}&existingContractIsNeed=${needContract || false}`)
        ifrm.style.zIndex = '99999'
        ifrm.style.width = '100%'
        ifrm.style.height = '100%'
        ifrm.style.position = 'fixed'
        ifrm.style.top = '50%'
        ifrm.style.left = '50%'
        ifrm.style.transform = 'translate(-50%, -50%)'
        ifrm.style.border = '1px solid #ccc'
        doc.body.appendChild(ifrm)
    },
    addEvent: function () {
        var self = this
        window.addEventListener('message', function handler (event) {
            if (event.source !== doc.getElementById('personBridge').contentWindow) {
                return
            }
            self.onMessage(event) && window.removeEventListener('message', handler)
        }, false)
    },
    onMessage: function (event) {
        if (event.data.type === 'confirm') {
            this.options.onSelect && this.options.onSelect(event.data.member, event.data.historyLen)
            this.close()
            return true
        }
        if (event.data.type === 'cancel') {
            this.options.onCancel && this.options.onCancel(event.data.historyLen)
            this.close()
            return true
        }
        return false
    },
    close: function () {
        var elem = doc.getElementById('personBridge')
        doc.body.removeChild(elem)
    }
}

export default SelectPerson
