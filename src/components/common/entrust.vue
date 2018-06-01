<template lang="pug">
    .entrust-wrap(v-if="isShowParent")
        .btn(v-if="isRelevantPerson && !isShowEntrust" @click="selectEntrustMan()") 委托参加
        .group-btn.border-t(v-if="curWork.isMandatary")
            .btn.btn_ing(v-if="gapMin > 0 && !isAccept" @click="acceptEntrust") 接受委托并参加该会议
            .btn.btn_end(v-if="gapMin < 0 || isAccept") {{gapMin < 0 ? '会议已结束' : '委托已完成'}}
</template>

<script>
    import {mapGetters} from 'vuex'
    import {getSharers, webShare} from '@/modules/share.js'
    import { agreeBeEntrusted, entrustJoinMeeting, xtsend } from '@/api/sendRequest'
    import env from '@/config/env.config.js'

    export default {
        data () {
            return {
                isAccept: false,
                isMobile: true
            }
        },
        computed: {
            ...mapGetters({
                curWork: 'curWork',
                coWorkers: 'coWorkers'
            }),
            isRelevantPerson () {
                console.log('coWorkers.staffList >>>>>:', this.coWorkers.staffList)
                return (!!this.curWork.currentWorkUser) && (!!this.curWork.currentWorkUser.oid)
            },
            // 开始时间距离当前时间的分钟间隔
            gapMin () {
                return -(this.$moment().diff(this.curWork.endDate, 'seconds') / 60)
            },
            staffIds () {
                let arr = this.coWorkers.staffList || []
                const _arr = []
                arr.forEach((item, index) => {
                    _arr.push(item.id)
                })
                _arr.push(this.curWork.openid)
                return _arr
            },
            isShowEntrust () {
                /*
                * 当是被委托人在没有点击同意委托前，点击委托详情时，才显示按钮
                * */
                return this.curWork.clientOid || (this.curWork.type !== 'meeting')
            },
            isShowParent () {
                return (this.isRelevantPerson && !this.isShowEntrust) || this.curWork.isMandatary
            }
        },
        methods: {
            selectEntrustMan () {
                this.$common.datalyEvent({ event: '点击会议委托参与' })
                // 委托参加
                this.$proms.compEnd.apply(this, [{
                    mobileCb: () => {
                        this.isMobile = true
                        this.selectPerson()
                    },
                    webCb: () => {
                        this.isMobile = false
                        this.selectWebPerson()
                    }
                }])
            },
            selectPerson () {
                new Promise((resolve, reject) => {
                    XuntongJSBridge.call('selectPersons',
                        {
                            isMulti: false,
                            ignore: this.staffIds || []
                        },
                        resp => {
                            if (resp.success) {
                                resolve(resp)
                            } else {
                                reject(resp)
                            }
                        }
                    )
                }).then((resp) => {
                    if (resp.success) {
                        let arr = []
                        resp.data.persons.forEach((item) => {
                            arr.push({personName: item.name, userId: item.openId, groupId: ''})
                        })
                        this.entrustJoinMeeting(arr)
                    }
                })
            },
            selectWebPerson () {
                // web端
                getSharers({
                    multi: false,
                    needSession: true,
                    needContract: true
                })
                    .then(shares => {
                        if (this.staffIds.indexOf(shares[0].userId) === -1) {
                            this.entrustJoinMeeting(shares)
                        } else {
                            this.$tip.show({
                                message: '不能选择与会人或创建人'
                            })
                        }
                    })
            },
            getShareUrl () {
                const {fullPath} = this.$route
                const serverRootUrl = window.location.href.replace(new RegExp(`${fullPath}([/?].+)?`), '')
                return `${serverRootUrl}?workid=${this.curWork.id}&workType=meeting&clientOid=${this.$userInfo.openid}`
            },
            shareWebToEntrust (shares) {
                // web端发送分享卡片
                const me = this
                webShare({
                    appId: 10619,
                    lightAppId: 10619,
                    title: `${me.$userInfo.username}的日程`,
                    content: `${me.curWork.content}`,
                    pageUrl: encodeURIComponent(me.getShareUrl())
                }, shares)
                    .catch(lastSuccessIdx => {
                        // 第一个请求没有发送成功，则认为“日程转发不成功”
                        if (lastSuccessIdx === -1) {
                            me.$tip.show({message: '分享失败，请检查网络连接', duration: 1.5})
//                            return Promise.reject()
                        }
                    })
                    .then(() => {
                        me.$tip.show({message: '已发送委托请求', duration: 1.5})
                    })
            },
            shareToEntrust (shares) {
                // 分享给委托人
                const param = {
                    appName: '时间助手',
                    content: this.curWork.content,
                    title: '时间助手',
                    lightAppId: '10619',
                    thumbUrl: `${env.assetUrl}/public-group.png`,
                    webpageUrl: this.getShareUrl()
                }
                const params = {
                    content: this.curWork.content,
                    toUserId: shares.userId,
                    msgType: 7,
                    param: JSON.stringify(param)
                }
                xtsend(params)
                    .then(resp => {
                        this.$tip.show({message: '已发送委托请求', duration: 1.5})
                    })
            },
            entrustJoinMeeting (shares) {
                // 委托参与会议
                const me = this
                entrustJoinMeeting({
                    'meetingId': this.curWork.id,
                    'mandataryOid': shares[0].userId
                })
                    .then(resp => {
                        if (resp.success) {
                            me.isMobile && this.shareToEntrust(shares[0])
                            !me.isMobile && this.shareWebToEntrust(shares)
                        } else {
                            this.$tip.show({message: '委托没发送成功，再试试吧', duration: 1.5})
                        }
                    })
            },
            acceptEntrust () {
                // 接受委托
                let params = {
                    'meetingId': this.curWork.id,
                    'clientOid': this.curWork.clientOid
                }
                agreeBeEntrusted(params)
                    .then(resp => {
                        if (resp.success) {
                            this.isAccept = true
                            this.$emit('acceptEntrust', true)
                        }
                    })
                    .catch(({errorCode, error}) => {
                        if (+errorCode === 2) {
                            return
                        }
                        this.$tip.show({message: error, duration: 1.5})
                    })
            }
        }
    }
</script>

<style lang="less" rel="stylesheet/less" scoped>
    .entrust-wrap{
        flex:1;
    }

    .btn_ing {
        background: #4598F0;
        color: #fff;
    }

    .btn_end {
        background: #A4A8AB;
        color: #ffffff;
        &:active {
           background: #A4A8AB;
           color: #ffffff;
        }
    }
</style>
