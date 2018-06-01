import webSelect from './selectPerson'
import http from '@/api/http.js'
import shareLogo from '@/assets/public-group.png'
import env from '@/config/env.config.js'
// promise包裹的“选人桥”
export const getSharers = ({multi, needSession, needContract}) => {
    return new Promise((resolve, reject) => {
        webSelect({
            multi: multi,
            needSession: needSession,
            needContract: needContract,
            success: (result) => {
                resolve(result)
            },
            cancel: () => {
                reject()
            }
        })
    })
}

const formatToURLEncode = (data = {}) => {
    const result = []
    for (const key of Object.keys(data)) {
        result.push(`${key}=${data[key]}`)
    }
    return result.join('&')
}

// 转发“日程”或者“会议”(param中有url的需转译后再传过来)
const sendMessage = ({ groupId, userId }, title, param) => {
    const data = {
        groupId: groupId,
        toUserId: userId,
        msgType: 7, // 消息类型,cms
        content: title,
        param: param
    }

    return http.post('/im/web/sendMessage.do', formatToURLEncode(data), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    })
}

// 添加了“二次转发”策略的“转发”
const _sendMessage = (shareInfo, title, param) => {
    console.log('_sendMessage????:', shareInfo)
    // lastSuccessIdx: 上一次成功请求的序列号
    return function (lastSuccessIdx) {
        // 发送转发请求
        return sendMessage(shareInfo, title, param)
        .catch(() => {
            // 请求失败，进行二次重试
            return sendMessage(shareInfo, title, param)
            .catch(() => {
                // 二次重试失败，返回上次成功的序列号。方便后续显示“成功”还是“失败”
                return Promise.reject(lastSuccessIdx)
            })
        }).then(() => {
            // 本次请求成功，序列号增1
            return lastSuccessIdx + 1
        })
    }
}

// web端“分享”
export const webShare = ({lightAppId, appId, title, content, pageUrl}, shares) => {
    let param = {
        appName: '时间助手',
        lightAppId: lightAppId,
        appId: appId,
        thumbUrl: `${env.assetUrl}/public-group.png`,
        title: title,
        content: content,
        webpageUrl: pageUrl
    }
    param = JSON.stringify(param)
    // 设置“转发成功”的“初始序列号”
    let message = Promise.resolve(-1)
    for (const share of shares) {
        message = message.then(_sendMessage(share, title, param))
    }
    return message
}

export const nativeShare = ({lightAppId, appId, title, content, pageUrl}) => {
    const base64Data = shareLogo.split(',')[1]
    return new Promise((resolve, reject) => {
        XuntongJSBridge.call('share', {
            shareType: 4,
            appId: appId,
            appName: '时间助手',
            lightAppId: lightAppId,
            title: title,
            content: content,
            thumbUrl: `${env.assetUrl}/public-group.png`,
            thumbData: base64Data,
            webpageUrl: pageUrl,
            sharedObject: 'all',
            cellContent: content
        }, (result) => {
            if (`${result.success}` === 'true') {
                resolve(result)
            } else {
                reject(result)
            }
        })
    })
}
