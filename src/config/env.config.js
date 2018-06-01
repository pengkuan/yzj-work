const ENV = {
    serverRootUrl: '/',
    baseURL: '/',
    hostOrigin: window.location.origin,
    appId: '10619',
    assetUrl: 'https://www.yunzhijia.com/mywork/static'
}

let { origin, protocol, host } = location
if (!origin) {
    origin = `${protocol}//${host}`
}
ENV.assetUrl = `${origin}/mywork/static`

let devHost = 'http://192.168.22.144/'
if (process.env.NODE_ENV === 'development') {
    ENV.serverRootUrl = devHost
}

export default ENV
