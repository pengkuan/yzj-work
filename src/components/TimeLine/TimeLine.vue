
<template lang="pug">
    .time-line-wrap
        TimeLineItem(v-for="item in taskList"
            :key="item.id"
            :item="item"
            @panleft="onPanleft")
</template>
<script>
import TimeLineItem from './TimeLineItem'
export default {
    data () {
        return {
            animWork: null
        }
    },
    computed: {
        // 云之家 app 版本是否为 v10
        isV10 () {
            return Number((navigator.userAgent.match(/^Qing\/\d+\.([^;]+)/) || [])[1] || '0') >= 9.7
        },

        taskList () {
            let currData = []
            let acrossData = []
            let birthdayData = []
            this.$store.getters.planList.forEach(item => {
                item.acrossDay = false
                item.overdue = false
                if (item.channel === 'birthday') {
                    birthdayData.push(item)
                } else if (new Date(item.startDate).getDate() !== new Date(item.endDate).getDate()) {
                    item.acrossDay = true
                    acrossData.push(item)
                } else {
                    currData.push(item)
                }
                let curTime = +new Date()
                if (item.endDate < curTime && item.endDate !== item.startDate) {
                    item.overdue = true
                }
            })
            const tasks = [...this.timeSort(currData, 'startDate'), ...this.timeSort(acrossData, 'endDate'), ...birthdayData]
            let result

            if (this.isV10) {
                // v10 用户没有升级提示日程
                result = tasks.filter(task => task.channel !== 'v10update')
            } else {
                // v10 以下用户没有头号玩家活动日程
                result = tasks.filter(task => task.channel !== 'touhaowanjia')
            }

            return result
        }
    },
    mounted () {
        // this.initHandle()
    },
    methods: {
        timeSort (arr, attr) {
            arr.sort((a, b) => {
                return a[attr] - b[attr]
            })
            return arr
        },
        onPanleft (work) {
            this.animWork = work
        }
    },
    components: {
        TimeLineItem
    }
}
</script>
<style lang="less" scoped>
.time-line-wrap {
    width: 100%;
    height: auto;
    padding-top: .36rem;
    overflow: hidden;
    background: #fff;
    &::after {
        content: "";
        display: block;
        height: .3rem;
        background: #fff;
        width: 100%;
    }
}
</style>

