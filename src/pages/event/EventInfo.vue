<template lang="pug">
    .work-detail(:class="{ hasNoCmt: !hasCmt }")
        .work-editor
            .work-text(ref="workText" readonly :class="{ finished: preventEdit }")
                span.work-content {{this.curWork.content}}

        p.show-full-text-btn(v-if="isShowFullText" @click="showTextCol") {{showFullTextCol ? '收起' : '展开'}}
        .work-detail-info
            .work-time(v-if="curWork.startDate")
                i.iconfont.icon-time1
                span 日期：{{startTime}}
        FilePreview(v-if="curWork.files && curWork.files.length"
            :fileList="curWork.files"
            @recoverMenu="recoverMenu")
        .margin-top
        cmt-list(ref="cmtList"
            @changecolor="changeColor"
            @recoverMenu="recoverMenu"
            @del-comment="updateRecordStatus")

        detailGroupBtn(v-if="isRelevantPerson" @commentEvent="commentEvent")
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import {
    getWorkDetail,
    getDate,
    formatMD} from '../works/operate'
import * as Odds from '@/utils/detail-odds'
import DateTime from '@/components/common/DateTime'
import msgInfo from '@/components/common/msgInfo'
import refuseToggle from '@/components/common/refuseToggle'
import FilePreview from '@/components/fileField/FilePreview'
import CmtList from '@/components/CmtList'
import detailGroupBtn from '@/components/common/detailGroupBtn'
import { getSharers, webShare, nativeShare } from '@/modules/share.js'
import Record from '@/components/common/record.vue'

export default {
    name: 'workDetail',
    computed: {
        ...mapGetters({
            curWork: 'curWork'
        }),
        startTime () {
            return this.curWork.startDate ? this.formatMD(this.curWork.startDate) : ''
        },
        endTime () {
            return this.curWork.endDate ? this.formatMD(this.curWork.endDate) : ''
        },
        isRelevantPerson () {
            return (!!this.curWork.currentWorkUser) && (!!this.curWork.currentWorkUser.oid)
        },
        isCreator () {
            const {openid: creatorId, currentWorkUser: {oid: currentUserId} = {}} = this.curWork
            return creatorId === currentUserId
        },
        // 只有“创建者”才能编辑“未完成”的日程
        preventEdit () {
            const { workStatus } = this.curWork
            return !this.isCreator || (+workStatus === 1)
        }
    },
    data () {
        return {
            workText: '',
            isNotified: false,
            hasCmt: false,   // 是否有回复（子组件回调）
            isShowFullText: true,
            showFullTextCol: false,
            showComPup: false,
            updateShowFullflag: true,
            showList: false,
            comPupTitle: {
                show: true,
                content: ' '
            }
        }
    },
    created () {
        this.getReady()
        this.handleOldWork()
        if (this.preventEdit) {
            this.$proms.compEnd.apply(this, [{
                webCb: lappmask => {
                    lappmask.removeCreatePop()
                },
                mobileCb: () => {
                    XuntongJSBridge.call('closePop')
                }
            }])
        }
    },
    updated () {
        // 判定是否需要收起功能 @shuiling_wu
        this.showText()
    },
    methods: {
        ...mapActions(['setCurrentWork', 'getPlanList', 'cancelWork']),
        getWork: Odds.getWork,
        confirmNotify: Odds.confirmNotify,
        getDate,
        formatMD,
        updateRecordStatus () {
            const curWork = Object.assign({}, this.curWork, {
                hasRecord: false,
                currentWorkUser: Object.assign({}, this.curWork.currentWorkUser, {
                    hasRecord: false
                })
            })
            this.setCurrentWork(curWork)
        },
        recoverMenu () {
            this.getReady()
            this.handleOldWork()
        },
        getReady () {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {'title': '记事详情'})
                },
                webCb: lappmask => {
                    lappmask.resetTitle('记事详情')
                    const obj = {
                        needBack: true
                    }
                    window.parent.postMessage(JSON.stringify(obj), '*')
                }
            })
        },
        handleOldWork () {
            const me = this
            me.$proms.ready.then(() => {
                me.getWork(getWorkDetail).then(() => {
                    me.initPop()
                })
            })
        },
        initPop () {
            this.$proms.compEnd.apply(this, [{
                mobileCb: () => { this.createNativePop() },
                webCb: () => { this.createWebPop() }
            }])
        },
        createNativePop () {
            const me = this
            const handlers = {
                editPage: () => {
                    me.$common.datalyEvent({
                        event: '旧任务进入编辑'
                    })
                    me.$router.push({name: 'Event'})
                },
                share: () => {
                    me.$common.datalyEvent({
                        event: '记事转发-byNative'
                    })
                    me.nativeShare()
                }
            }
            // 不是“相关人员”，则不显示右上角的“操作”
            XuntongJSBridge.call('closePop')
            if (!me.isRelevantPerson) {
                return
            }
            if (me.preventEdit) {
                XuntongJSBridge.call('createPop', {
                    popTitle: '转发',
                    popTitleCallBackId: 'popTitleCallBack'
                }, resp => {
                    handlers.share()
                })
                return
            }
            const popInfo = {
                popTitle: '更多',
                popTitleCallBackId: 'popTitleCallBack',
                items: [{
                    text: '编辑',
                    callBackId: 'editPage'
                }, {
                    text: '转发',
                    callBackId: 'share'
                }],
                menuList: []
            }
            XuntongJSBridge.call('createPop', popInfo, (resp) => {
                if (!resp.hasOwnProperty('success') || resp.success === true || resp.success === 'true') {
                    const callBackId = resp.data && resp.data.callBackId || resp.callBackId || ''
                    if (handlers[callBackId]) {
                        handlers[callBackId]()
                    }
                }
            })
        },
        createWebPop () {
            const me = this
            this.$proms.onLappReady().then(lappmask => {
                lappmask.removeCreatePop()
                if (!me.isRelevantPerson) {
                    return
                }
                if (me.preventEdit) {
                    lappmask.createPop([{
                        text: '转发',
                        callBack: (evt) => {
                            lappmask.removeCreatePop()
                            this.$common.datalyEvent({
                                event: '转发记事-byWeb'
                            })
                            me.webShare()
                            .then(() => {
                                me.initPop()
                            }, () => {
                                me.initPop()
                            })
                        }
                    }])
                    return
                }
                lappmask.createPop([{
                    text: '更多',
                    popType: 'drop'
                }, {
                    text: '编辑',
                    popType: 'flat',
                    callBack: (evt) => {
                        me.$common.datalyEvent({
                            event: '旧任务进入编辑'
                        })
                        me.$router.push({name: 'Event'})
                    }
                }, {
                    text: '转发',
                    popType: 'flat',
                    callBack: (evt) => {
                        // 点击转发后，删除右上角的“操作”按钮
                        lappmask.removeCreatePop()
                        me.$common.datalyEvent({
                            event: '转发记事'
                        })
                        me.webShare()
                        .then(() => {
                            // 选人分享人后，重新设置右上角的“操作”按钮
                            me.initPop()
                        }, () => {
                            me.initPop()
                        })
                    }
                }])
            })
        },
        webShare () {
            const me = this
            return getSharers({
                multi: true,
                needSession: true,
                needContract: true
            }).then(shares => {
                // const shareCounts = shares.length
                webShare({
                    appId: 10619,
                    lightAppId: 10619,
                    title: `${me.$userInfo.username}的记事`,
                    content: `${me.curWork.content}`,
                    pageUrl: me.getShareUrl()
                }, shares)
                .catch(lastSuccessIdx => {
                    // 第一个请求没有发送成功，则认为“日程转发不成功”
                    if (lastSuccessIdx === -1) {
                        me.$tip.show({ message: '转发失败，请检查网络连接', duration: 1.5 })
                        return Promise.reject()
                    }
                })
                .then(() => {
                    me.$tip.show({ message: '转发成功', duration: 1.5 })
                })
            })
        },
        nativeShare () {
            const me = this
            nativeShare({
                appId: 10619,
                lightAppId: 10619,
                content: `${me.curWork.content}`,
                title: `${me.$userInfo.username}的记事`,
                pageUrl: me.getShareUrl()
            })
            .then(({errorCode}) => {
                // android 取消 “分享”, errorCode = 1
                if (!errorCode && !this.$proms.isDesktop) {
                    me.$tip.show({ message: '转发成功', duration: 1.5 })
                }
            })
            .catch((result) => {
                const {errorCode, error} = result
                // ios 取消“分享”，errorCode=2
                if (+errorCode === 2) {
                    return
                }
                me.$tip.show({ message: error, duration: 1.5 })
            })
        },
        getShareUrl () {
            const { fullPath } = this.$route
            const serverRootUrl = window.location.href.replace(new RegExp(`${fullPath}([/?].+)?`), '')
            return `${serverRootUrl}?workid=${this.curWork.id}&workType=event`
        },
        // 判断文字是否展开 @shuiling_wu
        showText () {
            if (!this.updateShowFullflag) {
                return
            }
            this.$refs.workText ? this.updateShowFullflag = false : this.updateShowFullflag = true
            let thisWorkTextHeight = this.$refs.workText.getBoundingClientRect().height
            let fontSize = parseInt(document.documentElement.style.fontSize.substr(0, 3))
            if (parseInt(thisWorkTextHeight) < (2.1 * fontSize)) {
                this.isShowFullText = false
            } else {
                this.isShowFullText = true
                this.$refs.workText.getElementsByClassName('work-content')[0].setAttribute('class', 'work-content work-content-ellipsis')
            }
        },
        // 控制文字展开收齐 @shuiling_wu
        showTextCol () {
            this.showFullTextCol ? this.showFullTextCol = false : this.showFullTextCol = true
            this.showFullTextCol ? this.$refs.workText.getElementsByClassName('work-content')[0].setAttribute('class', 'work-content') : this.$refs.workText.getElementsByClassName('work-content')[0].setAttribute('class', 'work-content work-content-ellipsis')
        },
        // 唤起提醒弹窗页面 @shuiling_wu
        popList () {
            if (this.$refs.workTimeTips.className.indexOf('work-time-tips-s') > 0) {
                return
            }
            this.showList = true
        },
        changeColor (isBool) {
            isBool && (this.hasCmt = isBool)
        },
        gotoInfo () {
            XuntongJSBridge.call('personInfo', { 'openId': this.curWork.openid })
        },
        commentEvent () {
            this.$refs.cmtList.cmtEvent()
        }
    },
    components: {
        DateTime,
        msgInfo,
        FilePreview,
        CmtList,
        detailGroupBtn,
        refuseToggle,
        Record
    }
}
</script>

<style lang="less" rel="stylesheet/less" scoped>
@import "../../css/schedule/detail";
.iconfont.icon-done {
    color: #32AA70;
    font-size: .30rem;
    margin-right: .07rem;
}
.spliter {
    height: .08rem;
    background-color: #F8F9FB;
}
.margin-top{
    margin-top:.2rem;
}
</style>
