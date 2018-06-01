
<template lang="pug">
    .time-line-item(:class=`[{isComplete: isComplete},
        {slideAnima: item.isAnima},
        {fadeout: item.remove}]`
        @click="goDeatil()")
        .item-content
            .item-field
                .task-time
                    .start-time(:class="{overdue: isShowOverdue}") {{startTxt}}
                    .end-time(v-if="isTask" :class=`!$proms.isMobile && isShowResponse ? 'web-response' : ''`)
                        span(:class=`[{deadline: isShowDeadline},
                            {isNew: isNew},
                            {notResponse: isShowResponse}]`) {{endTxt}}
                .task-icon
                    img(:src="iconUrl[item.channel] || iconUrl['work']")
                    i.important-icon(v-if="item.topState === 1")
                .task-content
                    .task-value(:class="{isNew: isNew}") {{item.content}}
                    .task-creator(v-if="isCooperate")
                        .creator-name 来自：{{item.personName}}
        .cancel-btn(@click.stop="delTask") {{item.channel === 'meeting' ? '取消' : '删除'}}
            //- .task-creator(v-if="isCooperate")
            //-     .creator-name 来自：{{item.personName}}
</template>
<script>
import { delWork, cancelConference } from '@/api/sendRequest'
import { mapActions } from 'vuex'
export default {
    data () {
        const iconUrl = {
            meeting: require('@/assets/type_icon/meeting-icon.svg'),
            recordWork: require('@/assets/type_icon/task-icon.svg'),
            work: require('@/assets/type_icon/schedule-icon.svg'),
            birthday: require('@/assets/type_icon/birthday-icon.svg'),
            boss: require('@/assets/type_icon/boss-icon.svg'),
            award: require('@/assets/type_icon/award-icon.svg'),
            bigData: require('@/assets/type_icon/bigdata-icon.svg')
        }
        return {
            iconUrl
        }
    },
    computed: {
        isTask () {
            return this.item.channel === 'meeting' || this.item.channel === 'work' || this.item.channel === 'recordWork' || this.item.channel === 'birthday'
        },
        isComplete () {
            return this.item.workStatus === 1
        },
        isCooperate () {
            return (this.item.type === 'cooperationWork' && this.item.channel === 'work') || this.item.channel === 'meeting'
        },
        startTxt () {
            if (this.item.channel === 'birthday') {
                if (new Date(this.item.startDate).getDate() === new Date().getDate()) {
                    return '今天'
                } else {
                    return this.$moment(this.item.endDate).format('MM-DD')
                }
            } else if (this.item.channel === 'boss' || this.item.channel === 'award') {
                return this.$moment(this.item.createDate).format('HH:mm')
            } else if (this.item.overdue && this.item.workStatus !== 1) {
                return '已逾期'
            } else if (this.item.acrossDay) {
                return this.$moment(this.item.endDate).format('MM-DD')
            } else {
                return this.$moment(this.item.startDate).format('HH:mm')
            }
        },
        isShowDeadline () {
            return this.item.acrossDay && (!this.item.overdue || this.item.channel === 'meeting')
        },
        endTxt () {
            if (this.isNew) {
                return 'New'
            } else if (this.isResponse) {
                return '未响应'
            } else if (this.isShowDeadline) {
                return '截止'
            } else if (this.item.endDate === this.item.startDate || this.item.channel === 'boss' || this.item.channel === 'award') {
                return ''
            } else {
                return this.$moment(this.item.endDate).format('HH:mm')
            }
        },
        isShowOverdue () {
            return this.item.overdue && this.item.channel !== 'boss'
        },
        isNew () {
            return this.item.readStatus === 0 && (this.item.channel === 'meeting' || this.item.channel === 'work')
        },
        isResponse () {
            return this.item.acceptStatus === 0 && this.item.workStatus !== 1 &&
            this.item.endDate >= +new Date() &&
            (this.item.channel === 'meeting' || this.item.channel === 'work')
        },
        isShowResponse () {
            return this.isResponse && !this.isNew
        }
    },
    props: {
        item: {
            type: Object,
            default: {}
        }
    },
    mounted () {
        this.swipeOperate()
    },
    methods: {
        ...mapActions([ 'setCurrentWork',
            'setCoWorkers' ]),
        delTask () {
            if (this.item.channel === 'meeting') {
                this.cancelMeeting()
            } else {
                this.delSchedule()
            }
        },
        cancelMeeting () {
            cancelConference(this.item).then(resp => {
                if (resp.success === true || resp.success === 'true') {
                    this.$set(this.item, 'workStatus', 1)
                    this.$set(this.item, 'isAnima', false)
                } else {
                    this.$tip.show({
                        message: '小云可能累了，请稍后再试'
                    })
                    return
                }
            })
        },
        delSchedule () {
            delWork(this.item).then(resp => {
                if (resp.success === true || resp.success === 'true') {
                    this.$set(this.item, 'remove', true)
                } else {
                    this.$tip.show({
                        message: '小云可能累了，请稍后再试'
                    })
                }
            })
        },
        swipeOperate () {
            let row = this.$el
            let startX, startY
            row.addEventListener('touchstart', e => {
                e.stopPropagation()
                let touch = e.changedTouches[0]
                startX = touch.pageX
                startY = touch.pageY
            }, false)

            row.addEventListener('touchmove', e => {
                e.stopPropagation()
                if (this.isComplete) return
                let touch = e.changedTouches[0]
                let [moveX, moveY] = [touch.pageX, touch.pageY]
                let [disX, disY] = [moveX - startX, moveY - startY]
                if (disX <= -1 && Math.abs(disY) <= 3) {
                    e.preventDefault()
                    this.$emit('panleft', this.item)
                    this.$set(this.item, 'isAnima', true)
                }
                if (disX >= 1 && Math.abs(disY) <= 3) {
                    e.preventDefault()
                    this.$set(this.item, 'isAnima', false)
                }
                startX = moveX
            }, false)

            this.$watch(() => {
                return this.$parent.animWork
            }, (newVal) => {
                if (newVal.id !== this.item.id) {
                    this.$set(this.item, 'isAnima', false)
                }
            })
        },
        initHandle (task) {
            let handler = {
                'meeting': function () {
                    task.isOld = true
                    task.isDone = !task.workStatus
                    this.setCurrentWork(task)
                    this.setCoWorkers({
                        source: 'detail',
                        type: 'meeting'
                    })
                    this.$router.push({name: 'ConInfo'})
                },
                'work': function () {
                    task.isOld = true
                    task.isDone = !task.workStatus
                    this.setCurrentWork(task)
                    this.setCoWorkers({
                        source: 'detail',
                        type: 'schedule'
                    })
                    this.$router.push({name: 'Detail'})
                },
                'recordWork': function () {
                    this.setCurrentWork(task)
                    this.$router.push({name: 'EventInfo'})
                },
                'bigData': function () {
                    if (task.url === 'ownKeyword') {
                        this.$router.push({name: 'keyWord', params: { time: this.item.startDate }})
                    } else {
                        this.$router.push({name: 'staffanalyze', params: {time: task.startDate}})
                    }
                },
                'award': function () {
                    if (!this.$proms.isMobile) {
                        this.$tip.show({
                            message: '请在手机上查看'
                        })
                        return
                    }
                    if (this.$proms.isMobile) {
                        XuntongJSBridge.call('closePop')
                    }
                    window.location.href = task.url
                },
                'boss': function () {
                    task.isOld = true
                    task.isDone = !task.workStatus
                    this.setCurrentWork(task)
                    this.setCoWorkers({
                        source: 'detail',
                        type: 'schedule'
                    })
                    this.$router.push({name: 'Detail'})
                },
                'birthday': function () {
                    if (!this.$proms.isMobile) {
                        this.$tip.show({
                            message: '请在手机上查看'
                        })
                        return
                    }
                    let appObj = JSON.parse(task.url)
                    XuntongJSBridge.call('gotoLightApp', {
                        appId: appObj.appid,
                        appName: '',
                        urlParam: decodeURIComponent(appObj.urlparam)
                    })
                },

                // 5 月 30 号当天, v10 发布会直播日程
                v10zhibo () {
                    if (!this.$proms.isMobile) {
                        this.$tip.show({
                            message: '请在手机上查看'
                        })
                        return
                    }
                    if (this.$proms.isMobile) {
                        XuntongJSBridge.call('closePop')
                    }
                    window.location.href = task.url
                },

                // v10 升级推送
                v10update () {
                    if (!this.$proms.isMobile) {
                        this.$tip.show({
                            message: '请在手机上查看'
                        })
                        return
                    }
                    if (this.$proms.isMobile) {
                        XuntongJSBridge.call('closePop')
                    }
                    window.location.href = task.url
                },

                // v10 活动页面
                touhaowanjia () {
                    if (!this.$proms.isMobile) {
                        this.$tip.show({
                            message: '请在手机上查看'
                        })
                        return
                    }
                    if (this.$proms.isMobile) {
                        XuntongJSBridge.call('closePop')
                    }
                    window.location.href = task.url
                },

                // 跳转到小云介绍页面
                start2 () {
                    if (!this.$proms.isMobile) {
                        this.$tip.show({
                            message: '请在手机上查看'
                        })
                        return
                    }
                    if (this.$proms.isMobile) {
                        XuntongJSBridge.call('closePop')
                    }
                    window.location.href = task.url
                },

                // 提示用户创建团队
                start3 () {
                    if (!this.$proms.isMobile) {
                        this.$tip.show({
                            message: '请在手机上查看'
                        })
                        return
                    }
                    if (this.$proms.isMobile) {
                        XuntongJSBridge.call('closePop')
                        XuntongJSBridge.call(
                            'localFunction',
                            {
                                'name': 'createTeam',
                                'param': {}
                            },
                            function (result) {
                                console.log(result)
                            }
                        )
                    }
                }
            }
            return handler[task.channel] || handler.work
        },
        goDeatil () {
            this.$el.classList.add('active')
            setTimeout(() => {
                this.$el.classList.remove('active')
                this.initHandle(this.item).call(this)
            }, 200)
        }
    }
}
</script>
<style lang="less" scoped>
.fadeout {
    padding: 0 !important;
}
.slideAnima {
    .cancel-btn, .task-value, .creator-name {
        transform: translateX(-.64rem);
    }
    .cancel-btn {
        transform: translateX(-.64rem) translateY(-50%) !important;
    }
}
.time-line-item {
    .cancel-btn {
        transition: all .2s;
        position: absolute;
        right: -.64rem;
        height: .56rem;
        margin-left: .16rem;
        line-height: .56rem;
        align-items: center;
        width: .64rem;
        top: 50%;
        text-align: center;
        background: #EA5950;
        font-size: .14rem;
        color: #fff;
        transform: translateY(-50%);
    }
    position: relative;
    // padding: .08rem 0 .08rem .18rem;
    // padding-left: .18rem;
    // height: .78rem;
    cursor: pointer;
    box-sizing: content-box;
    transition: all .2s;
    .item-content {
        // position: absolute;
        padding-left: .18rem;
        width: 100%;
        // top: 50%;
        // transform: translateY(-50%);
    }
    .item-field {
        display: flex;
        margin-bottom: .3rem;
        // align-items: center;
        .task-time {
            width: .47rem;
            text-align: right;
            color: #1D1D1D;
            .start-time {
                width: .47rem;
                font-size: .16rem;
            }
            .overdue {
                font-size: .15rem;
                color: #EA5950;
                letter-spacing: -.01rem;
            }
            .end-time {
                font-size: .14rem;
                color: #94A4AD;
            }
            .deadline {
                font-size: .13rem;
            }
            .notResponse {
                font-size: .09rem;
                background: #EA5E56;
                padding: .02rem .05rem;
                color: #fff;
                border-radius: 2px;
                text-align: center;
            }
            .isNew {
                color: #EA5E56;
                font-size: .12rem;
                font-weight: bold;
            }
            .web-response {
                transform: scale(.85);
                transform-origin: right;
            }
        }
        .task-icon {
            position: relative;
            height: .28rem;
            width: .28rem;
            text-align: center;
            border-radius: 50%;
            line-height: .28rem;
            margin: -.06rem .1rem 0;
            background: #fff;
            img {
                width: .14rem;
                height: .14rem;
                vertical-align: middle;
            }
            .important-icon {
                display: block;
                margin-left: .095rem;
                margin-top: -.05rem;
                height: .09rem;
                width: .09rem;
                background: url('../../assets/star2.svg') no-repeat;
                background-size: cover;
            }
            &:after {
                content: "";
                position: absolute;
                width: 1px;
                height: 180%;
                left: 50%;
                top: .31rem;
                margin-left: -.5px;
                background: #C2CCD0;
            }
        }
        .task-content {
            flex: 1;
            overflow: hidden;
            padding-right: .16rem;
            color: #272727;
            .task-value {
                transition: all .2s;
                font-size: .16rem;
                overflow : hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                line-height: 1.2;
            }
            .task-creator {
                // position: absolute;
                overflow: hidden;
                // margin-left: .95rem;
                margin-top: .02rem;
                font-size: .12rem;
                color: #889AA4;
                .creator-name {
                    transition: all .2s;
                }
            }
            .isNew {
                font-weight: bold;
            }
        }
        .cancel-btn {
            transition: all .2s;
            position: absolute;
            right: -.64rem;
            height: .60rem;
            margin-left: .16rem;
            line-height: .60rem;
            align-items: center;
            width: .64rem;
            top: 0;
            text-align: center;
            background: #EA5950;
            font-size: .14rem;
            color: #fff;
        }
    }
    &:last-child {
        // border-bottom: solid .3rem #fff;
        .task-icon:after {
            height: 0;
            // border-bottom: .3rem solid #fff;
            // box-sizing: content-box;
        }
    }
    &.active {
        .task-creator, .task-content {
            opacity: .5;
        }

    }
    &.isComplete {
        .item-field {
            .task-time {
                .start-time {
                    color: #B3B7B9;
                    font-size: .16rem;
                    letter-spacing: 0;
                }
                .end-time {
                    color: #B3B7B9;
                }
            }
            .task-content {
                color: #B3B7B9;
            }
        }
        .task-content {
            .task-creator {
                color: #B3B7B9;
            }
        }

    }
}
</style>

