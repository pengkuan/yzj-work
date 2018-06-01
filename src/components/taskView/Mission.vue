
// 从page复制过来的，需求赶没有时间重做，拿过来改改
<template lang="pug">
li.work-row.clear(@click="editDetail(work)")
    //- span.work-check(v-if="type === 'meeting'")
    //-     i.check-box.iconfont.icon-huiyi
            //- img(src="../../assets/conference.png")

    //- span.work-check(@click.stop="showConfirm"
    //-     v-else)
    //-     i.check-box.iconfont.icon-danxuankuang(ref="checkBox"
    //-         :class="{'icon-danxuankuangxuanzhong': !work.isPlan}")
    .work-brief
        .work-con(:class="{hasStar: work.topState === 1}")
            .work-desc
                i.iconfont.icon-star(v-if="work.topState === 1")
                b
                    //- i.work-type.work-co(v-if="work.actorOpenids && type !== 'meeting'")
                    //-     img(src="../../assets/coop.png")
                    | {{work.content}}
            p.work-info(v-if="work.endDate || work.actorOpenids")
                span.work-creater(v-if="work.actorOpenids || type === 'meeting'") {{createrTxt}}
                span.work-deadline(
                    v-if="work.endDate"
                    :class="[{outdated: isOutdated}]") {{deadlineTxt}}
                        //- |  {{ $moment(work.startDate).format('MM-DD HH:mm')}} {{isPlan ? (isOutdated(work) ? '已逾期' : '开始') : '' }}
    .work-ctrls(v-if="work.isPlan && ($userInfo.openid === work.openid && type === 'meeting' || type === 'schedule')")
        span.conf-cancel(v-if="type === 'meeting'"
            @click.stop="handleCheck(work)") 取消
        span.work-del(v-else @click.stop="_delWork(work)") 删除

    i.iconfont.icon-biaojizhongyao.icon-mark(v-if="work.workType === '1'")

    popup(v-if="isConfirm"
        :show="isConfirm"
        :title="confirmTitle"
        className="check-confirm-popup")
            .work-wrap(slot="content")
                .work-content(:class="{center: workContent.length < 30}") {{workContent}}
                .work-check-btns
                    span(@click="cancelCheck") 取消
                    span(@click="confirmCheck") 确定
</template>

<script>
import * as Requests from '@/api/sendRequest'
import * as Operate from '@/pages/works/operate'
import * as WorkOdds from '@/utils/work-odds'
import { mapActions } from 'vuex'
import Popup from '@/components/common/Popup'

const {checkWork} = Operate
export default {
    name: 'mission',
    data () {
        return {
            isConfirm: false,
            confirmTitle: {
                show: true,
                content: '完成这项日程'
            },
            startX: undefined,
            startY: undefined,
            workContent: ''
        }
    },
    props: {
        isPlan: Boolean,
        work: Object,
        type: {
            type: String,
            default: 'schedule'
        }
    },
    computed: {
        doneWorks: function () {
            return this.$store.getters.doneWorks
        },
        planList: function () {
            return this.$store.getters.planList
        },
        isAcrossDay () {
            return new Date(this.work.startDate).getDate() !== new Date(this.work.endDate).getDate()
        },
        createrTxt () {
            if (this.isOutdated) {
                return `来自: ${this.work.personName}`
            } else if (this.isAcrossDay) {
                return `来自: ${this.work.personName} ${this.$moment(this.work.createDate).format('MM-DD')} 于`
            } else {
                return `来自: ${this.work.personName} 于`
            }
        },
        isOutdated () {
            return this.$moment(this.work.endDate).isBefore(new Date())
        },
        deadlineTxt () {
            if (!this.isPlan) {
                return ` ${this.$moment(this.work.startDate).format('MM-DD HH:mm')}`
            } else if (this.isOutdated) {
                return ' 已逾期'
            } else if (this.isAcrossDay) {
                return `${this.$moment(this.work.endDate).format('MM-DD')}截止`
            } else {
                return `${this.$moment(this.work.startDate).format('HH:mm')}开始`
            }
        }
    },
    mounted () {
        if (!this.work.isPlan) return
        this.swipeOperate()
    },
    methods: {
        ...mapActions([ 'getPlanList',
            'getDoneWorks',
            'setCurrentWork',
            'setUndoWorkLen',
            'setUndoMeetingLen',
            'setCoWorkers' ]),
        delWorkData: WorkOdds.delWorkData,
        addWorkData: WorkOdds.addWorkData,
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
                if (this.$userInfo.openid !== this.work.openid) {
                    return
                }
                let touch = e.changedTouches[0]
                let [moveX, moveY] = [touch.pageX, touch.pageY]
                let [disX, disY] = [moveX - startX, moveY - startY]
                if (disX <= -1 && Math.abs(disY) <= 3) {
                    e.preventDefault()
                    this.$emit('panleft', this.work)
                    this.$set(this.work, 'anim', true)
                }
                if (disX >= 1 && Math.abs(disY) <= 3) {
                    e.preventDefault()
                    this.$set(this.work, 'anim', false)
                }
                startX = moveX
            }, false)

            this.$watch(() => {
                return this.$parent.animWork
            }, (newVal) => {
                if (newVal.id !== this.work.id) {
                    this.$set(this.work, 'anim', false)
                }
            })
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
        showConfirm () {
            this.workContent = this.limitStr(this.work.content, 130)
            this.work.isPlan ? (this.isConfirm = true) : (this.handleCheck(this.work))
        },
        confirmCheck () {
            this.isConfirm = false
            this.handleCheck(this.work)
        },
        cancelCheck () {
            this.isConfirm = false
        },
        // 改变任务状态
        handleCheck (work) {
            let pro
            if (this.type === 'meeting') {
                pro = Requests.cancelConference(work)
            } else {
                pro = checkWork(work, work.isPlan ? -1 : 1, 1)
            }

            pro.then(resp => {
                if (work.isPlan) {
                    if (resp.success === true || resp.success === 'true') {
                        if (this.type === 'meeting') {
                            this.setUndoMeetingLen(this.$store.getters.undoMeetingLen - 1)
                        } else {
                            this.setUndoWorkLen(this.$store.getters.undoWorkLen - 1)
                        }
                        this.$set(work, 'remove', true)
                        this.$emit('doneTask', work)
                    } else {
                        this.$tip.show({
                            message: '小云可能累了，请稍后再试'
                        })
                        return
                    }
                    this.$refs.checkBox.classList.add('icon-danxuankuangxuanzhong')
                }
            })
        },

        // 删除工作
        _delWork (work) {
            let pro
            pro = Requests.delWork(work)
            pro.then(resp => {
                if (resp.success === true || resp.success === 'true') {
                    this.setUndoWorkLen(this.$store.getters.undoWorkLen - 1)
                    this.$set(work, 'remove', true)
                    this.$emit('delTask', work)
                } else {
                    this.$tip.show({
                        message: '小云可能累了，请稍后再试'
                    })
                }
            })
        },

        // 进入工作详情
        editDetail (work) {
            this.$el.classList.add('active')
            work.isOld = true
            work.isDone = !work.isPlan
            this.setCurrentWork(work)
            this.setCoWorkers({
                source: 'detail',
                type: this.type === 'meeting' ? 'meeting' : 'schedule'
            })
            // 显示出点击效果
            // 会议：meeting； 协作日程：cooperationWork  普通日程：generalWork
            setTimeout(() => {
                if (this.type === 'meeting') {
                    this.$router.push({name: 'ConInfo'})
                } else if (this.type === 'schedule') {
                    this.$router.push({name: 'Detail'})
                } else {
                    this.$router.push({name: 'EventInfo'})
                }
            }, 32)
        }
    },
    components: {
        Popup
    }
}
</script>

<style lang="less" rel="stylesheet/less" scoped>
// .work-ctrls {
//     position: initial;
// }
.work-list {
    .work-row:last-child {
        .work-brief {
            border-bottom: none;
        }
    }
    .check-box {
        left: .16rem;
    }
}
.icon-huiyi, .icon-richengicon {
    // color: #A4A8AB !important;
    font-size: 25px;
}
.icon-star {
    position: absolute;
    top: 50%;
    left: -.2rem;
    margin-top: -.07rem;
    color: #E26735;
    font-size: .1rem;
}
.hasStar {
    margin-left: .2rem !important;
}
</style>
