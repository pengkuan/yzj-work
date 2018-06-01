<template lang="pug">
    .date-wrap
        .date-top(:class="{fold: ctrlStatus.toggle.fold}")
            span.top-center {{ctrlStatus.present.year}}年{{ctrlStatus.present.month + 1}}月
                i.iconfont.icon-youjiantou.top-left-btn(v-touch:tap="getDays.bind({}, -1)")
                i.iconfont.icon-youjiantou.top-right-btn(v-touch:tap="getDays.bind({}, 1)")
            span.top-right(v-if="isShowToday" v-touch:tap="getDays.bind({}, 0)") 返回今天
        .date-list
            .date-head
                ul
                    li 一
                    li 二
                    li 三
                    li 四
                    li 五
                    li 六
                    li 日
            .date-body(:class="{fold: ctrlStatus.toggle.fold}")
                .date-loading(v-if="ctrlStatus.isLoading")
                    span.date-loading-icon
                        img(src="../../assets/logo.svg")
                    span.date-loading-text 加载中...
                .dete-calendar(v-if="!ctrlStatus.isLoading")
                    ul(v-for="week, index in calendar" :class=`{
                            fold: ctrlStatus.toggle.fold && (index != ctrlStatus.toggle.curRow)
                        }`
                        :key="index")
                        li(v-for="day in week"
                            :key="day.time"
                            :class=`[
                                {'other-days': day.type !== 1},
                                {'today': day.time == today.time},
                                {'passed': day.time < today.time}
                            ]`
                            :data-selecte = "ctrlStatus.selectedDay.time"
                            :row="day.time == ctrlStatus.selectedDay.time ? setCurRow(index): ''"
                            v-touch:tap="changeDay.bind({}, day)")

                            span.date-day(:class=`[
                                {'selected-day': day.time == ctrlStatus.selectedDay.time},
                                {move: day._data.isHoliday && (!day._data.hasUndoneWork && !day._data.hasDoneWork) ||
                                    day._data.isMakeUpWorkDay && (!day._data.hasUndoneWork && !day._data.hasDoneWork)}]`) {{day.day}}

                                span.day-status(:class=`[day._data.hasUndoneWork ? 'done' : day._data.hasDoneWork ? 'iconfont icon-xuanzhongduigou' : '']`)

                                span(:class="[$proms.isMobile ? 'date-stats' : 'date-stats-web']" v-if="!day._data.hasUndoneWork && !day._data.hasDoneWork")
                                    i.date-festival(
                                        :class=`{
                                            'date-scale': !$proms.isMobile,
                                            'date-center': day._data.holidayName === '休'
                                            }`
                                        v-if="day._data.isHoliday && day._data.holidayName") {{day._data.holidayName === '休'? '假': day._data.holidayName}}
                                    i.date-rest(:class="{'date-scale': !$proms.isMobile}" v-if="day._data.isHoliday && day._data.holidayName !== '休'") 假
                                    i.date-makeup(
                                        :class=`{
                                                'date-scale': !$proms.isMobile,
                                                'date-center': !day._data.isHoliday
                                            }`
                                        v-if="day._data.isMakeUpWorkDay") {{day._data.holidayName}}
        .date-bottom(@click="toggleCalender")
            .icon-wrap
                .iconfont.icon-jiantou(:class=`[{fold: ctrlStatus.toggle.fold},
                    $proms.isMobile ? 'jiantou' : 'jiantou-web'
                    ]`)
</template>
<script>
import {mapActions} from 'vuex'
import {queryDayWorks} from '@/api/sendRequest'

export default {
    data () {
        let date = this.$moment()
        let today = new Date(date.year(), date.month(), date.date())
        let todayObj = {
            date: today,
            time: today.getTime()
        }
        let selectedDay = todayObj
        if (this.$common.urlParams.timestamp) {
            selectedDay = this.$mywork.selectedDay
        }
        return {
            days: null,
            today: todayObj,

            // 日历月份切换状态控制
            ctrlStatus: {
                // 当前默认的年月日
                current: {
                    year: 0,
                    month: 0,
                    day: 0
                },
                // 当前切换的年月日
                present: {
                    year: 0,
                    month: 0,
                    day: 0
                },
                // 被选择的天，以便获取那天的数据
                selectedDay: selectedDay,

                // 折叠/打开 日历的状态控制
                toggle: {
                    fold: true,
                    curRow: undefined
                },
                // 加载数据占位状态
                isLoading: false
            },
            festival: []
        }
    },
    props: {
        holiday: {
            type: Object,
            default: () => {
                return {
                    show: true,
                    url: ''
                }
            }
        }
    },
    computed: {
        calendar () {
            const arr = []
            try {
                // 对当前日历进行处理，
                // 分成5组，分组显示，以便折叠
                for (let i = 1; i <= 6; i++) {
                    let row = this.days.slice((i - 1) * 7, i * 7)
                    if (row.length) {
                        arr.push(row)
                    }
                }
            } catch (err) {
            }
            return arr
        },
        isShowToday () {
            let cur = this.ctrlStatus.current
            let pre = this.ctrlStatus.present

            return cur.year !== pre.year || cur.month !== pre.month || cur.day !== pre.day
        }
    },
    mounted () {
        // this.getcurDays()
        this.$proms.ready.then(resp => {
            this.getcurDays()
        })
    },
    methods: {
        ...mapActions(['setDoneList', 'setPlanList', 'setDayWorksRecieved']),

        // 获取当前默认月份的日历
        getcurDays () {
            let date = new Date()
            let obj = {}
            let timestamp = this.$common.urlParams.timestamp

            // 如果是来自工作台的，则定位到进来时所选择的日期
            if (timestamp) {
                obj = this.$mywork.selectedDay
                this.$common.urlParams.timestamp = ''
            } else if (this.$mywork.selectedDay) {
                obj = this.$mywork.selectedDay
                this.ctrlStatus.toggle.fold = false
            }
            let [year, month, day] = [date.getFullYear(), date.getMonth(), date.getDate()]
            let {present, current} = this.ctrlStatus
            Object.assign(present, {year, month, day})
            Object.assign(current, {year, month, day})

            this.days = this.genDays(year, month, [])
            this.getHoliday(this.days[0].time, this.days[this.days.length - 1].time).then(data => {
                this.days = this.genDays(year, month, data.dayWorkList)
            })

            this.changeDay(timestamp || this.$mywork.selectedDay ? obj : this.today)
        },

        // 设置当前天所在的行
        setCurRow (index) {
            this.ctrlStatus.toggle.curRow = index
        },
        swipeLeft () {
        },

        /**
         * @method 切换月份
         * @param {Number} type (0: 切换到当前的月份， 1：下一月， -1： 上一月)
        */
        getDays (type) {
            let eventStr = '返回今天点击'
            eventStr = type === 0 ? eventStr : (type === -1 ? '上一个月点击' : '下一个月点击')
            this.$common.datalyEvent({
                event: eventStr
            })

            let present = this.ctrlStatus.present
            let current = this.ctrlStatus.current

            let [prevYear, prevMonth, prevDay] = type === 0
                ? [current.year, current.month, current.day]
                : [present.year, present.month, present.day]

            let date = this.$moment([prevYear, prevMonth, prevDay]).add(type, 'month')
            let [year, month, day] = [date.year(), date.month(), date.date()]

            this.days = this.genDays(year, month, [])
            this.getHoliday(this.days[0].time, this.days[this.days.length - 1].time).then(data => {
                this.days = this.genDays(year, month, data.dayWorkList)
            })

            // 如果返回当月，则把选择的日期定位到今天，并请求今天的任务数据
            if (type === 0 || (date._d.getMonth() === this.today.date.getMonth() &&
                date._d.getYear() === this.today.date.getYear())) {
                this.changeDay(this.today)
            } else {
                this.changeDay({date: date._d, time: date._d.getTime()})
            }
            present.year = year
            present.month = month
            present.day = day
        },

        /**
         * @method changeDay 切换所选日期的任务
         * @param {Object} day 所选天的对象
        */
        changeDay (day) {
            // this.$store.state.dayWorksRecieved = false
            this.setDayWorksRecieved(false)
            console.log(day)
            this.ctrlStatus.selectedDay = {
                date: day.date,
                time: day.time
            }

            this.$emit('change-day', {
                timestamp: day.time,
                isPast: day.time < this.today.time
            })

            this.$mywork.selectedDay = day.time >= this.today.time ? day : this.today
            this.$mywork.selectedDayOrigin = day
            this.ctrlStatus.present.day = day.date.getDate()

            queryDayWorks(day.time).then(resp => {
                this.setPlanList(resp.data.works)
                // this.$store.state.dayWorksRecieved = true
                this.setDayWorksRecieved(true)
            })
            this.$common.datalyEvent({
                event: '切换日期'
            })
        },

        /**
         * @method genDays 生成展示的日历数组
         * @param {Number} year 年份
         * @param {Number} month 月份
         * @param {Array} workData 从后端获取的当月任务数据
        */
        genDays (year, month, workData) {
            const days = []

            // 获取每月第一天是星期几
            let weekDay = new Date(year, month, 1).getDay()
            weekDay = weekDay === 0 ? 7 : weekDay

            /**
             * 获取上月的最后几天
             * 0: 为上月最后一天，-1: 为上月倒数第二天，以此类推
            */
            let feedDay = (weekDay - 1) - 1
            let index = 0

            // 产生上一月的后几日，以弥补这月前几天
            while (feedDay >= 0) {
                days.push(this.genDayInfo(year, month, -feedDay, -1, workData[index]))
                feedDay--
                index++
            }

            // 产生当月的日期
            for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
                days.push(this.genDayInfo(year, month, i, 1, workData[index]))
                index++
            }

            // 产生下月的头几日，以补充日历的不足
            let num = days.length > 35 ? 42 : 35

            let daysOfNextMonth = num - days.length
            for (let j = 1; j <= daysOfNextMonth; j++) {
                days.push(this.genDayInfo(year, month + 1, j, 2, workData[index]))
                index++
            }
            return days
        },

        /**
         * @method 返回计算后的日期信息
         * @param {Number} year 年份
         * @param {Number} month 月份
         * @param {Number} num 计算日期的数值
         * @param {Number} type 类型: 1: 当月, -1: 上月,2: 下月
        */
        genDayInfo (year, month, num, type, _data) {
            let date = new Date(year, month, num)
            let day = date.getDate()
            let dayObj = {
                date,
                day,
                type,
                time: date.getTime(),
                _data: _data || {}
            }
            return dayObj
        },
        /**
         * @method 传一个时间段
        */
        getHoliday (startTime, endTime) {
            this.ctrlStatus.isLoading = true
            return new Promise(resolve => {
                this.$http.post(this.holiday.url, {
                    startTime,
                    endTime
                }).then(resp => {
                    this.ctrlStatus.isLoading = false
                    resolve(resp.data)
                })
            })
        },
        toggleCalender () {
            let toggle = this.ctrlStatus.toggle
            toggle.fold ? (toggle.fold = false) : (toggle.fold = true)
        }
    }
}
</script>
<style lang="less" scoped rel="stylesheet/less">
@import "../../css/components/datepicker.less";
</style>
