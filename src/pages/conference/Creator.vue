<template lang="pug">
    .wrap-detail
        .work-detail(:class="{noScroll: showConflict}")
            // 工作编辑
            ContentEditor(
                :work-text="workInfo.textContent"
                @textchange="onTextChange"
                :placeholder="placeholder")
            .conf-location
                input(placeholder="请填写会议地址" v-model="workInfo.location")
            // 工作时间范围
            date-set

            .remind-wrapper
                remind(:gap-min="gapMin"
                    @recoverMenu="recoverMenu"
                    :type="type"
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

            .cell-wrap(v-if="isExpand")
                .set-top
                    span.set-top-title 收集与会人意见
                    .set-top-icon(@click="updateSubmitExperience"
                        :class="{active: workInfo.submitExperience}")
                .line
                .set-top
                    span.set-top-title 重要
                    //- .set-top-icon(@click="setTop" class="iconfont"
                        :class="{'icon-biaojizhaongyao': !workInfo.topState, 'icon-star': workInfo.topState}")
                    .set-important(@click="setTop"
                        :class="{'icon-important': !workInfo.topState, 'icon-stars': workInfo.topState}")

                FileField(v-if="$proms.isMobile" v-model="files")

            .coworkers-wrapper
                coworkers(:coworkers="curWork.actorPersons"
                    @staffchange="onStaffChange"
                    @oldidschange="onOldIdsChange"
                    @showconflict="toggleConflictList"
                    type="meeting"
                    source="editor"
                    ref="coworkers"
                    :conflictCoworkers="workInfo.conflictCoworkers")
                guidance(
                    v-if="coworkerGuidanceVisible"
                    :text="coworkerGuidance.text"
                    :direction="coworkerGuidance.direction"
                    :top="coworkerGuidance.top"
                    :left="coworkerGuidance.left"
                )
            .detail-bottom

        .del-btn(v-if="!$proms.isMobile && this.curWork.isOld"
            @click="cancelConf") 取消会议
        madel-honor(v-if="showMadel" :award="award" :awardUrl="awardUrl" @close-madel-honor="closeHonor")
        TimeConflict(
            v-if="showConflict"
            :crtConflictPerson="contactedConflictPerson"
            :taskDate="taskDate"
            :meetingId="this.curWork.id"
            :maskStyle="true"
            :close="toggleConflictList")
        .guidance-mask(v-if="guidanceMaskVisible" @click="nextGuidance")
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import { meetingMap } from '@/common/remindList'
import * as Requests from '@/api/sendRequest'
import * as WorkOdds from '@/utils/work-odds'
import {getdiff} from '@/utils/detail-odds'
import Popup from '@/components/common/Popup'
import Coworkers from '@/components/Coworkers'
import DateSet from '@/components/common/DateSet'
import ContentEditor from '@/components/common/ContentEditor'
import remind from '@/components/common/remind'
import FileField from '@/components/fileField/FileField'
import guidance from '@/components/common/guidance'
import guidanceData from '@/pages/data/guidanceData.js'
import TimeConflict from '../conflict/TimeConflict'

export default {
    name: 'Editor',
    computed: {
        ...mapGetters({
            curWork: 'curWork',
            taskDate: 'taskDate',
            coWorkers: 'coWorkers'
        }),
        gapMin () {
            return Math.abs(this.$moment().diff(this.taskDate.startDate, 'seconds') / 60)
        },
        placeholder () {
            return this.$proms.isMobile ? '请输入或语音录入会议的内容' : '请输入会议的内容'
        },
        showMadel () {
            return this.showHonor && this.$proms.isMobile
        },

        // currentGuidance () {
        //     return this.guidanceTips[0]
        // }
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
            type: 2,
            workInfo: {
                textContent: '',
                oldIds: [],
                staffList: [],
                // 是否置顶[0: 不置顶， 1：置顶]
                topState: 0,
                // 是否是消息转过来的
                isFromMsg: true,
                location: '',
                submitExperience: false,
                conflictCoworkers: []
            },

            // 记录是否选过提醒时间，便于后面再次修改开始时间时是否要重置
            isChooseRemind: false,

            // 开始时间距离当前时间的分钟间隔
            // gapMin: 0,
            remindObj: {
                // 日程提醒的默认时间是日程开始时
                remindMin: 15,
                remindValue: '提前15分钟'
            },
            mapValue: meetingMap,

            // 防止重复保存的
            isSaving: false,
            files: [],
            isExpand: false,

            // 用户是否弹出过创建日程时的[提醒]新手指引
            remindGuidance: guidanceData.creator.remind,
            remindGuidanceAppearedCache: false,

            // 用户是否弹出过创建日程时的[协作人]新手指引
            coworkerGuidance: guidanceData.creator.coworker,
            coworkerGuidanceAppearedCache: false,

            // 引导弹窗数组
            // guidanceTips: guidanceData.creator,

            showConflict: false,
            contactedConflictPerson: {}
        }
    },
    watch: {
        'taskDate.startDate' () {
            if (this.isChooseRemind === true && this.gapMin < 15) {
                this.remindObj = {
                    remindMin: 0,
                    remindValue: '会议开始时'
                }
            } else if (this.isChooseRemind === true) {
                this.remindObj = {
                    remindMin: 15,
                    remindValue: '提前15分钟'
                }
            }
            this.isChooseRemind = true
        },
        'taskDate': 'queryConflictCoworkers',
        'workInfo.staffList': 'queryConflictCoworkers',
        'showMadel': function (newVal) {
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
        this.remindGuidanceAppearedCache = window.localStorage.getItem('mywork_guidance_appeared_creator_remind')
        this.coworkerGuidanceAppearedCache = window.localStorage.getItem('mywork_guidance_appeared_creator_coworker')

        this.setWorkDate({
            startDate: undefined,
            endDate: undefined
        })
        this.getReady()
        // 编辑已经创建的会议
        if (this.curWork.isOld) {
            this.isExpand = true
            this.recoverWork()
        }
        this.files = this.curWork.files && [...this.curWork.files] || []
    },
    methods: {
        ...mapActions(['setCurrentWork', 'getPlanList', 'setWorkDate']),
        delWorkData: WorkOdds.delWorkData,
        closeHonor () {
            this.showHonor = false
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    // this.curWork.fromCard ? XuntongJSBridge.call('closeWebView') : this.$router.go(-1)
                    this.$router.go(-1)
                },
                webCb: () => {
                    this.$router.go(-1)
                }
            })
        },
        collapseEnter (el, done) {
            let oh = el.offsetHeight
            el.style.height = 0
            requestAnimationFrame(() => {
                el.style.height = oh + 'px'
                setTimeout(() => {
                    done()
                }, 200)
            })
        },
        collapseLeave (el, done) {
            let oh = el.offsetHeight
            el.style.height = oh
            requestAnimationFrame(() => {
                el.style.height = 0
                setTimeout(() => {
                    el.style.height = oh + 'px'
                    done()
                }, 200)
            })
        },
        recoverMenu () {
            this.getReady()
            // 编辑已经创建的工作
            if (this.curWork.isOld) {
                this.$proms.compEnd.call(this, {
                    mobileCb: () => {
                        XuntongJSBridge.call('setWebViewTitle', {'title': '编辑会议'})
                    },
                    webCb: lappmask => {
                        lappmask.resetTitle('编辑会议')
                    }
                })
                this.handleOldWork()
            }
        },
        onStaffChange (newval) {
            this.workInfo.staffList = newval
        },
        // 共用创建方法
        getReady () {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {
                        title: '新建会议'
                    })
                    XuntongJSBridge.call('createPop', {
                        popTitle: '提交',
                        popTitleCallBackId: 'addWork'
                    }, resp => {
                        this.curWork.isOld ? this.update() : this.createWork()
                    })
                },
                webCb: lappmask => {
                    lappmask.resetTitle('新建会议')
                    lappmask.removeCreatePop()
                    const obj = {
                        needBack: true
                    }
                    window.parent.postMessage(JSON.stringify(obj), '*')
                    lappmask.createPop([{
                        text: '提交',
                        callBack: (evt) => {
                            this.curWork.isOld ? this.update() : this.createWork()
                        }
                    }])
                }
            })
        },

        // 把工作的数据恢复到对应的数据区域
        recoverWork () {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {'title': '编辑会议'})
                },
                webCb: lappmask => {
                    lappmask.resetTitle('编辑会议')
                }
            })
            let curWork = this.curWork
            this.workInfo.textContent = curWork.content
            this.setWorkDate({
                startDate: this.$moment(curWork.startDate).format('YYYY-MM-DD HH:mm:ss'),
                endDate: this.$moment(curWork.endDate).format('YYYY-MM-DD HH:mm:ss')
            })
            this.workInfo.submitExperience = curWork.submitExperience
            this.workInfo.topState = curWork.topState
            this.workInfo.location = curWork.meetingPlace
            this.recoverRemind()
            setTimeout(() => {
                this.isChooseRemind = true
            }, 0)
        },
        onOldIdsChange (newval) {
            this.workInfo.oldIds = newval
        },

        updateSubmitExperience () {
            this.workInfo.submitExperience = !this.workInfo.submitExperience
        },
        /**
         * 创建工作
         * @method createWork
         * @return {undefined} undefined
        */
        createWork () {
            this.$common.datalyEvent({ event: '点击会议新建保存按钮' })
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
            this.$common.datalyEvent({
                event: '新建会议保存'
            })
            let diff = getdiff(this.workInfo.staffList, this.workInfo.oldIds)
            let data = {
                content: this.workInfo.textContent,
                oid: this.$userInfo.openid,
                personName: this.$userInfo.username,
                // 当前所有与会人员openid
                participantOids: diff.pids.toString(),
                meetingEnd: new Date(this.taskDate.endDate.replace(/-/g, '/')).getTime(),
                meetingStart: new Date(this.taskDate.startDate.replace(/-/g, '/')).getTime(),
                meetingPlace: this.workInfo.location,
                // 是否设置了置顶
                topState: this.workInfo.topState,
                submitExperience: this.workInfo.submitExperience,
                noticeTime: this.remindObj.remindMin,
                files: this.files
            }
            let result = Requests.createConference2(data)
            result.then(resp => {
                const {data: {award, awardUrl} = {}} = resp
                this.award = award
                this.awardUrl = awardUrl
                this.$tip.show({
                    message: '会议添加成功',
                    duration: 1.5
                }).then(val => {
                    this.showHonor = !!(award && awardUrl)
                    if (!this.showMadel) {
                        this.$proms.compEnd.call(this, {
                            mobileCb: () => {
                                this.$common.urlParams = {}
                                this.$router.go(-1)
                            },
                            webCb: () => {
                                this.$router.push({ name: 'Index' })
                            }
                        })
                    }
                })
                this.isSaving = false
            })
        },

        /**
         * 更新会议
         * @method update
         * @return {undefined} undefined
        */
        update () {
            if (!this.workInfo.textContent.trim()) {
                this.$tip.show({
                    message: '会议内容不能为空'
                })
                return
            }
            this.$common.datalyEvent({
                event: '编辑会议保存'
            })
            let diff = getdiff(this.workInfo.staffList, this.workInfo.oldIds)
            const pro = Requests.updateConference({
                meetingId: this.curWork.id,
                meetingEnd: new Date(this.taskDate.endDate.replace(/-/g, '/')).getTime(),
                meetingStart: new Date(this.taskDate.startDate.replace(/-/g, '/')).getTime(),
                content: this.workInfo.textContent,
                meetParticipantsId: this.workInfo.oldIds.toString(),
                // 增加的协作人
                addOpenIds: diff.addIds.toString(),
                meetingPlace: this.workInfo.location,
                // 被删除的协作人
                delOpenIds: diff.delIds.toString(),
                topState: this.workInfo.topState,
                submitExperience: this.workInfo.submitExperience,
                noticeTime: this.remindObj.remindMin,
                files: this.files
            })

            pro.then(resp => {
                this.$tip.show({
                    message: '会议修改成功',
                    duration: 1.5
                }).then(val => {
                    this.$proms.compEnd.call(this, {
                        mobileCb: () => {
                            this.$router.go(-1)
                        },
                        webCb: () => {
                            // this.$router.go(-1)
                            this.$router.push({ name: 'Index' })
                        }
                    })
                })
            })
        },
        onTextChange (newText) {
            this.workInfo.textContent = newText
        },
        setTop () {
            if (this.curWork.isOld) {
                this.$common.datalyEvent({ event: '新建会议时点击重要' })
            }
            this.workInfo.topState === 0
            ? (this.workInfo.topState = 1) : (this.workInfo.topState = 0)
        },
        recoverRemind () {
            this.mapValue.filter((item) => {
                if (this.curWork.currentWorkUser.noticeTime === item.minute) {
                    this.remindObj = {
                        remindMin: item.minute,
                        remindValue: item.value
                    }
                }
            })
        },
        cancelConf () {
            let work = this.curWork
            const pro = Requests.cancelConference(work)
            pro.then(resp => {
                const list = this.$store.getters.planList
                this.delWorkData(list, work, 300)
                this.$tip.show({
                    message: '会议已取消',
                    duration: 1.5
                }).then(() => {
                    this.$router.push({name: 'Index'})
                })
            })
        },

        /**
         * 会议时间变化和与会人增加时查询会议冲突人
         * @method queryConflictCoworkers
         */
        queryConflictCoworkers () {
            const oids = this.workInfo.staffList.map(staff => staff.id)

            if (!oids.length) return

            Requests.queryConflictCoworker({
                meetingId: this.curWork.id,
                oids: oids.join(','),
                startDate: new Date(this.taskDate.startDate.replace(/-/g, '/')).getTime(),
                endDate: new Date(this.taskDate.endDate.replace(/-/g, '/')).getTime()
            }).then((reps) => {
                this.workInfo.conflictCoworkers = reps.data
            })
        },

        // 切换下一个引导提示
        nextGuidance () {
            if (this.remindGuidanceVisible) {
                this.remindGuidanceAppearedCache = true
                window.localStorage.setItem('mywork_guidance_appeared_creator_remind', true)
            } else if (this.coworkerGuidanceVisible) {
                this.coworkerGuidanceAppearedCache = true
                window.localStorage.setItem('mywork_guidance_appeared_creator_coworker', true)
            } else {
                this.remindGuidanceAppearedCache = true
                window.localStorage.setItem('mywork_guidance_appeared_creator_remind', true)
                this.coworkerGuidanceAppearedCache = true
                window.localStorage.setItem('mywork_guidance_appeared_creator_coworker', true)
            }
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
        Popup,
        Coworkers,
        DateSet,
        ContentEditor,
        remind,
        FileField,
        guidance,
        TimeConflict
    }
}
</script>

<style lang="less" scoped rel="stylesheet/less">
@import '../../css/Editor';

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
