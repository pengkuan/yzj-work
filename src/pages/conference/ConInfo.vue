<template lang="pug">
.meeting-page-wrap
    transition(name="fade")
        place-holder(v-if="!dataLoaded")
    transition(name="fade-slow")
        .work-detail(:class="{ hasNoCmt: !hasCmt}" v-if="dataLoaded")
            .work-editor.conf-detail
                .work-text(ref="workText" readonly :class="{ finished: preventEdit, cancled: isCancled }")
                    span.work-content
                        span.meeting-icon 会议
                        span {{curWork.content}}

            p.show-full-text-btn(v-if="isShowFullText" @click="showTextCol") {{showFullTextCol ? '收起' : '展开'}}
            .work-detail-info(:class="{ cancled: isCancled }")
                .work-creater(v-if="curWork.actorPersons && curWork.actorPersons.length")
                    i.iconfont.icon-creat
                    span 来自：
                        span.name(@click="gotoInfo") {{curWork.personName}}
                        span &nbsp; {{$moment(curWork.createDate).format('MM月DD日 HH:mm')}}
                .work-time(:class="[{outdated: isOutDate}]")
                    i.iconfont.icon-time1
                    span.picker-val {{showTime}}

                .meeting-loc(v-if="curWork.meetingPlace")
                    i.iconfont.icon-location
                    span {{curWork.meetingPlace}}

            .space30

            FilePreview(v-if="curWork.files && curWork.files.length"
                :fileList="curWork.files"
                @recoverMenu="recoverMenu")

            .space30

            msg-info(v-if="curWork.workData && curWork.workData.msgId" :work-data="curWork.workData")

            detail-remind.remain-time(:gap-min="gapMin"
                                        v-if="isRelevantPerson"
                                        @recoverMenu="recoverMenu"
                                        :remind-min="noticeTime"
                                        :countingText="countingDownText"
                                        :workStageId="meetingStage.id"
                                        :remindTip="meetingTip"
                                        :type="2")
                div(slot="add-comment" :style="{lineHeight: 0}" class="button-wrapper")
                    .commitBtn-wrap(v-if="showSubmitSummaryBtn")
                        .commitBtn(@click="addMeetingRecord") {{summaryBtnTxt}}
                    i.iconfont.icon-cancle(v-if="isCancled")
                    guidance(
                        v-if="creatorFinishGuidanceVisible"
                        :text="creatorFinishGuidance.text"
                        :direction="creatorFinishGuidance.direction"
                        :top="creatorFinishGuidance.top"
                        :right="creatorFinishGuidance.right"
                        :style="{'z-index': 2, 'white-space': 'nowrap'}"
                    )
                    guidance(
                        v-if="coworkerFinishGuidanceVisible"
                        :text="coworkerFinishGuidance.text"
                        :direction="coworkerFinishGuidance.direction"
                        :top="coworkerFinishGuidance.top"
                        :right="coworkerFinishGuidance.right"
                        :style="{'z-index': 2, 'white-space': 'nowrap'}"
                    )

            .line(v-if="curWork.actorPersons && curWork.actorPersons.length || curWork.record")
            template(v-if="curWork.record")

                record(mRTitle="会议纪要" :mRDetail="curWork.record" ref="$record")
                .spliter

            .coworkers-wrapper
                coworkers(v-if="curWork.actorPersons && curWork.actorPersons.length"
                    :coworkers="curWork.actorPersons"
                    source="detail"
                    type="meeting")
                guidance(
                    v-if="creatorAcceptGuidanceVisible"
                    :text="creatorAcceptGuidance.text"
                    :direction="creatorAcceptGuidance.direction"
                    :top="creatorAcceptGuidance.top"
                    :right="creatorAcceptGuidance.right"
                    :style="{'z-index': 2, 'white-space': 'nowrap'}"
                )

            cmt-list(v-cloak sectionLabel="会议反馈" ref="cmtList" @changecolor="changeColor" @recoverMenu="recoverMenu" @re-send-summary="showReSendPopup=true")

            popup(v-if="showReSendPopup" :show="showReSendPopup" :title="comPupTitle" class="check-confirm-popup")
                .work-wrap(slot="content")
                    .work-content.center 重新提交会覆盖原有会议意见，是否继续？
                    .work-check-btns
                        span(@click="showReSendPopup=false") 取消
                        span(@click="reSendSummary") 继续

            detailGroupBtn(v-if="!isCancled && (isRelevantPerson || isEntrust)" :type="2" @commentEvent="commentEvent")
            refuseToggle(:popUp="showRefuse" :type="2" @refuse="changeAcceptStatus" @cancelRefuse="showRefuse=false")
            guidance(
                v-if="coworkerAcceptGuidanceVisible"
                :text="coworkerAcceptGuidance.text"
                :direction="coworkerAcceptGuidance.direction"
                :bottom="coworkerAcceptGuidance.bottom"
                :left="coworkerAcceptGuidance.left"
            )
            guidance(
                v-if="privateGuidanceVisible"
                :text="privateGuidance.text"
                :direction="privateGuidance.direction"
                :top="privateGuidance.top"
                :right="privateGuidance.right"
            )
            .guidance-mask(v-if="guidanceMaskVisible" @click="nextGuidance")
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import {getDate,
    formatDate} from '../works/operate'
import * as Requests from '@/api/sendRequest'
import DateTime from '@/components/common/DateTime'
import Popup from '@/components/common/Popup'
import msgInfo from '@/components/common/msgInfo'
import Coworkers from '@/components/Coworkers'
import detailRemind from '@/components/common/detailRemind'
import CmtList from '@/components/CmtList'
import PageContainer from '@/components/common/PageContainer'
import detailGroupBtn from '@/components/common/detailGroupBtn'
import remindList from '@/components/common/remindList'
import { getSharers, webShare, nativeShare } from '@/modules/share.js'
import FilePreview from '@/components/fileField/FilePreview'
import refuseToggle from '@/components/common/refuseToggle'
import Record from '@/components/common/record.vue'
import {WORK_STATUS} from '@/common/remindList'
import guidance from '@/components/common/guidance'
import guidanceData from '@/pages/data/guidanceData.js'
import placeHolder from '@/components/optimize/placeHolder'

export default {
    name: 'workDetail',
    computed: {
        ...mapGetters({
            curWork: 'curWork'
        }),
        isCancled () {
            return this.meetingStage.id === WORK_STATUS.CANCEL.id
        },
        startTime () {
            return this.curWork.startDate ? this.formatDate(this.curWork.startDate) : ''
        },
        summaryBtnTxt () {
            return this.isCreator ? '提交会议纪要' : '提交会议意见'
        },
        acceptStatus () {
            const {currentWorkUser: {acceptStatus = 0} = {}} = this.curWork
            return +acceptStatus
        },
        needSubmitSummary () {
            const {submitExperience} = this.curWork
            return `${submitExperience}` === 'true'
        },
        hasSendSummary () {
            const {currentWorkUser: {hasRecord = false} = {}} = this.curWork
            return `${hasRecord}` === 'true'
        },
        endTime () {
            return this.curWork.endDate ? this.formatDate(this.curWork.endDate) : ''
        },
        showTime () {
            let start = this.$moment(this.curWork.startDate).format('YYYY-MM-DD')
            let end = this.$moment(this.curWork.endDate).format('YYYY-MM-DD')

            if (start === end) {
                return this.$moment(this.curWork.startDate).format('YYYY-MM-DD') + '  ' +
                    this.$moment(this.curWork.startDate).format('HH:mm') +
                    '-' + this.$moment(this.curWork.endDate).format('HH:mm')
            } else {
                return this.startTime + ' — ' + this.endTime
            }
        },
        isRelevantPerson () {
            return (!!this.curWork.currentWorkUser) && (!!this.curWork.currentWorkUser.oid) &&
                (this.curWork.currentWorkUser.workStatus !== 2)
        },
        isEntrust () {
            // 是否是被委托人
            return this.curWork.isMandatary
        },
        showSubmitSummaryBtn () {
            // 会议未开始或者已经取消————不能提交会议纪要或者会议意见
            if ((this.meetingStage.id === WORK_STATUS.NOTSTART.id) || (this.meetingStage.id === WORK_STATUS.CANCEL.id) || this.hasSendSummary) {
                return false
            }

            if (this.isCreator) {
                return true
            }
            // 不显示 “添加会议纪要按钮” 1、新建时没有添加会议纪要 2、不是创建者或者协作人  3、会议没有开始 4、用户已经提交会议纪要
            if (!this.needSubmitSummary || !this.isRelevantPerson || this.acceptStatus !== 2) {
                return false
            }
            return true
        },
        isCreator () {
            const {openid: creatorId, currentWorkUser: {oid: currentUserId} = {}} = this.curWork
            return creatorId === currentUserId
        },
        // 只有“创建者”才能编辑“未完成”的会议
        preventEdit () {
            const { workStatus } = this.curWork
            return !this.isCreator || (+workStatus === 1)
        },
        isCoworker () {
            return this.curWork.workSource === '2'
        },

        // 此会议是否为个人会议, 即: 没有与会人
        isPrivate () {
            return this.isCreator && ((!this.curWork.actorPersons) || (this.curWork.actorPersons && this.curWork.actorPersons.length <= 0))
        },
        // 开始时间距离当前时间的分钟间隔
        gapMin () {
            return -(this.$moment().diff(this.curWork.startDate, 'seconds') / 60)
        },
        noticeTime () {
            return this.curWork.currentWorkUser && this.curWork.currentWorkUser.noticeTime
        },
        canChangeJoinStatus () {
            // 以下情况不显示接受不接受菜单 1、发起人 2、逾期 3、已完成  4、未响应 5、会议已取消
            const {currentWorkUser: {acceptStatus = 0} = {}, workStatus = 1} = this.curWork
            // 发起人
            if (this.isCreator) {
                return false
            }
            // 逾期
            if (this.gapMin <= 0) {
                return false
            }
            // 已经完成 或者 会议已经取消
            if (workStatus === 1) {
                return false
            }
            // 未响应
            if (acceptStatus === 0) {
                return false
            }
            return true
        },
        // 是否超过截止时间
        isOutDate () {
            let now = Date.now()
            let endTime = new Date(this.curWork.meetingEnd).getTime()
            return endTime < now
        },
        isStartMeeting () {
            // 会议是否开始
            return new Date().getTime() >= this.curWork.startDate
        },
        meetingTip () {
            const {currentWorkUser: { acceptStatus = 0 } = {}} = this.curWork
            // 仅在倒计时出现时显示此提示
            const showTip = (+acceptStatus) === 2 && !!this.countingDownText && this.meetingStage.id === WORK_STATUS.NOTSTART.id && (this.isCreator || this.curWork.submitExperience)
            return showTip && (this.isCreator ? '会议开始后可提交纪要' : '会后可提交会议意见')
        },

        /**
         * 根据当前时间判断会议处于的阶段
         * computed meetingStage
         * 0-NOTSTART-未开始 1-PROCESSING-进行中 2-DONE-已结束 3-CANCEL-已取消
         * @return {object}status{id: 0, text: '未开始'} 阶段状态
         */
        meetingStage () {
            const {
                startDate,
                endDate,
                cancelTime,
                workStatus
            } = this.curWork
            const {NOTSTART, PROCESSING, MEETING_DONE, CANCEL} = WORK_STATUS

            const now = new Date()
            const startTime = typeof startDate === 'string' ? new Date(startDate.replace(/-/g, '/')) : startDate
            const endTime = typeof startDate === 'string' ? new Date(endDate.replace(/-/g, '/')) : endDate
            let status = {}

            if (cancelTime) {
                status = CANCEL
            } else if (workStatus === 0) { // 避免本地时间与标准时间相差太大，出现显示与状态不同步情况
                if (now < startTime) {
                    status = NOTSTART
                } else if (now < endTime) {
                    status = PROCESSING
                }
            } else {
                status = MEETING_DONE
            }

            return status
        },

        /**
         * 按会议开始时间当天显示倒计时
         * computed countingDownText
         * @return {string}countingText 提示文本-为空表示不显示
         */
        countingDownText () {
            const today = new Date().setHours(0, 0, 0, 0)
            const startDate = new Date(this.curWork.startDate).setHours(0, 0, 0, 0)
            let countingText = ''

            if (this.curWork.currentWorkUser.acceptStatus === 1) {
                countingText = '不参加'
            } else if (this.meetingStage.id === WORK_STATUS.NOTSTART.id) {
                if (today === startDate) {
                    const mins = this.gapMin % 60
                    const hours = (this.gapMin - mins) / 60
                    countingText = `${hours ? hours + '小时' : ''}${Math.ceil(mins)}分钟后开始`
                }
            } else {
                countingText = this.meetingStage.text
            }

            return countingText
        },
        /*
        * 是否是从委托卡片跳转过来的
        * */
        clientOid () {
            return this.curWork.clientOid || ''  // 委托人id
        },

        creatorAcceptGuidanceVisible () {
            return this.isCreator && !this.isPrivate && !this.creatorAcceptGuidanceAppearedCache && this.curWork.actorPersons && this.curWork.actorPersons.length
        },

        creatorFinishGuidanceVisible () {
            return this.isCreator && !this.isPrivate && !this.creatorAcceptGuidanceVisible && !this.creatorFinishGuidanceAppearedCache && this.showSubmitSummaryBtn && this.summaryBtnTxt === '提交会议纪要'
        },

        coworkerAcceptGuidanceVisible () {
            return this.isCoworker && !this.coworkerAcceptGuidanceAppearedCache && this.isRelevantPerson
        },

        coworkerFinishGuidanceVisible () {
            return this.isCoworker && !this.coworkerAcceptGuidanceVisible && !this.coworkerFinishGuidanceAppearedCache && this.showSubmitSummaryBtn && this.summaryBtnTxt === '提交会议意见'
        },

        privateGuidanceVisible () {
            return this.isPrivate && !this.privateGuidanceAppearedCache
        },

        guidanceMaskVisible () {
            if (this.isCreator && !this.isPrivate) {
                if (this.creatorAcceptGuidanceVisible || this.creatorFinishGuidanceVisible) {
                    return true
                } else {
                    return false
                }
            } else if (this.isCoworker) {
                if (this.coworkerAcceptGuidanceVisible || this.coworkerFinishGuidanceVisible) {
                    return true
                } else {
                    return false
                }
            } else if (this.isPrivate) {
                if (this.privateGuidanceVisible) {
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        }
    },
    data () {
        return {
            showReSendPopup: false,
            showRefuse: false,
            workText: '',
            isDone: true,
            hasCmt: false, // 是否有回复（子组件回调
            timeTipsTitle: '提前15分钟提醒',
            isShowFullText: true,
            showFullTextCol: false,
            updateShowFullflag: true,
            showList: false,
            hideRecord: true,

            creatorAcceptGuidance: guidanceData.conInfo.creator.accept,
            creatorAcceptGuidanceAppearedCache: false,
            creatorFinishGuidance: guidanceData.conInfo.creator.finish,
            creatorFinishGuidanceAppearedCache: false,

            coworkerAcceptGuidance: guidanceData.conInfo.coworker.accept,
            coworkerAcceptGuidanceAppearedCache: false,
            coworkerFinishGuidance: guidanceData.conInfo.coworker.finish,
            coworkerFinishGuidanceAppearedCache: false,

            privateGuidanceAppearedCache: true,
            privateGuidance: guidanceData.conInfo.private,

            // 详情页数据是否返回
            dataLoaded: false
        }
    },
    created () {
        this.creatorAcceptGuidanceAppearedCache = window.localStorage.getItem('mywork_guidance_appeared_conInfo_creator_accept')
        this.creatorFinishGuidanceAppearedCache = window.localStorage.getItem('mywork_guidance_appeared_conInfo_creator_finish')

        this.coworkerAcceptGuidanceAppearedCache = window.localStorage.getItem('mywork_guidance_appeared_conInfo_coworker_accept')
        this.coworkerFinishGuidanceAppearedCache = window.localStorage.getItem('mywork_guidance_appeared_conInfo_coworker_finish')

        this.privateGuidanceAppearedCache = window.localStorage.getItem('mywork_guidance_appeared_conInfo_private')

        this.getReady()
        this.handleOldWork()
        this._changeJoinStatus = () => {
            this.initPop()
        }
        // 参加
        this.$bus.$on('changeJoinStatus', this._changeJoinStatus)
        // 不参加
        this.$bus.$on('addComment', this._changeJoinStatus)
    },
    beforeDestroy () {
        this.$bus.$off('changeJoinStatus', this._changeJoinStatus)
        this.$bus.$off('addComment', this._changeJoinStatus)
        this._changeJoinStatus = null
    },
    mounted () {
        setTimeout(() => {
            window.scrollTo(0, 1)
        }, 20)
    },
    updated () {
        // 判定是否需要收起功能 @shuiling_wu
        this.showText()
    },
    methods: {
        ...mapActions(['setCurrentWork', 'setCurWorkStatus', 'getPlanList', 'updateMeetingAcceptStatus', 'cancelMeeting']),
        getDate,
        formatDate,
        reSendSummary () {
            this.$router.push({name: 'MeetingRecord', params: { tag: 'record' }})
        },
        recoverMenu () {
            this.getReady()
            this.handleOldWork()
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
        getReady () {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {'title': '会议详情'})
                },
                webCb: lappmask => {
                    lappmask.resetTitle('会议详情')
                    const obj = {
                        needBack: true
                    }
                    window.parent.postMessage(JSON.stringify(obj), '*')
                }
            })
        },
        getDetail () {
            const me = this
            return new Promise((resolve, reject) => {
                Requests.getConferenceDetail(me.curWork).then(resp => {
                    let work = resp.data
                    // 0 未完成， 1 完成
                    work = Object.assign({isOld: true}, me.curWork, work)
                    me.setCurrentWork(work)
                    me.$nextTick(() => {
                        resolve()
                    })
                })
            })
        },
        getEntrustDetail () {
            // 获取委托详情
            const me = this
            return new Promise((resolve, reject) => {
                Requests.entrustedDetail({
                    'meetingId': me.curWork.id,
                    'clientOid': me.clientOid
                }).then(resp => {
                    let work = resp.data
                    // 0 未完成， 1 完成
                    work.clientOid = me.clientOid
                    delete (me.curWork.isMandatary)

                    work.currentWorkUser && (work.currentWorkUser.oid !== this.$userInfo.openid) && (work.currentWorkUser = {})
                    work = Object.assign({isOld: true}, me.curWork, work)
                    me.setCurrentWork(work)
                    me.$nextTick(() => {
                        resolve()
                    })
                })
            })
        },
        handleOldWork () {
            const me = this
            me.$proms.ready.then(() => {
                if (this.clientOid && this.clientOid !== this.$userInfo.openid) {
                    me.getEntrustDetail().then(() => {
                        me.initPop()
                    })
                } else {
                    me.getDetail().then(() => {
                        me.initPop()
                        this.dataLoaded = true
                    })
                }
            })
        },
        initPop () {
            this.$proms.compEnd.apply(this, [{
                mobileCb: () => {
                    this.createNativePop()
                },
                webCb: () => { this.createWebPop() }
            }])
        },
        createNativePop () {
            const me = this
            const handlers = {
                updateWork: () => {
                    me.$common.datalyEvent({
                        event: '会议进入编辑'
                    })
                    me.$router.push({name: 'Creator'})
                },
                share: () => {
                    me.$common.datalyEvent({
                        event: '会议转发-byNative'
                    })
                    me.nativeShare()
                },
                cancelMeeting: () => {
                    me.$common.datalyEvent({
                        event: '取消会议-byNative'
                    })
                    me.deleteMeeting()
                },
                notJoin: () => {
                    me.$common.datalyEvent({
                        event: '不参加会议-byNative'
                    })
                    me.showRefuse = true
                },
                joinMeeting: () => {
                    me.$common.datalyEvent({
                        event: '参加会议-byNative'
                    })
                    me.changeAcceptStatus(2, '')
                },
                'groupChat': () => {
                    let _goGroupChat = (chatType, id) => {
                        XuntongJSBridge.call('chat', {
                            [chatType]: id
                        }, (res) => {
                            if (res.success === 'false') {
                                _creatGroup()
                            }
                        })
                    }
                    let _creatGroup = () => {
                        const reqData = {
                            id: me.curWork.id,
                            openIds: openIds,
                            groupName: me.curWork.content
                        }
                        Requests.groupChatByMeeting(reqData).then(res => {
                            if (res.data) me.curWork.groupId = res.data
                            let id = res.data ? res.data : me.curWork.groupId
                            _goGroupChat('groupId', id)
                        })
                    }
                    const openIds = []
                    me.curWork.actorPersons.forEach(item => {
                        openIds.push(item.oid)
                    })
                    if (openIds.length === 1) {
                        me.curWork.currentWorkUser.workSource === '1' && _goGroupChat('openId', openIds[0])
                        me.curWork.currentWorkUser.workSource === '2' && _goGroupChat('openId', me.curWork.openid)
                        return
                    }
                    if (me.curWork.groupId) {
                        _goGroupChat('groupId', me.curWork.groupId)
                    } else {
                        _creatGroup()
                    }
                }
            }
            XuntongJSBridge.call('closePop')
            if (!me.isRelevantPerson || me.isCancled) {
                return
            }
            // 默认只提供“转发”功能
            let popInfo = {
                popTitle: '转发',
                popTitleCallBackId: 'share',
                items: [],
                menuList: []
            }
            let { currentWorkUser: {acceptStatus = 0} = {}, workStatus } = me.curWork
            // acceptStatus 会议参加状态, 0: 未响应  1: 不参加, 2: 参加
            acceptStatus = (+acceptStatus)
            // 会议未结束
            if (!workStatus && (me.isCreator || me.canChangeJoinStatus)) {
                popInfo = Object.assign(popInfo, {
                    popTitle: '更多',
                    popTitleCallBackId: 'popTitleCallBack'
                })
                if (me.isCreator) {
                    popInfo.items.push(...[{
                        text: '编辑',
                        callBackId: 'updateWork'
                    }, {
                        text: '转发',
                        callBackId: 'share'
                    }, {
                        text: '取消会议',
                        callBackId: 'cancelMeeting'
                    }])
                } else { // 已经做出了响应，才能进行修改
                    popInfo.items.push(...[{
                        text: '转发',
                        callBackId: 'share'
                    }, {
                        text: (acceptStatus === 1) ? '参加' : '不参加',
                        callBackId: (acceptStatus === 1) ? 'joinMeeting' : 'notJoin'
                    }])
                }
            }
            const addGroupChat = {
                text: '发起群聊',
                callBackId: 'groupChat'
            }
            if (me.curWork.currentWorkUser.workSource === '1' && me.curWork.actorPersons) {
                popInfo = Object.assign(popInfo, {
                    popTitle: '更多',
                    popTitleCallBackId: 'popTitleCallBack'
                })
                popInfo.items.push(addGroupChat)
            }
            XuntongJSBridge.call('createPop', popInfo, (resp) => {
                if (!resp.hasOwnProperty('success') || resp.success === true || resp.success === 'true') {
                    const callBackId = resp.data && resp.data.callBackId || resp.callBackId || 'share'
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
                if (!me.isRelevantPerson || me.isCancled) {
                    return
                }
                const handlers = {
                    '_': () => {},
                    'share': () => {
                        lappmask.removeCreatePop()
                        me.$common.datalyEvent({
                            event: '会议转发-byWeb'
                        })
                        me.webShare()
                        .then(() => {
                            me.initPop()
                        }, () => {
                            me.initPop()
                        })
                    },
                    'editPage': () => {
                        me.$common.datalyEvent({
                            event: '旧任务进入编辑'
                        })
                        me.$router.push({name: 'Creator'})
                    },
                    'cancelMeeting': () => {
                        me.$common.datalyEvent({
                            event: '取消会议-byWeb'
                        })
                        me.deleteMeeting()
                    },
                    'joinMeeting': () => {
                        me.$common.datalyEvent({
                            event: '参加会议-byWeb'
                        })
                        me.changeAcceptStatus(2, '')
                    },
                    'notJoin': () => {
                        me.$common.datalyEvent({
                            event: '不参加会议-byWeb'
                        })
                        me.showRefuse = true
                    }
                }
                const popItemHanlder = (item) => {
                    const {callBackId = '_'} = item
                    const handler = handlers[callBackId] || handlers['_']
                    handler()
                }
                let popInfo = [{
                    text: '转发',
                    callBackId: 'share',
                    callBack: function () {
                        popItemHanlder(this)
                    }
                }]
                let { currentWorkUser: {acceptStatus = 0} = {}, workStatus } = me.curWork
                // acceptStatus 会议参加状态, 0: 未响应  1: 不参加, 2: 参加
                acceptStatus = (+acceptStatus)
                // 会议未结束
                if (!workStatus && (me.isCreator || me.canChangeJoinStatus)) {
                    popInfo = [{
                        text: '更多',
                        popType: 'drop'
                    }]
                    // 创建者可以 “编辑”、“取消”、“转发”所有“未结束”的会议
                    if (me.isCreator) {
                        popInfo.push(...[{
                            text: '&nbsp;&nbsp;&nbsp;&nbsp;编辑&nbsp;&nbsp;&nbsp;&nbsp;',
                            popType: 'flat',
                            callBackId: 'editPage',
                            callBack: function (evt) {
                                popItemHanlder(this)
                            }
                        }, {
                            text: '&nbsp;&nbsp;&nbsp;&nbsp;转发&nbsp;&nbsp;&nbsp;&nbsp;',
                            popType: 'flat',
                            callBackId: 'share',
                            callBack: function (evt) {
                                popItemHanlder(this)
                            }
                        }, {
                            text: '取消会议',
                            popType: 'flat',
                            callBackId: 'cancelMeeting',
                            callBack: function (evt) {
                                popItemHanlder(this)
                            }
                        }])
                    } else { // 做过响应的“协作者”，只能转发和修改之前的响应状态
                        popInfo.push(...[{
                            text: (acceptStatus === 1) ? '转发' : '&nbsp;&nbsp;转发&nbsp;',
                            popType: 'flat',
                            callBackId: 'share',
                            callBack: function (evt) {
                                popItemHanlder(this)
                            }
                        }, {
                            text: (acceptStatus === 1) ? '参加' : '不参加',
                            popType: 'flat',
                            callBackId: (acceptStatus === 1) ? 'joinMeeting' : 'notJoin',
                            callBack: function (evt) {
                                popItemHanlder(this)
                            }
                        }])
                    }
                }
                lappmask.createPop(popInfo)
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
                    title: `${me.$userInfo.username}发起的日程`,
                    content: `${me.curWork.content}`,
                    pageUrl: encodeURIComponent(me.getShareUrl())
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
                title: `${me.$userInfo.username}发起的日程`,
                pageUrl: me.getShareUrl()
            })
            .then(({errorCode}) => {
                if (!errorCode && !this.$proms.isDesktop) {
                    me.$tip.show({ message: '转发成功', duration: 1.5 })
                }
            })
            .catch(({errorCode, error}) => {
                if (+errorCode === 2) {
                    return
                }
                me.$tip.show({ message: error, duration: 1.5 })
            })
        },
        getShareUrl () {
            const { fullPath } = this.$route
            const serverRootUrl = window.location.href.replace(new RegExp(`${fullPath}([/?].+)?`), '')
            return `${serverRootUrl}?workid=${this.curWork.id}&workType=meeting`
        },
        // 修改响应状态 status => 1: 不参加  2: 参加
        changeAcceptStatus (status, reason) {
            if (status === 0) { // 为0时代表手动输入回复
                this.commentEvent(true)
                return
            }
            const me = this
            const {id: meetingId, joinCount} = me.curWork
            this.updateMeetingAcceptStatus({meetingId, status, reason})
            .then(result => {
                if (`${result.success}` === 'true') {
                    me.$tip.show({ message: '会议邀请状态已修改成功', duration: 1.5 })
                    if (status === 1) {
                        const cmtObj = {
                            photoUrl: me.$userInfo.photoUrl,
                            nickName: me.$userInfo.username,
                            openId: me.$userInfo.openid,
                            content: reason,
                            createDate: new Date().getTime()
                        }
                        me.$bus.$emit('addComment', cmtObj)
                    } else {
                        // 修改响应后，重置下“右上角”的菜单列表
                        me.initPop()
                    }
                    // 参加： +1    不参加： -1
                    const newCount = (status === 2) ? 1 : -1
                    me.setCurWorkStatus({'joinCount': joinCount + newCount})
                } else {
                    me.$tip.show({ message: result.error, duration: 1.5 })
                }
            })
            .catch(() => {
                me.$tip.show({ message: '网络异常，请稍后重试！！', duration: 1.5 })
            })
        },
        // 取消会议
        deleteMeeting () {
            const me = this
            const {id: meetingId} = me.curWork
            this.cancelMeeting(meetingId)
            .then(result => {
                if (`${result.success}` === 'true') {
                    me.$proms.compEnd.apply(this, [{
                        webCb: () => {
                            me.$proms.onLappReady().then(lappmask => {
                                lappmask.removeCreatePop()
                            })
                        },
                        mobileCb: () => {
                            XuntongJSBridge.call('closePop')
                        }
                    }])
                    me.$tip.show({ message: '会议取消成功', duration: 1.5 })
                } else {
                    me.$tip.show({ message: result.error, duration: 1.5 })
                }
            })
            .catch(() => {
                me.$tip.show({ message: '网络异常，请稍后重试！！', duration: 1.5 })
            })
        },
        gotoInfo () {
            XuntongJSBridge.call('personInfo', { 'openId': this.curWork.openid })
        },
        commentEvent (isReplyForRefuse) {
            if (isReplyForRefuse) {
                this.$router.push({
                    name: 'Cmt',
                    params: {
                        replyid: '',
                        replyForRefuseType: 2, // 2代表会议
                        changeStatus: true
                    }
                })
                return
            }
            this.$refs.cmtList.cmtEvent()
        },
        changeColor (isBool) {
            isBool && (this.hasCmt = isBool)
        },
        addMeetingRecord () {
            const {hasRecord} = this.curWork
            if (hasRecord) {
                this.$refs.$record.optUpdate(true)
            } else {
                this.$router.push({name: 'MeetingRecord', params: { tag: 'record' }})
            }
        },
        // 切换下一个引导提示
        nextGuidance () {
            if (this.isCreator && !this.isPrivate) {
                if (this.creatorAcceptGuidanceVisible) {
                    this.creatorAcceptGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_conInfo_creator_accept', true)
                } else if (this.creatorFinishGuidanceVisible) {
                    this.creatorFinishGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_conInfo_creator_finish', true)
                } else {
                    this.creatorAcceptGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_conInfo_creator_accept', true)
                    this.creatorFinishGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_conInfo_creator_finish', true)
                }
            } else if (this.isCoworker) {
                if (this.coworkerAcceptGuidanceVisible) {
                    this.coworkerAcceptGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_conInfo_coworker_accept', true)
                } else if (this.coworkerFinishGuidanceVisible) {
                    this.coworkerFinishGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_conInfo_coworker_finish', true)
                } else {
                    this.coworkerAcceptGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_conInfo_coworker_accept', true)
                    this.coworkerFinishGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_conInfo_coworker_finish', true)
                }
            } else if (this.isPrivate) {
                this.privateGuidanceAppearedCache = true
                window.localStorage.setItem('mywork_guidance_appeared_conInfo_private', true)
            } else {

            }
        }
    },
    components: {
        DateTime,
        Popup,
        msgInfo,
        Coworkers,
        CmtList,
        detailGroupBtn,
        detailRemind,
        remindList,
        PageContainer,
        FilePreview,
        refuseToggle,
        Record,
        guidance,
        placeHolder
    }
}
</script>

<style lang="less" rel="stylesheet/less" scoped>
@import "../../css/conference/confInfo";
.iconfont.icon-done {
    color: #32AA70;
    font-size: .30rem;
    margin-right: .07rem;
}
.spliter {
    height: .08rem;
    background-color: #F8F9FB;
}
[v-cloak]{
    display: none !important;
}
.cancled {
    color: #B3B7B9;
    .meeting-icon {
        color: #B3B7B9;
        border: 1px solid #B3B7B9;
    }
    .work-creater {
        color: #B3B7B9;
        .name {
            color:#B3B7B9;
        }
    }
    .work-time {
        color: #B3B7B9;
        span {
            color: #B3B7B9;
        }
    }
    .meeting-loc {
        color: #B3B7B9;
        span {
            color: #B3B7B9;
        }
    }
}
.icon-cancle {
    color: #C2CCD0;
    font-size: .30rem;
    margin-right: .07rem;
}


.coworkers-wrapper,
.button-wrapper {
    position: relative;
}

.guidance-mask {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 999999;
}
</style>
