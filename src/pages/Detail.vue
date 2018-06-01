<template lang="pug">
.detail-page-wrap
    transition(name="fade") 
        place-holder(v-if="!dataLoaded")
    transition(name="fade-slow")    
        .work-detail(:class="{ hasNoCmt: !hasCmt }" v-if="dataLoaded")
            .work-editor
                .work-text(ref="workText" readonly :class="{ finished: preventEdit }")
                    span.work-content {{this.curWork.content}}

            p.show-full-text-btn(v-if="isShowFullText" @click="showTextCol") {{showFullTextCol ? '收起' : '展开'}}
            .work-detail-info
                .work-creater(v-if="curWork.actorPersons && curWork.actorPersons.length" ref="workCreater")
                    i.iconfont.icon-creat
                    span 来自：
                        span.name(@click="gotoInfo") {{curWork.personName}}
                        span &nbsp; {{$moment(curWork.createDate).format('MM月DD日 HH:mm')}}

                .work-time(v-if="curWork.startDate")
                    i.iconfont.icon-time1
                    span 时间：{{showTime}}

            .space30

            FilePreview(v-if="curWork.files && curWork.files.length"
                :fileList="curWork.files"
                @recoverMenu="recoverMenu")

            .space30

            msg-info(v-if="curWork.workData && curWork.workData.attachContent" :work-data="curWork.workData")

            detail-remind(:gap-min="gapMin"
                v-if="isRelevantPerson"
                @recoverMenu="recoverMenu"
                :remind-min="noticeTime"
                :countingText="countingDownText"
                :workStageId="scheduleStage.id"
                :remindTip="false"
                :type="1")
                div(slot="add-comment" :style="{lineHeight: 0}")
                    template(v-if="!isFinished")
                        .commitBtn-wrap(v-if="showSubmitSummaryBtn")
                            .commitBtn(@click="addSummary") {{summaryBtnTxt}}
                        .work-state(v-if="showFinishBtn")
                            a.work-complete-btn(@click.stop="completeClick()") 完成
                    i.iconfont.icon-done(v-if="isFinished")
                    guidance(
                        v-if="creatorFinishGuidanceVisible"
                        :text="creatorFinishGuidance.text"
                        :direction="creatorFinishGuidance.direction"
                        :top="creatorFinishGuidance.top"
                        :right="creatorFinishGuidance.right"
                        :style="{'z-index': 2, 'white-space': 'nowrap'}")

                    guidance(
                        v-if="coworkerFinishGuidanceVisible"
                        :text="coworkerFinishGuidance.text"
                        :direction="coworkerFinishGuidance.direction"
                        :top="coworkerFinishGuidance.top"
                        :right="coworkerFinishGuidance.right"
                        :style="{'z-index': 2, 'white-space': 'nowrap'}")

            .line(v-if="curWork.actorPersons && curWork.actorPersons.length || curWork.record")
            template(v-if="curWork.record")
                record(mRTitle="日程总结" :mRDetail="curWork.record" ref="$record")
                .spliter

            template(v-if="curWork.actorPersons && curWork.actorPersons.length")
                .coworkers-wrapper
                    coworkers(:coworkers="curWork.actorPersons"
                        source="detail"
                        type="schedule"
                        :conflictCoworkers="conflictCoworkers"
                        @showconflict="toggleConflictList")

                    guidance(
                        v-if="creatorAcceptGuidanceVisible"
                        :text="creatorAcceptGuidance.text"
                        :direction="creatorAcceptGuidance.direction"
                        :top="creatorAcceptGuidance.top"
                        :right="creatorAcceptGuidance.right"
                        :style="{'z-index': 2, 'white-space': 'nowrap'}")

            cmt-list(ref="cmtList"
                @changecolor="changeColor"
                @recoverMenu="recoverMenu"
                @re-send-summary="showReSendPopup=true")

            popup(v-if="showComPup"
                :show="showComPup"
                :title="confirmTitle"
                className="check-confirm-popup")
                .work-wrap(slot="content")
                    .work-content(:class="{center: confirmContent.length < 30}") {{confirmContent}}
                    .work-check-btns
                        span(@click="closePopup") 取消
                        span(@click="handleCheck") 确定

            popup(v-if="showReSendPopup"
                :show="showReSendPopup"
                :title="comPupTitle"
                class="check-confirm-popup")
                .work-wrap(slot="content")
                    .work-content.center 重新提交会覆盖原有日程意见，是否继续？
                    .work-check-btns
                        span(@click="showReSendPopup=false") 取消
                        span(@click="reSendSummary") 继续
            detailGroupBtn(v-if="isRelevantPerson" @commentEvent="commentEvent")
            refuseToggle(:popUp="showRefuse"
                :type="1"
                @refuse="changeAcceptStatus"
                @cancelRefuse="showRefuse=false")

            madel-honor(v-if="showMadel"
                :award="award"
                :awardUrl="awardUrl"
                @close-madel-honor="closeHonor")

            guidance(
                v-if="coworkerAcceptGuidanceVisible"
                :text="coworkerAcceptGuidance.text"
                :direction="coworkerAcceptGuidance.direction"
                :bottom="coworkerAcceptGuidance.bottom"
                :left="coworkerAcceptGuidance.left")

            guidance(
                v-if="privateGuidanceVisible"
                :text="privateGuidance.text"
                :direction="privateGuidance.direction"
                :top="privateGuidance.top"
                :right="privateGuidance.right")

            TimeConflict(
                v-if="showConflict"
                :crtConflictPerson="contactedConflictPerson"
                :taskDate="{startDate: curWork.startDate, endDate: curWork.endDate}"
                :meetingId="this.curWork.id"
                :maskStyle="true"
                :close="toggleConflictList")

            .guidance-mask(v-if="guidanceMaskVisible" @click="nextGuidance")
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import {
    getWorkDetail,
    getDate,
    formatDate,
    checkWork } from './works/operate'
import * as Odds from '@/utils/detail-odds'
import DateTime from '@/components/common/DateTime'
import Popup from '@/components/common/Popup'
import msgInfo from '@/components/common/msgInfo'
import detailRemind from '@/components/common/detailRemind'
import refuseToggle from '@/components/common/refuseToggle'
import Coworkers from '@/components/Coworkers'
import CmtList from '@/components/CmtList'
import detailGroupBtn from '@/components/common/detailGroupBtn'
import PageContainer from '@/components/common/PageContainer'
import remindList from '@/components/common/remindList'
import { getSharers, webShare, nativeShare } from '@/modules/share.js'
import FilePreview from '@/components/fileField/FilePreview'
import {WORK_STATUS} from '@/common/remindList'
import Record from '@/components/common/record.vue'
import guidance from '@/components/common/guidance'
import guidanceData from '@/pages/data/guidanceData.js'
import { delWork, queryConflictCoworker } from '@/api/sendRequest'
import TimeConflict from './conflict/TimeConflict'
import placeHolder from '@/components/optimize/placeHolder'

export default {
    name: 'workDetail',
    computed: {
        ...mapGetters({
            curWork: 'curWork'
        }),
        acceptStatus () {
            const {currentWorkUser: {acceptStatus = 0} = {}} = this.curWork
            return +acceptStatus
        },
        needSubmitSummary () {
            const {submitExperience} = this.curWork
            return `${submitExperience}` === 'true'
        },
        summaryBtnTxt () {
            return this.isCreator ? '完成并提交总结' : '完成并提交意见'
        },
        hasSendSummary () {
            const {currentWorkUser: {hasRecord = false} = {}} = this.curWork
            return `${hasRecord}` === 'true'
        },
        showSubmitSummaryBtn () {
            // 没有开始的日程不显示
            if (this.scheduleStage.id === WORK_STATUS.NOTSTART.id) {
                return false
            }
            // 私人日程，不需要提交总结。显示“完成”按钮
            if (this.isPrivate) {
                return false
            }
            // 有协作人的“日程创建者”，需要“完成并提交总结”
            if (this.isCreator) {
                return true
            }
            // 协作者不显示 “完成并提交意见” 1、新建时没有“收集日程意见” 3、用户已经提交意见或总结 4、当前人员不是创建者或者协作人  5、用户未接受邀请
            if (!this.needSubmitSummary || this.hasSendSummary || !this.isRelevantPerson || this.acceptStatus !== 2) {
                return false
            }
            return true
        },
        showFinishBtn () {
            // 未开始的“日程”，不显示“完成”按钮
            if (this.scheduleStage.id === WORK_STATUS.NOTSTART.id) {
                return false
            }
            // 私人日程，显示“完成”按钮
            if (this.isPrivate) {
                return true
            }
            // 创建者只在“私人日程”显示“完成”，其他时候显示“完成并提交总结”
            if (this.isCreator) {
                return false
            }
            // 需要提交意见，不显示”完成“按钮
            if (this.needSubmitSummary) {
                return false
            }
            // 显示”完成按钮“ 1、相关人员 2、接受邀请
            if (this.isRelevantPerson && (this.acceptStatus === 2)) {
                return true
            }
            return false
        },
        isFinished () {
            return this.scheduleStage.id === WORK_STATUS.SCHEDULE_DONE.id
        },
        scheduleTip () {
            const {currentWorkUser: { acceptStatus = 0 } = {}} = this.curWork
            // 仅在倒计时出现时显示此提示
            const showTip = (+acceptStatus) === 2 &&
                !!this.countingDownText &&
                this.scheduleStage.id === WORK_STATUS.NOTSTART.id &&
                (this.isCreator || this.curWork.submitExperience)
            return showTip && (this.isCreator ? '开始后可提交日程总结' : '开始后可提交日程意见')
        },
        startTime () {
            return this.curWork.startDate ? this.formatDate(this.curWork.startDate) : ''
        },
        endTime () {
            return this.curWork.endDate ? this.formatDate(this.curWork.endDate) : ''
        },
        showTime () {
            let start = this.$moment(this.curWork.startDate).format('YYYY-MM-DD')
            let end = this.$moment(this.curWork.endDate).format('YYYY-MM-DD')
            let reg = new RegExp('[0-9]{2}:[0-9]{2}')
            if (start === end) {
                let _start = this.startTime.match(reg) ? this.startTime.match(reg)[0] : ''
                return this.startTime.replace(_start, '') + '  ' +
                    this.$moment(this.curWork.startDate).format('HH:mm') +
                    ' - ' + this.$moment(this.curWork.endDate).format('HH:mm')
            } else {
                return this.startTime + ' — ' + this.endTime
            }
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
        },
        isCoworker () {
            return this.curWork.workSource === '2'
        },

        // 此日程是否为个人日程, 即: 没有协作人
        isPrivate () {
            return this.isCreator &&
                ((!this.curWork.actorPersons) ||
                (this.curWork.actorPersons && this.curWork.actorPersons.length <= 0))
        },

        // 开始时间距离当前时间的分钟间隔
        gapMin () {
            return -(this.$moment().diff(this.curWork.startDate, 'seconds') / 60)
        },
        // 是否超过截止时间
        isOutDate () {
            let now = Date.now()
            let endTime = new Date(this.curWork.endDate).getTime()
            return endTime < now
        },
        noticeTime () {
            return this.curWork.currentWorkUser &&
            this.curWork.currentWorkUser.noticeTime
        },

        // 如果不接受时不可编辑详情页
        noEdit () {
            return this.curWork.currentWorkUser &&
            this.curWork.currentWorkUser.acceptStatus === 1
        },

        /**
         * 根据当前日程时间与完成状态判断日程进行阶段
         * computed scheduleStage
         * 0-NOTSTART-未开始 1-PROCESSING-进行中 4-SCHEDULE_DONE-已完成 5-OVERDUE-已逾期
         * @return {object}status|{id: 0, text: '未开始'} 阶段状态
         */
        scheduleStage () {
            const {
                startDate,
                endDate,
                currentWorkUser: {
                    workStatus
                }
            } = this.curWork
            const {NOTSTART, PROCESSING, SCHEDULE_DONE, OVERDUE} = WORK_STATUS

            const now = new Date()

            let status = {}

            if (workStatus === 1) {
                status = SCHEDULE_DONE
            } else if (now < startDate) {
                status = NOTSTART
            } else if (now < endDate) {
                status = PROCESSING
            } else {
                status = OVERDUE
            }

            return status
        },

        /**
         * 显示日程当前阶段，开始时间当天显示倒计时
         * @computed countingDownText
         * @return {string}countingText 提示文本-为空则不显示
         */
        countingDownText () {
            const today = new Date().setHours(0, 0, 0, 0)
            const startDay = new Date(this.curWork.startDate).setHours(0, 0, 0, 0)
            let countingText = ''

            if (this.scheduleStage.id === WORK_STATUS.NOTSTART.id) {
                if (today === startDay) {
                    const mins = this.gapMin % 60
                    const hours = (this.gapMin - mins) / 60
                    countingText = `${hours ? hours + '小时' : ''}${Math.ceil(mins)}分钟后开始`
                }
            } else {
                countingText = this.scheduleStage.text
            }

            return countingText
        },
        showMadel () {
            return this.showHonor && this.$proms.isMobile
        },

        creatorAcceptGuidanceVisible () {
            return this.isCreator &&
                !this.isPrivate &&
                !this.creatorAcceptGuidanceAppearedCache &&
                this.curWork.actorPersons &&
                this.curWork.actorPersons.length
        },

        creatorFinishGuidanceVisible () {
            return this.isCreator &&
                !this.isPrivate &&
                !this.creatorAcceptGuidanceVisible &&
                !this.creatorFinishGuidanceAppearedCache &&
                this.showSubmitSummaryBtn
        },

        coworkerAcceptGuidanceVisible () {
            return this.isCoworker &&
                !this.coworkerAcceptGuidanceAppearedCache &&
                this.isRelevantPerson
        },

        coworkerFinishGuidanceVisible () {
            return this.isCoworker &&
                !this.coworkerAcceptGuidanceVisible &&
                !this.coworkerFinishGuidanceAppearedCache &&
                (this.showSubmitSummaryBtn || this.showFinishBtn)
        },

        privateGuidanceVisible () {
            return this.isPrivate &&
                !this.privateGuidanceAppearedCache
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
            completeTips: '已完成，你太棒啦', // "完成"后，显示的tips
            showHonor: false,
            award: '',
            awardUrl: '',
            showReSendPopup: false,
            showRefuse: false,
            workText: '',

            notifyPop: {
                show: false,
                title: {
                    show: true,
                    content: '一键提醒'
                }
            },
            isNotified: false,
            hasCmt: false,   // 是否有回复（子组件回调）
            popUp: false,
            isAccept: true,
            workState: 1,    // 1：未完成；2：进行中；3：已逾期；4：完成；
            netWorkState: 0,    // 0：未完成；1：完成；
            timeTipsTitle: '提前15分钟提醒',
            isShowFullText: true,
            showFullTextCol: false,
            showComPup: false,
            updateShowFullflag: true,
            showList: false,
            comPupTitle: {
                show: true,
                content: ' '
            },
            confirmTitle: {
                show: true,
                content: '完成这项日程'
            },
            confirmContent: '',

            creatorAcceptGuidance: guidanceData.detail.creator.accept,
            creatorAcceptGuidanceAppearedCache: false,
            creatorFinishGuidance: guidanceData.detail.creator.finish,
            creatorFinishGuidanceAppearedCache: false,

            coworkerAcceptGuidance: guidanceData.detail.coworker.accept,
            coworkerAcceptGuidanceAppearedCache: false,
            coworkerFinishGuidance: guidanceData.detail.coworker.finish,
            coworkerFinishGuidanceAppearedCache: false,

            privateGuidanceAppearedCache: true,
            privateGuidance: guidanceData.detail.private,

            conflictCoworkers: [],
            showConflict: false,
            contactedConflictPerson: {},
            // 详情数据是否返回
            dataLoaded: false
        }
    },
    created () {
        // this.setGuidanceAppeared()

        this.creatorAcceptGuidanceAppearedCache =
            window.localStorage.getItem('mywork_guidance_appeared_detail_creator_accept')
        this.creatorFinishGuidanceAppearedCache =
            window.localStorage.getItem('mywork_guidance_appeared_detail_creator_finish')

        this.coworkerAcceptGuidanceAppearedCache =
            window.localStorage.getItem('mywork_guidance_appeared_detail_coworker_accept')
        this.coworkerFinishGuidanceAppearedCache =
            window.localStorage.getItem('mywork_guidance_appeared_detail_coworker_finish')

        this.privateGuidanceAppearedCache =
            window.localStorage.getItem('mywork_guidance_appeared_detail_private')

        this.loadHonor()
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
    watch: {
        curWork: {
            handler (newVal) {
                if (newVal.id) {
                    this.loadHonor()
                }
            },
            deep: true
        }
    },
    methods: {
        ...mapActions(['setCurrentWork', 'getPlanList', 'cancelWork', 'updateScheduleAcceptStatus']),
        getWork: Odds.getWork,
        confirmNotify: Odds.confirmNotify,
        getDate,
        formatDate,
        loadHonor () {
            let replyHonor = sessionStorage.getItem(`${this.curWork.id}`)
            sessionStorage.removeItem(`${this.curWork.id}`)
            let showTips = sessionStorage.getItem(`${this.curWork.id}-tips`)
            sessionStorage.removeItem(`${this.curWork.id}-tips`)
            // 提示信息
            let tipsPromise = Promise.resolve()
            if (showTips) {
                tipsPromise = this.$tip.show({message: this.completeTips})
            }
            if (replyHonor && this.$proms.isMobile) {
                try {
                    replyHonor = JSON.parse(replyHonor)
                    // 先显示提示信息，然后显示“勋章”
                    tipsPromise.then(() => {
                        this.award = replyHonor.award
                        this.awardUrl = replyHonor.awardUrl
                        this.showHonor = !!(this.award && this.awardUrl)
                    })
                } catch (e) {
                }
            }
        },
        limitStr (str, length) {
            let arr = str.split('')
            let len = arr.length
            let res = ''
            for (var b = 0, i = 0; i < len; i++) {
                /[^\x00-\xFF]/.test(arr[i]) ? b += 2 : b++
                if (b >= length) break
            }
            if (b >= length) {
                res = str.substring(0, i) + '...'
            } else {
                res = str
            }
            return res
        },
        closeHonor () {
            this.showHonor = false
        },
        reSendSummary () {
            this.$router.push({name: 'MeetingRecord', params: { tag: 'record' }})
        },
        recoverMenu () {
            this.getReady()
            this.handleOldWork()
        },
        getReady () {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {'title': '日程详情'})
                },
                webCb: lappmask => {
                    lappmask.resetTitle('日程详情')
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
                    this.queryConflictList()
                    this.dataLoaded = true
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
                    me.$common.datalyEvent({event: '旧任务进入编辑'})
                    me.$router.push({name: 'Editor'})
                },
                share: () => {
                    me.$common.datalyEvent({event: '日程转发-byNative'})
                    me.nativeShare()
                },
                cancelSchedule: () => {
                    me.$common.datalyEvent({event: '取消日程-byNative'})
                    me.deleteWork()
                },
                notJoin: () => {
                    me.$common.datalyEvent({event: '取消接受日程-byNative'})
                    me.showRefuse = true
                },
                joinSchedule: () => {
                    me.$common.datalyEvent({event: '接受日程-byNative'})
                    me.changeAcceptStatus(2, '')
                }
            }
            // 不是“相关人员”，则不显示右上角的“操作”
            XuntongJSBridge.call('closePop')
            if (!me.isRelevantPerson) {
                return
            }
            const { workStatus } = me.curWork
            // 日程结束了 只能转发
            if (+workStatus === 1) {
                XuntongJSBridge.call('createPop', {
                    popTitle: '转发',
                    popTitleCallBackId: 'popTitleCallBack'
                }, resp => {
                    handlers.share()
                })
                return
            }
            // 未结束的日程都可以删除、转发
            const popInfo = {
                popTitle: '更多',
                popTitleCallBackId: 'popTitleCallBack',
                items: [{
                    text: '转发',
                    callBackId: 'share'
                }, {
                    text: '删除日程',
                    callBackId: 'cancelSchedule'
                }],
                menuList: []
            }
            // const items = []
            // 日程创建者有”编辑权限“
            // alert(JSON.stringify(me.curWork.workSource))
            // alert(JSON.stringify(me.isCreator))
            // 在移动端这里isCreator判断有问题，暂时以workSource来判断
            if (me.curWork.workSource === '1') {
                popInfo.items.unshift({
                    text: '编辑',
                    callBackId: 'editPage'
                })
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
                const { workStatus } = me.curWork
                // 日程结束了 只能转发
                if (+workStatus === 1) {
                    lappmask.createPop([{
                        text: '转发',
                        callBack: (evt) => {
                            lappmask.removeCreatePop()
                            this.$common.datalyEvent({
                                event: '转发日程-byWeb'
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
                const items = [{
                    text: '更多',
                    popType: 'drop'
                }, {
                    text: '&nbsp;&nbsp;&nbsp;&nbsp;转发&nbsp;&nbsp;&nbsp;&nbsp;',
                    popType: 'flat',
                    callBack: (evt) => {
                        // 点击转发后，删除右上角的“操作”按钮
                        lappmask.removeCreatePop()
                        me.$common.datalyEvent({ event: '转发日程' })
                        me.webShare()
                        .then(() => {
                            // 选人分享人后，重新设置右上角的“操作”按钮
                            me.initPop()
                        }, () => {
                            me.initPop()
                        })
                    }
                }, {
                    text: '删除日程',
                    popType: 'flat',
                    callBack: (evt) => {
                        me.$common.datalyEvent({
                            event: '删除日程-byWeb'
                        })
                        me.deleteWork()
                    }
                }]
                if (me.isCreator) {
                    items.splice(1, 0, {
                        text: '&nbsp;&nbsp;&nbsp;&nbsp;编辑&nbsp;&nbsp;&nbsp;&nbsp;',
                        popType: 'flat',
                        callBack: (evt) => {
                            me.$common.datalyEvent({
                                event: '旧任务进入编辑'
                            })
                            me.$router.push({name: 'Editor'})
                        }
                    })
                }
                lappmask.createPop(items)
            })
        },
        webShare () {
            const me = this
            return getSharers({
                multi: true,
                needSession: true,
                needContract: true
            }).then(shares => {
                webShare({
                    appId: 10619,
                    lightAppId: 10619,
                    title: `${me.$userInfo.username}发起的日程`,
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
                title: `${me.$userInfo.username}发起的日程`,
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
            return `${serverRootUrl}?workid=${this.curWork.id}`
        },
        changeAcceptStatus (status, reason) {
            const me = this
            const {id: workId} = me.curWork
            this.updateScheduleAcceptStatus({workId, status, reason})
            .then(result => {
                if (`${result.success}` === 'true') {
                    // 重置 右上角的“操作”菜单
                    me.initPop()
                    me.$tip.show({ message: '日程邀请状态已修改成功', duration: 1.5 })
                } else {
                    me.$tip.show({ message: '小云可能累了，请稍后再试', duration: 1.5 })
                }
            })
            .catch(() => {
                me.$tip.show({ message: '小云可能累了，请稍后再试', duration: 1.5 })
            })
        },
        deleteWork () {
            const me = this
            delWork(me.curWork)
            .then(result => {
                if (`${result.success}` === 'true') {
                    me.$tip.show({message: '日程已成功删除'})
                    .then(() => {
                        me.$router.go(-1)
                    })
                } else {
                    me.$tip.show({message: '小云可能累了，请稍后再试'})
                }
            })
            .catch(() => {
                me.$tip.show({message: '小云可能累了，请稍后再试'})
            })
        },
        // 点击完成按钮 @shuiling_wu
        completeClick () {
            this.confirmContent = this.limitStr(this.curWork.content, 130)
            this.showComPup = true
        },
        // 关闭完成弹窗 @shuiling_wu
        closePopup () {
            this.showComPup = false
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
            this.showFullTextCol ? this.$refs.workText
                .getElementsByClassName('work-content')[0]
                .setAttribute('class', 'work-content') : this.$refs.workText
                .getElementsByClassName('work-content')[0]
                .setAttribute('class', 'work-content work-content-ellipsis')
        },
        // 唤起提醒弹窗页面 @shuiling_wu
        popList () {
            if (this.$refs.workTimeTips.className.indexOf('work-time-tips-s') > 0) {
                return
            }
            this.showList = true
        },
        // 设置为已完成
        handleCheck () {
            checkWork(this.curWork, -1, 2).then(resp => {
                this.$tip.show({
                    message: this.completeTips
                })
                this.closePopup()
                const curWork = Object.assign({}, this.curWork, {
                    currentWorkUser: Object.assign({}, this.curWork.currentWorkUser, {
                        workStatus: 1
                    })
                })
                this.setCurrentWork(curWork)
                const {data: {award, awardUrl} = {}} = resp
                this.award = award
                this.awardUrl = awardUrl
                this.showHonor = !!(award && awardUrl)
            })
        },
        changeColor (isBool) {
            isBool && (this.hasCmt = isBool)
        },
        gotoInfo () {
            XuntongJSBridge.call('personInfo', { 'openId': this.curWork.openid })
        },
        commentEvent () {
            this.$refs.cmtList.cmtEvent()
        },
        cancelRefuse () {
            this.popUp = false
        },
        handlerAccept (type, reason) {
            let data = {
                workId: this.curWork.id,
                acceptStatus: type,
                reason: reason || ''
            }
            this.acceptwork(data).then(resp => {
                if (resp.success === 'true') {
                    if (type === 2) {
                        this.$tip.show({
                            message: '已接受'
                        }).then(() => {
                            this.isAccept = false
                        })
                    } else {
                        this.$router.go(-1)
                    }
                } else {
                    this.$tip.show({
                        message: '小云可能累了，请稍后再试'
                    })
                }
            }, () => {
                this.$tip.show({
                    message: '网络错误，请稍后再试'
                })
            })
        },
        addSummary () {
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
                    window.localStorage.setItem('mywork_guidance_appeared_detail_creator_accept', true)
                } else if (this.creatorFinishGuidanceVisible) {
                    this.creatorFinishGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_detail_creator_finish', true)
                } else {
                    this.creatorAcceptGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_detail_creator_accept', true)
                    this.creatorFinishGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_detail_creator_finish', true)
                }
            } else if (this.isCoworker) {
                if (this.coworkerAcceptGuidanceVisible) {
                    this.coworkerAcceptGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_detail_coworker_accept', true)
                } else if (this.coworkerFinishGuidanceVisible) {
                    this.coworkerFinishGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_detail_coworker_finish', true)
                } else {
                    this.coworkerAcceptGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_detail_coworker_accept', true)
                    this.coworkerFinishGuidanceAppearedCache = true
                    window.localStorage.setItem('mywork_guidance_appeared_detail_coworker_finish', true)
                }
            } else if (this.isPrivate) {
                this.privateGuidanceAppearedCache = true
                window.localStorage.setItem('mywork_guidance_appeared_detail_private', true)
            } else {
            }
        },

        /**
         * 根据是否有协作人或日程未开始决定是否请求冲突人列表
         * @method queryConflictList
         */
        queryConflictList () {
            const {actorPersons, startDate, endDate} = this.curWork
            const noActorPerson = !actorPersons || !actorPersons.length
            if (!this.isCreator || this.scheduleStage.id !== WORK_STATUS.NOTSTART.id || noActorPerson) return

            const oids = actorPersons.map(staff => staff.oid)
            if (!oids.length) return

            queryConflictCoworker({
                meetingId: this.curWork.id,
                oids: oids.join(','),
                startDate,
                endDate,
                type: 'work'
            }).then((reps) => {
                this.conflictCoworkers = reps.data
            })
        },

        /**
         * @method toggleConflictList 显示隐藏冲突列表弹框
         */
        toggleConflictList (staff = {}) {
            if (this.showConflict) {
                this.showConflict = false
                this.contactedConflictPerson = {}
                return
            }

            const {id, name, img} = staff
            this.showConflict = true
            this.contactedConflictPerson = {
                staffId: id,
                staffName: name,
                img,
                creator: this.$userInfo.oid
            }
        }
    },

    components: {
        DateTime,
        Popup,
        msgInfo,
        detailRemind,
        Coworkers,
        CmtList,
        detailGroupBtn,
        refuseToggle,
        PageContainer,
        remindList,
        Record,
        FilePreview,
        guidance,
        TimeConflict,
        placeHolder
    }
}
</script>

<style lang="less" rel="stylesheet/less" scoped>
@import "../css/schedule/detail";
.iconfont.icon-done {
    color: #32AA70;
    font-size: .30rem;
    margin-right: .07rem;
}
.spliter {
    height: .08rem;
    background-color: #F8F9FB;
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
