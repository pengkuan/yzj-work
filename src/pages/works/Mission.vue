<template lang="pug">
li.work-row.clear(@click="editDetail(work)" :class="[{top: work.topState === 1}]")
    span.work-check(v-if="work.type === 'meeting'")
        i.check-box.icon-conf
            img(src="../../assets/conference.png")
    span.work-check(@click.stop="showConfirm"
        v-else)
        i.check-box.iconfont.icon-danxuankuang(ref="checkBox"
           :class="{'icon-danxuankuangxuanzhong': !work.isPlan}")
    .work-brief
        .work-con
            .work-desc
                b
                    i.work-type.work-co(v-if="work.actorOpenids && work.type !== 'meeting'")
                        img(src="../../assets/coop.png")
                    | {{work.content}}
            p.work-info(v-if="work.endDate || work.actorOpenids")
                span.work-creater(v-if="work.actorOpenids") {{work.personName}} {{$moment(work.createDate).format('MM-DD')}} 创建
                span.work-deadline(
                    v-if="work.endDate"
                    :class="[{outdated: isOutdated(work)}]")
                        |  {{ $moment(work.startDate).format('MM-DD HH:mm')}} {{isPlan ? (isOutdated(work) ? '已逾期' : '开始') : '' }}
    .work-ctrls(v-if="work.isPlan")
        // span.work-mark(@click.stop="_markWork(work)") {{work.workType === '0' ? '重要' : '取消重要' }}
        span.conf-cancel(v-if="work.type === 'meeting'"
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
import * as Operate from './operate'
import * as WorkOdds from '@/utils/work-odds'
import { mapActions } from 'vuex'
import Popup from '@/components/common/Popup'

const {checkWork,
    markWork,
    // queryPlanList,
    queryDoneList} = Operate
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
        work: Object
    },
    computed: {
        doneWorks: function () {
            return this.$store.getters.doneWorks
        },
        planList: function () {
            return this.$store.getters.planList
        }
    },
    mounted () {
        if (!this.work.isPlan || (this.work.type === 'meeting' && this.work.workSource !== '1')) return
        this.swipeOperate()
    },
    methods: {
        ...mapActions([ 'getPlanList',
            'getDoneWorks',
            'setCurrentWork',
            'setCoWorkers' ]),
        isOutdated (work) {
            return this.$moment(work.endDate).isBefore(new Date())
        },
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
            if (work.type === 'meeting') {
                pro = Requests.cancelConference(work)
            } else {
                pro = checkWork(work, work.isPlan ? -1 : 1, 1)
            }

            pro.then(resp => {
                if (work.isPlan) {
                    this.$set(work, 'remove', true)
                    // 动画效果过后，删除元素
                    this.delWorkData(this.planList, work, 300)
                    queryDoneList().then(resp => {
                        work.id = resp.data[0].id
                        // 删除元素后，在对应的列表中添加新元素
                        this.addWorkData(this.doneWorks, work, 310)
                    })
                    this.$refs.checkBox.classList.add('icon-danxuankuangxuanzhong')
                }
            })
        },

        // 删除工作
        _delWork (work) {
            this.$set(work, 'remove', true)
            let pro
            pro = Requests.delWork(work)
            pro.then(resp => {
                const list = this.$store.getters.planList
                this.delWorkData(list, work, 300)
            })
        },

        // 标记或取消标记
        _markWork (work) {
            markWork(work).then(resp => {
                this.work.workType = work.workType === '1' ? '0' : '1'
                this.$set(work, 'anim', false)
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
                type: work.type === 'meeting' ? 'meeting' : 'schedule'
            })
            // 显示出点击效果
            // 会议：meeting； 协作日程：cooperationWork  普通日程：generalWork
            setTimeout(() => {
                if (work.channel === 'recordWork') {
                    this.$router.push({name: 'EventInfo'})
                    return
                }
                if (work.type === 'meeting') {
                    this.$router.push({name: 'ConInfo'})
                } else {
                    this.$router.push({name: 'Detail'})
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
    .check-box.icon-richengicon{
        font-size:.22rem;
        position:relative;
        left:.2rem;
        top:.2rem;
    }
</style>
