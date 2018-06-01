<template lang="pug">
    .coworkes
        // 协作人
        .work-staff
            h4(@click="editorCoWorkers")
                span.work-staff-title {{ type === 'meeting' ?  '与会人' : '协作人'}}
                span.work-staff-num(v-if="source === 'detail'") {{acceptThis}}
            .work-staff-wrap(:class="{'detail-co': source === 'detail'}" @click="editorCoWorkers")
                ul(:class="{'staff-item-more' : staffList.length > 5}")
                    //- 屏蔽详情页对与会人操作 2018-5-3
                    //- li.staff-item.add-item(v-if="source === 'detail' && isCreator && !isFinished" @click="addCoForDetail()")
                    //-     span.staff-avatar
                    //-         i.iconfont.icon-xinzeng
                    li.staff-item(v-for="staff of showStaffList" @click="e => checkConflictList(staff, e)"
                        :class="conflictClassObject(staff.id)")
                        span.staff-avatar
                            img(:src="staff.img")
                            i.staff_del(v-if="!$proms.isMobile && source!== 'detail'" @click.stop="removeStaff(staff)")
                            <!--span.stat-readed(v-if="staff.readStatus && !staff.workStatus") 已读-->
                            <!--span.stat-finished(v-if="staff.workStatus") 已完成-->
                        span.staff-conflict(v-if="showConflictTag(staff.id)") 时间冲突
                        span.staff-name(v-if="source!== 'detail'") {{staff.name}}

                    li.staff-item.add-item(v-if="showAdd" @click="selectStaff('work')")
                        span.staff-avatar
                            i.iconfont.icon-xinzeng
                    li.staff-item.del-item(v-if="showDel"
                        @click="delStaff")
                        span.staff-avatar
                            i.iconfont.icon-shanchu
                .staff-font(v-if="source === 'detail'" )
                          span.staff-avatar(v-if="staffList.length > 5") 等{{staffList.length}}人
                          i.iconfont &#xead8;

        popup(:show="notifyPop.show"
            :title="notifyPop.title"
            className="check-notify-popup")
            .notify-wrap(slot="content")
                .notify-content 确定以短信提醒所有未完成的成员?
                .notify-check-btns
                    span(@click="notifyPop.show = false") 取消
                    span(@click="confirmNotify") 确定
</template>
<script>
import * as Odds from '@/utils/detail-odds'
import Popup from '@/components/common/Popup'
import {mapGetters, mapActions} from 'vuex'
import * as Requests from '@/api/sendRequest'

export default {
    data () {
        return {
            notifyPop: {
                show: false,
                title: {
                    show: true,
                    content: '一键提醒'
                }
            },
            staffList: [],
            oldIds: [],
            beforeOldIds: [],  // 上次添加后的协作人（未提交时）
            isNotified: false,
            isStart: true   // 判断staffList第一次初始化，false为后续赋值
        }
    },
    props: {
        coworkers: {
            type: Array,
            default: () => {
                return []
            }
        },
        // 父组件类型, 详情：detail， 创建：editor
        source: {
            type: String
        },
        // 类型, 日程：schedule, 会议：meeting
        type: {
            type: String
        },
        conflictCoworkers: {
            type: Array,
            default () {
                return []
            }
        }
    },
    computed: {
        ...mapGetters({
            coWorkers: 'coWorkers',
            curWork: 'curWork',
            taskDate: 'taskDate'
        }),
        isSchedule () {
            // 判断该详情是会议(false)还是日程(true)
            return this.curWork.type === 'schedule' || this.type === 'schedule'
        },
        isCreator () {
            // 是否是创建者，workSource则1为创建者，2为协作者
            if (this.isSchedule) {
                return this.curWork.workSource === '1'
            } else {
                return this.curWork.currentWorkUser && this.curWork.currentWorkUser.workSource === '1'
            }
        },
        isFinished () {
            // 默认认为完成了
            const {workStatus = 1} = this.curWork
            // 0 未完成 1 完成了
            return +workStatus === 1
        },
        showAdd () {
            return this.curWork.workSource !== '2' && this.source !== 'detail'
        },
        showDel () {
            return this.staffList.length && this.$proms.isMobile &&
                  this.curWork.workSource !== '2' && this.source !== 'detail' && !this.curWork.id
        },
        // 没有完成工作的人数组
        unfinishStaff () {
            return (this.staffList.filter(item => item.workStatus === 0) || [])
        },
        showNotify () {
            // 是否显示 一键提醒 按钮
            return (this.staffList.length &&
            this.unfinishStaff.length &&
            this.source === 'detail' &&
            this.isCreator)
        },
        showStaffList () {
            // 显示在页面上的成员
            return this.showAdd
            ? this.staffList : this.isCreator
            ? this.staffList.slice(0, 5) : this.staffList.slice(0, 6)
        },
        acceptThis () {
            // 接受日程或参与会议人数
            const isMeeting = this.curWork.type === 'meeting'
            let txt
            isMeeting && (txt = this.curWork.count ? `${this.curWork.joinCount}/${this.curWork.count} 参加` : '')
            if (!isMeeting) {
                let arr = this.staffList.filter((item) => item.acceptStatus === 2)
                txt = `${arr.length}/${this.staffList.length} 接受`
            }
            return txt
        }
    },
    created () {
        // 判断页面是编辑还是详情
        !this.source && (this.source = this.coWorkers.source)

        // 语音助手转日程
        if (this.source === 'editor' && this.$mywork.voiceContent) {
            this.sophieToSch()
            return
        }
        // 获取coworkersList
        if (this.coworkers && this.coworkers.length) {
            let list = []
            this.coworkers.forEach(staff => {
                list.push({
                    id: staff.oid,
                    img: staff.photoUrl,
                    name: staff.name,
                    readStatus: staff.readStatus,
                    workStatus: staff.workStatus,
                    // 日程特有
                    acceptStatus: staff.acceptStatus,
                    // 会议特有
                    joinStatus: staff.joinStatus,
                    doneTime: staff.doneTime
                })
                this.staffList = list
                this.oldIds.push(staff.oid)
                this.beforeOldIds.push(staff.oid)
            })

            this.setCoWorkers(Object.assign(this.coWorkers, {
                source: this.coWorkers.source,
                type: this.coWorkers.type || this.curWork.type,
                oldIds: this.oldIds
            }))

            this.$emit('oldidschange', this.oldIds)
        }
        // 点接受或者参与时实时更改与会人数字
        this.$bus.$on('changeJoinStatus', this.changeJoinStatus)
    },
    methods: {
        ...mapActions(['setCoWorkers', 'setCurWorkStatus']),
        getStaffArr: Odds.getStaffArr,
        selectStaff: Odds.selectStaff,
        confirmNotify: Odds.confirmNotify,
        changeJoinStatus () {
            if (this.coWorkers.type === 'meeting') {
                let count = this.curWork.joinCount
                this.setCurWorkStatus({'joinCount': count + 1})
            } else {
                this.coWorkers.staffList.filter(item => {
                    console.log(item.id, '....', this.$userInfo.openid)
                    item.id === this.$userInfo.openid ? item.acceptStatus = 2 : ''
                })
            }
        },
        showCheckNotify () {
            if (this.isNotified || this.curWork.unFinishNotice || !this.unfinishStaff.length) return
            this.notifyPop.show = true
        },
        delStaff () {
            let staffIds = this.getStaffArr(this.staffList).staffIds
            console.log(staffIds)
            XuntongJSBridge.call('selectPersons',
                {
                    isMulti: true,
                    selected: [],
                    range: staffIds
                }, result => {
                    const persons = result.data.persons
                    persons.forEach(item => {
                        let isIn = this.staffList.find(staff => item.openId === staff.id)
                        if (isIn) {
                            let index = this.staffList.indexOf(isIn)
                            this.staffList.splice(index, 1)
                        }
                    })
                })
        },

        // showConflictPopUp (staff) {
        //     if (this.$proms.isMobile) {
        //         this.checkConflictList(staff)
        //     }
        // },

        removeStaff (staff) {
            // if (this.$proms.isMobile || this.type === 'meeting') {
            //     if (this.type === 'meeting' || this.type === 'schedule') {
            //         this.checkConflictList(staff)
            //     }
            //     return
            // }
            this.staffList.forEach(item => {
                if (item.id === staff.id) {
                    if (this.staffList.length === 1) {
                        this.$tip.show({
                            message: '协作日程，需至少保留一个协作人'
                        })
                        return
                    }
                    this.staffList.splice(this.staffList.indexOf(item), 1)
                }
            })
        },
        editorCoWorkers (e) {
            // 查看协作人列表页
            e.preventDefault()
            if (!this.staffList.length || this.showAdd) return

            this.setCoWorkers({
                type: this.coWorkers.type || this.curWork.type,
                source: this.coWorkers.source,
                staffList: this.staffList
            })

            if (this.isSchedule) {
                this.$router.push({ name: 'CoworkersList' })
            } else {
                this.$router.push({ name: 'CoForMeeting' })
            }
        },
        // 详情页面添加协作人
        addCoForDetail () {
            // 详情里面添加协作人
            event.stopPropagation()
            this.isStart = false
            this.selectStaff('work')
        },
        addCoWorkers () {
            // 保存协作人
            let diff = Odds.getdiff(this.staffList, this.oldIds)
            let pro
            if (this.isSchedule) {
                // 日程
                pro = Requests.updateActorsForS({
                    workId: this.curWork.id,
                    // 当前所有协作人openid
                    actorOids: diff.pids.toString(),
                    // 增加的协作人
                    addOids: diff.addIds.toString(),
                    // 被删除的协作人
                    delOids: diff.delIds.toString()
                })
            } else {
                // 会议
                pro = Requests.updateActorsForM({
                    meetingId: this.curWork.id,
                    // 增加的协作人
                    addOids: diff.addIds.toString(),
                    // 被删除的协作人
                    delOids: diff.delIds.toString()
                })
            }

            pro.then(resp => {
                this.$tip.show({
                    message: `${this.isSchedule
                        ? `日程修改${resp.success ? '成功' : '失败'}`
                        : `会议修改${resp.success ? '成功' : '失败'}`}`,
                    duration: 1.5
                }).then(val => {})
            })
        },
        showConflictTag (staffId) {
            // return this.source !== 'detail' && this.conflictCoworkers.includes(staffId)
            return this.conflictCoworkers.includes(staffId)
        },
        checkConflictList (staff, e) {
            if (!this.showConflictTag(staff.id)) return
            e.stopPropagation()
            this.$emit('showconflict', staff)
        },

        // 语音助手协作人列表
        coopsToList (coops = []) {
            let list = []
            coops.forEach(item => {
                let oid = item.oid || item.openid
                if (!(oid === this.$userInfo.openid)) {
                    list.push({
                        id: oid,
                        name: item.name,
                        img: item.photoUrl,
                        readStatus: 0,
                        workStatus: 0
                    })
                    this.oldIds.push(oid)
                }
            })
            this.staffList = list
            this.setCoWorkers(Object.assign(this.coWorkers, {
                source: this.source,
                type: this.type,
                oldIds: this.oldIds
            }))
            return list
        },

        // 提取语音助手转过来的协作人
        sophieToSch () {
            if (Array.isArray(this.$mywork.coops) && this.$mywork.coops.length) {
                let timer = setTimeout(() => {
                    this.coopsToList(this.$mywork.coops)
                    clearTimeout(timer)
                }, 10)
            } else if (this.$mywork.groupId) {
                // 如果有groupId
                this.$http.post('/xuntong/groupUserOidInfo.action', {
                    groupId: this.$mywork.groupId
                }).then(resp => {
                    let coops = resp.data
                    if (Array.isArray(coops) && coops.length) {
                        if (coops.length >= 100) {
                            this.$tip.show({
                                message: '群组人数过多，请指定相关协作人'
                            })
                            return
                        }
                        this.coopsToList(coops)
                    }
                })
            }
        },
        conflictClassObject (staffId) {
            const {showConflictTag, source, $proms} = this
            return {
                point: showConflictTag(staffId),
                detailStyle: showConflictTag(staffId) && source === 'detail',
                webStyle: showConflictTag(staffId) && !$proms.isMobile
            }
        }
    },
    watch: {
        staffList (newval, oldval) {
            if (this.source === 'detail' && !this.isStart) {
                this.addCoWorkers()
            } else {
                this.setCoWorkers({
                    type: this.coWorkers.type || this.curWork.type,
                    source: this.coWorkers.source,
                    staffList: this.staffList
                })

                let diff = Odds.getdiff(this.staffList, this.beforeOldIds)
                this.beforeOldIds = diff.pids || []
//                console.log('oldval::::', this.beforeOldIds)
//                console.log('diff::::', diff)
                if (this.curWork.isOld && diff.addIds.length) {
                    this.$tip.show({
                        message: `${this.isSchedule ? '协作人添加成功' : '与会人添加成功'}`,
                        duration: 1.5
                    }).then(val => {
                    })
                }
                this.$emit('staffchange', newval)
            }
        },
        coworkers (newval, oldval) {
            if (newval && newval.length) {
                let list = []
                newval.forEach(staff => {
                    list.push({
                        id: staff.oid,
                        img: staff.photoUrl,
                        name: staff.name,
                        readStatus: staff.readStatus,
                        workStatus: staff.workStatus,
                        acceptStatus: staff.acceptStatus,  // 日程特有
                        joinStatus: staff.joinStatus,    // 会议特有
                        doneTime: staff.doneTime || 0
                    })
                    this.staffList = list
                    this.oldIds.push(staff.oid)
                })
                this.setCoWorkers(Object.assign(this.coWorkers, {oldIds: this.oldIds}))
                this.$emit('oldidschange', this.oldIds)
            }
        }
    },
    components: {
        Popup
    }
}
</script>
<style lang="less">
@import '../css/CoworkersList.less';
.work-staff{
    background: #fff;
    padding:.13rem .16rem .12rem .16rem;
    .work-staff-title{
      font-weight: bold;
      float: inherit;
      color:#1d1d1d;
      font-size:.16rem;
    }
    .work-staff-num{
      font-size: .14rem;
    }
    h4{
        font-size: .14rem;
        color: #1d1d1d;
        font-weight: normal;
        overflow: hidden;
        span{
            float: right;
            color:#889AA4;
            font-size:.16rem;
        }
    }

    ul{
        display: flex;
        flex-wrap: wrap;
        padding-bottom: .1rem;
    }
    .staff-item{
        width:20%;
        flex-basis: 20%;
        flex-grow: 0;
        flex-shrink: 0;
        box-sizing: border-box;
        text-align: center;
        padding-top: .2rem;
        position: relative;
        &.add-item, &.del-item{
            .iconfont{
                font-size: .4rem;
                color:#989A9C;
                &:active{opacity: .5;}
            }
        }

        &:active {
            opacity: 0.5;
        }

        &.point {
            cursor: pointer;
        }

        &.detailStyle {
            .staff-conflict {
                bottom: .02rem;
            }

            &.webStyle {
                flex-basis: 60px;
            }
        }

        &.webStyle {
            .staff-conflict {
                min-width: 60px;
                min-height: 16px;
                line-height: 16px;
            }
        }
    }
    .staff-avatar{
        display: block;
        width:.42rem;
        height: .42rem;
        position: relative;
        margin:0 auto;
        border-radius: 50%;
        display: inline-block;
        .staff_del{
            position: absolute;
            top: 0;
            right: 0;
            width: .14rem;
            height: .14rem;
            border-radius:50%;
            border:.005rem solid #B9C7D2;
            background:#fff;
            transform: rotate(45deg);
            &:before, &:after{
                position: absolute;
                content:' ';
            }
            &:after{
                height: .08rem;
                border-left:.005rem solid #B9C7D2;
                top:50%;
                left:50%;
                transform: translate(-50%, -50%);
            }
            &:before{
                width:.08rem;
                border-bottom:.005rem solid #B9C7D2;
                top: 50%;
                left: 50%;
                transform:translate(-50%, -50%);
            }
        }

        .stat-readed, .stat-finished{
            display: table-cell;
            vertical-align: middle;
            position: absolute;
            bottom: -10%;
            line-height:.17rem;
            height: .17rem;
            border-radius: .17rem;
            width:120%;
            left: 50%;
            font-size: .12rem;
            transform:translateX(-50%) scale(.8);
        }

        .stat-finished {
            background:#3BBAFF;
            color:#fff;
        }

        .stat-readed{
            background: #E6E8EE;
        }
        img{
            border-radius: 50%;
            height: 100%;
            max-height: 100%;
            width: 100%;
        }
    }
    .staff-name{
        display: block;
        text-align: center;
        font-size: .14rem;
        padding: .04rem .08rem 0;
        width: .7rem;
        margin:0 auto;;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #1D1D1D;
    }

    .staff-font{
      display: none;
    }

    .staff-conflict{
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: .21rem;
        width: .46rem;
        height: .14rem;
        background: #FFF;
        border-radius: .11rem;
        border: 1px solid #E26735;
        font-size: .09rem;
        color: #E26735;
        line-height: .14rem;
    }

    /*详情里的协作人样式*/
    .detail-co {
      display: flex;
        ul{
          height: .74rem;
          overflow: hidden;
          flex: 1;
        }

        li.staff-item {
          margin: auto .045rem;
          width: initial;
          flex-basis: auto;
          position: relative;
        }
        .staff-item-more{
          li.staff-item{
            margin: auto .02rem;
          }
        }

        .staff-font {
          color: #889AA4;
          font-size: .16rem;
          padding-top: .1rem;
          margin: auto;
          display:flex;
          line-height: .42rem;

        span {
          display: inline-block;
          line-height: .42rem;
          overflow: hidden;
          flex: 1;
          font-size: .14rem;
          width: .56rem;
          padding-right:.04rem;
          text-align: right;
        }

        i {
          font-size: .12rem;
          font-weight: bold;
        }

        }
    }

}
</style>
