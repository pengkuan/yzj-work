<template lang="pug">
    .work-detail(:class="{noScroll: showConflict}")
        // 工作编辑
        ContentEditor(
            :work-text="workInfo.textContent"
            @textchange="onTextChange"
            :placeholder="placeholder")

        msg-info(v-if="workInfo.workData"
            :work-data="workInfo.workData")

        // 工作时间范围
        date-set

        .remind-wrapper
            remind(:gap-min="gapMin"
                @type="1"
                @recoverMenu="recoverMenu"
                v-model="remindObj")
            guidance(
                v-if="remindGuidanceVisible"
                :text="remindGuidance.text"
                :direction="remindGuidance.direction"
                :top="remindGuidance.top"
                :right="remindGuidance.right"
            )

        .spliter

        .toggle-view(:class="{expand: isExpand}"
            @click="isExpand = !isExpand")
            label.label 更多
                span(v-if="$proms.isMobile") (收集意见、重要、附件等)
                span(v-else) (收集意见、重要等)
            i.iconfont.icon-youjiantou

        .cell-wrap(v-if="isExpand"
            :class="{collapse: isExpand}")
            .set-top
                span.set-top-title 收集协作人意见
                .set-top-icon(@click="updateSubmitExperience"
                    :class="{active: workInfo.submitExperience}")
            .line
            .set-top
                span.set-top-title(@click="version = true") 重要
                //- .set-top-icon(@click="setTop"
                    :class="{active: workInfo.topState}")
                .set-important(@click="setTop"
                    :class="{'icon-important': !workInfo.topState, 'icon-stars': workInfo.topState}")

            FileField(v-if="$proms.isMobile" v-model="files")

        // 协作人
        .coworkers-wrapper
            coworkers(
                :coworkers="curWork.actorPersons"
                :conflictCoworkers="workInfo.conflictCoworkers"
                @staffchange="onStaffChange"
                @oldidschange="onOldIdsChange"
                @showconflict="toggleConflictList"
                source="editor"
                type="schedule"
                ref="coworkers")
            guidance(
                v-if="coworkerGuidanceVisible"
                :text="coworkerGuidance.text"
                :direction="coworkerGuidance.direction"
                :top="coworkerGuidance.top"
                :left="coworkerGuidance.left"
            )
        .detail-bottom

        // 版本号
        .version(v-if="version") {{timeline}}

        .del-btn(v-if="!$proms.isMobile && this.curWork.isOld"
            @click="delSchedule") 删除
        madel-honor(v-if="showMadel" :award="award" :awardUrl="awardUrl" @close-madel-honor="closeHonor")
        TimeConflict(
            v-if="showConflict"
            :crtConflictPerson="contactedConflictPerson"
            :taskDate="taskDate"
            :meetingId="this.curWork.id"
            :maskStyle="true"
            :close="toggleConflictList"
        )
        .guidance-mask(v-if="guidanceMaskVisible" @click="nextGuidance")
</template>

<script>
import { scheduleMap } from '@/common/remindList'
import {mapGetters, mapActions} from 'vuex'
import * as Operate from './works/operate'
import * as WorkOdds from '@/utils/work-odds'
import {getdiff} from '@/utils/detail-odds'
import Popup from '@/components/common/Popup'
import msgInfo from '@/components/common/msgInfo'
import remind from '@/components/common/remind'
import DateSet from '@/components/common/DateSet'
import ContentEditor from '@/components/common/ContentEditor'
import Coworkers from '@/components/Coworkers'
import FileField from '@/components/fileField/FileField'
import guidance from '@/components/common/guidance'
import guidanceData from '@/pages/data/guidanceData.js'
import TimeConflict from './conflict/TimeConflict'
import * as Requests from '@/api/sendRequest'

export default {
    name: 'Editor',
    computed: {
        ...mapGetters({
            curWork: 'curWork',
            taskDate: 'taskDate'
        }),
        placeholder () {
            return this.$proms.isMobile ? '请输入或语音录入日程内容' : '请输入日程内容'
        },
        gapMin () {
            return Math.abs(this.$moment().diff(this.taskDate.startDate, 'seconds') / 60)
        },
        showMadel () {
            return this.showHonor && this.$proms.isMobile
        },
        remindGuidanceVisible () {
            return !this.remindGuidanceAppearedCache
        },

        coworkerGuidanceVisible () {
            return !this.remindGuidanceVisible && !this.coworkerGuidanceAppearedCache
        },

        guidanceMaskVisible () {
            if (this.remindGuidanceVisible || this.coworkerGuidanceVisible) {
                return true
            } else {
                return false
            }
        }
    },
    data () {
        return {
            showHonor: false,
            award: '',
            awardUrl: '',
            // 区分创建类型，[1: 日程， 2: 会议]
            type: 1,
            version: false,
            workInfo: {
                staffList: [],
                textContent: '',
                oldIds: [],

                // 是否置顶[0: 不置顶， 1：置顶]
                topState: 0,

                // 是否是消息转过来的
                isFromMsg: true,
                workData: null,
                submitExperience: false,
                conflictCoworkers: []
            },

            // 记录是否选过提醒时间，便于后面再次修改开始时间时是否要重置
            isChooseRemind: false,

            // 开始时间距离当前时间的分钟间隔
            // gapMin: 0,

            // 日程提醒的默认时间是日程开始时
            remindObj: {
                remindMin: 0,
                remindValue: '日程开始时'
            },
            mapValue: scheduleMap,

            // 防止重复保存的
            isSaving: false,
            isExpand: false,
            files: [],

            // 用户是否弹出过创建日程时的[提醒]新手指引
            remindGuidance: guidanceData.editor.remind,
            remindGuidanceAppearedCache: false,

            // 用户是否弹出过创建日程时的[协作人]新手指引
            coworkerGuidance: guidanceData.editor.coworker,
            coworkerGuidanceAppearedCache: false,

            showConflict: false,
            contactedConflictPerson: {}
        }
    },
    watch: {
        taskDate: 'queryConflictCoworkers',
        'workInfo.staffList': 'queryConflictCoworkers',
        'taskDate.startDate' () {
            if (this.isChooseRemind === true) {
                this.remindObj = {
                    remindMin: 0,
                    remindValue: '日程开始时'
                }
            }
            this.isChooseRemind = true
        },
        showMadel: function (newVal) {
            if (newVal) {
                // 去掉顶部的操作
                this.$proms.compEnd.call(this, {
                    mobileCb: () => {
                        XuntongJSBridge.call('closePop')
                    },
                    webCb: () => {
                        lappmask.removeCreatePop()
                    }
                })
            }
        }
    },
    created () {
        this.remindGuidanceAppearedCache = window.localStorage.getItem('mywork_guidance_appeared_editor_remind')
        this.coworkerGuidanceAppearedCache = window.localStorage.getItem('mywork_guidance_appeared_editor_coworker')

        this.getReady()
        // 语音助手转过来的
        if (this.$mywork.voiceContent) {
            this.workInfo.textContent = this.$mywork.voiceContent
            return
        }
        if (this.$mywork.msgId) {
            this.$http.post('/cloudwork/work/getXunTongMessage', {
                msgId: this.$mywork.msgId,
                groupId: this.$mywork.groupId
            }).then(resp => {
                this.workInfo.workData = resp.data

                // 判断是否是文字
                let workData = this.workInfo.workData
                if (workData && typeof workData.attachContent === 'string') {
                    this.workInfo.textContent = workData.attachContent
                }
                // 置空msgId 避免影响后面的工作创建
                this.$mywork.msgId = ''
            })
        }

        // 编辑已经创建的工作
        if (this.curWork.isOld) {
            this.isExpand = true
            this.recoverWork()
        }
        this.files = this.curWork.files && [...this.curWork.files] || []
    },
    methods: {
        ...mapActions(['setCurrentWork', 'getPlanList', 'setWorkDate']),

        /**
         * 日程时间变化和协作人增加时查询日程冲突人
         * @method queryConflictCoworkers
         */
        queryConflictCoworkers () {
            const oids = this.workInfo.staffList.map(staff => staff.id)
            if (!oids.length) return

            Requests.queryConflictCoworker({
                meetingId: this.curWork.id,
                type: 'work',
                oids: oids.join(','),
                startDate: this.taskDate.startDate,
                endDate: this.taskDate.endDate
            }).then((reps) => {
                this.workInfo.conflictCoworkers = reps.data
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
        },

        delWorkData: WorkOdds.delWorkData,
        closeHonor () {
            this.showHonor = false
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    // this.curWork.fromCard || this.$mywork.voiceContent
                    // ? XuntongJSBridge.call('closeWebView') : this.$router.go(-1)
                    this.$router.go(-1)
                },
                webCb: () => {
                    this.$router.go(-1)
                }
            })
        },
        recoverMenu () {
            this.getReady()
            // 编辑已经创建的工作
            if (this.curWork.isOld) {
                this.$proms.compEnd.call(this, {
                    mobileCb: () => {
                        XuntongJSBridge.call('setWebViewTitle', {'title': '编辑日程'})
                    },
                    webCb: lappmask => {
                        lappmask.resetTitle('编辑日程')
                    }
                })
                this.handleOldWork()
            }
        },
        onTextChange (newText) {
            this.workInfo.textContent = newText
        },

        // todo 待优化  @weilin_zhou
        onStaffChange (newval) {
            this.workInfo.staffList = newval
        },

        // todo 待优化，以后会改为走vuex @weilin_zhou
        onOldIdsChange (newval) {
            this.workInfo.oldIds = newval
        },

        /**
         * 创建工作
         * @method createWork
         * @return {undefined} undefined
        */
        createWork () {
            this.$common.datalyEvent({ event: '点击日程新建保存按钮' })
            // 防止高频重复提交
            if (!this.isSaving) {
                this.isSaving = true
            } else {
                this.$tip.show({
                    message: '正在保存'
                })
                return
            }
            if (!this.workInfo.textContent.trim()) {
                this.$tip.show({
                    message: '内容不能为空'
                })
                return
            }
            if (this.$moment(this.taskDate.startDate).valueOf() >
            this.$moment(this.taskDate.endDate).valueOf()) {
                this.$tip.show({
                    message: '开始时间不能晚于截止时间'
                })
                return
            }
            let diff = getdiff(this.workInfo.staffList, this.workInfo.oldIds)
            let data = {
                content: this.workInfo.textContent,
                personName: this.$userInfo.username,
                workSource: '1',

                // 当前所有协作人openid
                actorOpenids: diff.pids.toString(),
                actorNames: diff.names.toString(),
                endDate: this.taskDate.endDate,
                startDate: this.taskDate.startDate,

                // 是否设置了置顶
                topState: this.workInfo.topState,
                submitExperience: this.workInfo.submitExperience,

                // 消息数据
                workData: this.workInfo.workData || {},
                noticeTime: this.remindObj.remindMin,
                files: this.files
            }
            let result = Operate.addWork(data)
            result.then(resp => {
                if (this.$mywork.voiceContent && resp.success) {
                    this.$http.post('/gateway/robot-assistant/dataCollection', {
                        type: 'schedule',
                        data: {
                            id: this.$mywork.id || this.$mywork.voice.msgId,
                            time: Date.now(),
                            action: 'save',
                            scheduleId: resp.data.workId
                        }
                    })
                }
                this.$tip.show({
                    message: data.actorOpenids ? '创建成功，已通知协作人' : '添加成功',
                    duration: 1.5
                }).then(val => {
                    const {data: {award, awardUrl} = {}} = resp
                    this.award = award
                    this.awardUrl = awardUrl
                    this.showHonor = !!(award && awardUrl)
                    if (!this.showMadel) {
                        this.$proms.compEnd.call(this, {
                            mobileCb: () => {
                                this.$common.urlParams = {}
                                this.$router.go(-1)
                            },
                            webCb: () => {
                                // this.$router.go(-1)
                                this.$router.push({ name: 'Index' })
                            }
                        })
                    }
                })
                this.isSaving = false
            })
        },

        /**
         * 更新工作
         * @method update
         * @return {undefined} undefined
        */
        update () {
            if (!this.workInfo.textContent.trim()) {
                this.$tip.show({
                    message: '内容不能为空'
                })
                return
            }
            let diff = getdiff(this.workInfo.staffList, this.workInfo.oldIds)

            const pro = Operate.updateWork({
                id: this.curWork.id,
                endDate: this.taskDate.endDate,
                startDate: this.taskDate.startDate,
                content: this.workInfo.textContent,
                // 当前所有协作人openid
                actorOpenids: {
                    totalOpenids: diff.pids.toString(),
                    totalactorNames: diff.names.toString()
                },
                // 增加的协作人
                addActors: {
                    addopenids: diff.addIds.toString(),
                    addpersonnames: diff.addNames.toString()
                },
                // 被删除的协作人
                delActors: diff.delIds.toString(),
                submitExperience: this.workInfo.submitExperience,
                topState: this.workInfo.topState,
                // 消息数据
                workData: this.workInfo.workData || {},
                noticeTime: this.remindObj.remindMin,
                files: this.files
            })

            pro.then(resp => {
                this.$tip.show({
                    message: '修改成功',
                    duration: 1.5
                }).then(val => {
                    this.$router.push({ name: 'Index' })
                })
            })
        },

        // 共用创建方法
        getReady () {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {
                        title: '新建日程'
                    })
                    XuntongJSBridge.call('createPop', {
                        popTitle: '提交',
                        popTitleCallBackId: 'addWork'
                    }, resp => {
                        this.$common.datalyEvent({
                            event: '提交按钮点击'
                        })
                        this.curWork.isOld ? this.update(Operate.updateWork) : this.createWork()
                    })
                },
                webCb: lappmask => {
                    lappmask.resetTitle('新建日程')
                    lappmask.removeCreatePop()
                    const obj = {
                        needBack: true
                    }
                    window.parent.postMessage(JSON.stringify(obj), '*')
                    lappmask.createPop([{
                        text: '提交',
                        callBack: evt => {
                            this.curWork.isOld ? this.update(Operate.updateWork) : this.createWork()
                        }
                    }])
                }
            })
        },

        // 把工作的数据恢复到对应的数据区域
        recoverWork () {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {
                        title: '编辑工作'
                    })
                },
                webCb: lappmask => {
                    lappmask.resetTitle('编辑工作')
                }
            })
            let curWork = this.curWork
            this.workInfo.textContent = curWork.content
            this.setWorkDate({
                startDate: curWork.startDate,
                endDate: curWork.endDate
            })
            this.workInfo.submitExperience = curWork.submitExperience
            this.workInfo.topState = curWork.topState
            this.workInfo.workData = curWork.workData &&
                curWork.workData.msgId ? curWork.workData : null
            this.workInfo.noticeTime = curWork.currentWorkUser.noticeTime
            this.recoverRemind()
            setTimeout(() => {
                this.isChooseRemind = true
            }, 0)
        },

        // 设置为已完成
        handleCheck () {
            Operate.checkWork(this.curWork, -1, 2).then(resp => {
                this.$tip.show({
                    message: '已完成',
                    duration: 1.5
                }).then(() => {
                    this.$router.go(-1)
                })
            })
        },

        recoverRemind () {
            this.mapValue.filter((item) => {
                if (this.workInfo.noticeTime === item.minute) {
                    this.remindObj = {
                        remindMin: item.minute,
                        remindValue: item.value
                    }
                }
            })
        },
        setTop () {
            if (this.curWork.isOld) {
                this.$common.datalyEvent({ event: '新建日程时点击重要' })
            }
            this.workInfo.topState === 0
            ? (this.workInfo.topState = 1) : (this.workInfo.topState = 0)
        },
        updateSubmitExperience () {
            this.workInfo.submitExperience = !this.workInfo.submitExperience
        },
        delSchedule () {
            let work = this.curWork
            this.$set(work, 'remove', true)
            const pro = Operate.delWork(work)
            pro.then(resp => {
                const list = this.$store.getters.planList
                this.delWorkData(list, work, 300)
                this.$tip.show({
                    message: '删除成功',
                    duration: 1.5
                }).then(() => {
                    this.$router.push({name: 'Index'})
                })
            })
        },

        // 切换下一个引导提示
        nextGuidance () {
            if (this.remindGuidanceVisible) {
                this.remindGuidanceAppearedCache = true
                window.localStorage.setItem('mywork_guidance_appeared_editor_remind', true)
            } else if (this.coworkerGuidanceVisible) {
                this.coworkerGuidanceAppearedCache = true
                window.localStorage.setItem('mywork_guidance_appeared_editor_coworker', true)
            } else {
                this.remindGuidanceAppearedCache = true
                window.localStorage.setItem('mywork_guidance_appeared_editor_remind', true)
                this.coworkerGuidanceAppearedCache = true
                window.localStorage.setItem('mywork_guidance_appeared_editor_coworker', true)
            }
        }
    },
    components: {
        DateSet,
        Popup,
        msgInfo,
        remind,
        ContentEditor,
        Coworkers,
        FileField,
        guidance,
        TimeConflict
    }
}
</script>

<style lang="less" scoped rel="stylesheet/less">
@import '../css/Editor';

.noScroll {
    overflow: hidden;
}

.remind-wrapper {
    position: relative;
}

.coworkers-wrapper {
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
