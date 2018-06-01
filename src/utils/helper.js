
export function downloadFile (params, url) {
    let el = document.querySelector('#download-iframe')
    if (!el) {
        el = document.createElement('iframe')
        el.setAttribute('id', 'download-iframe')
        el.style.display = 'none'
        document.body.appendChild(el)
    }
    url += url.indexOf('?') > -1 ? '' : '?'
    url += Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
    el.src = url
}

export function getUrlParam (name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
    let r = window.location.search.substr(1).match(reg)
    return r != null ? decodeURIComponent(r[2]) : null
}
