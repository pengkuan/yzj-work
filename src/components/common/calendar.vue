<template lang="pug">
    transition(name="toggle")
        .date-wrap.datepicker
            .date-top
                span.top-center {{ctrlStatus.present.year}}-{{ctrlStatus.present.month + 1}}
                    i.iconfont.icon-youcejiantou.top-left-btn(@click="getDays(-1)")
                    i.iconfont.icon-youcejiantou.top-right-btn(@click="getDays(1)")
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
                .date-body
                    .dete-calendarchangeDay
                        ul(v-for="week, index in calendar" :key="index")
                            li(v-for="day in week"
                                :key="day.time"
                                :class=`[
                                    {'other-days': day.type !== 1},
                                    {'today': day.time == today.time}
                                ]`
                                @click="selectDay(day)")

                                span.date-day(:class=`[
                                    {'selected-day': day.time == ctrlStatus.selectedDay.time}
                                ]`) {{day.day}}
</template>
<script>
export default {
    data () {
        let date = this.$moment()
        let today = new Date(date.year(), date.month(), date.date())
        let todayObj = {
            date: today,
            time: today.getTime()
        }

        return {
            days: null,
            today: todayObj,

            // 日历月份切换状态控制
            ctrlStatus: {
                // 当前默认的年月
                current: {
                    year: 0,
                    month: 0
                },
                // 当前切换的年月
                present: {
                    year: 0,
                    month: 0
                },
                selectedDay: {
                    date: '',
                    time: ''
                }
            },
            festival: []
        }
    },
    props: {
        selectedTime: {
            type: Number,
            default: +new Date()
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
                // console.log(err)
            }
            return arr
        }
    },
    mounted () {
        this.$proms.ready.then(resp => {
            this.getcurDays()
        })
    },
    methods: {
        // 获取当前默认月份的日历
        getcurDays () {
            this.ctrlStatus.selectedDay.time = this.selectedTime
            let date = new Date(this.selectedTime)
            let [year, month] = [date.getFullYear(), date.getMonth()]
            this.days = this.genDays(year, month, [])
            this.ctrlStatus.present.year = this.ctrlStatus.current.year = year
            this.ctrlStatus.present.month = this.ctrlStatus.current.month = month
        },
        /**
         * @method 切换月份
         * @param {Number} type (0: 切换到当前的月份， 1：下一月， 2： 上一月)
        */
        getDays (type) {
            let present = this.ctrlStatus.present
            let current = this.ctrlStatus.current

            let prevYear = type === 0 ? current.year : present.year
            let prevMonth = type === 0 ? current.month : present.month

            let date = this.$moment([prevYear, prevMonth]).add(type, 'month')
            let [year, month] = [date.year(), date.month()]

            this.days = this.genDays(year, month)

            // 如果返回当月，则把选择的日期定位到今天，并请求今天的任务数据
            // console.log(date._d.getTime())
            // if (type === 0 || date._d.getMonth() === this.today.date.getMonth()) {
            //     this.changeDay(this.today)
            // } else {
                // this.changeDay({date: date._d, time: date._d.getTime()})
            // }
            present.year = year
            present.month = month
        },

        /**
         * @method changeDay 切换所选日期的任务
         * @param {Object} day 所选天的对象
        */
        changeDay (day) {
            this.$common.datalyEvent({
                event: '切换日期'
            })
            this.ctrlStatus.selectedDay = {
                date: day.date,
                time: day.time
            }
            // this.$mywork.selectedDay = day.time > this.today.time ? day : this.today
        },

        selectDay (day) {
            this.ctrlStatus.selectedDay = {
                date: day.date,
                time: day.time
            }
            this.$emit('select', day)
        },

        /**
         * @method genDays 生成展示的日历数组
         * @param {Number} year 年份
         * @param {Number} month 月份
        */
        genDays (year, month) {
            const days = []
            // 获取每月第一天是星期几
            let weekDay = new Date(year, month, 1).getDay()
            if (weekDay === 0) {
                weekDay = 7
            }

            /**
             * 获取上月的最后几天
             * 0: 为上月最后一天，-1: 为上月倒数第二天，以此类推
            */
            let feedDay = (weekDay - 1) - 1
            // 产生上一月的后几日，以弥补这月前几天
            while (feedDay >= 0) {
                days.push(this.genDayInfo(year, month, -feedDay, -1))
                feedDay--
            }
            // 产生当月的日期
            for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
                days.push(this.genDayInfo(year, month, i, 1))
            }
            // 产生下月的头几日，以补充日历的不足
            let num = 35
            if (days.length > 35) {
                num = 42
            }
            // 产生下月的头几日，以补充日历的不足
            let daysOfNextMonth = num - days.length
            for (let j = 1; j <= daysOfNextMonth; j++) {
                days.push(this.genDayInfo(year, month + 1, j, 2))
            }
            return days
        },

        /**
         * @method 返回计算后的日期信息
         * @param {Number} year 年份
         * @param {Number} month 月份
         * @param {Number} num 计算日期的数值
         * @param {Number} type 类型: 1: 当月, -1: 次月,2: 下月
        */
        genDayInfo (year, month, num, type) {
            let date = new Date(year, month, num)
            let day = date.getDate()
            let dayObj = {
                date,
                day,
                type,
                time: date.getTime()
            }
            return dayObj
        }
    }
}
</script>
<style lang="less" scoped rel="stylesheet/less">
@import "../../css/components/datepicker.less";
.toggle-enter-active, .toggle-leave-active {
    transition: transform .2s;
}
.toggle-enter, .toggle-leave-to {
    transform: translateY(100%);
}
.datepicker {
    position: fixed;
    width: 100%;
    bottom: 0;
    margin-bottom: 0;
    .date-head ul li {
        color: #768893;
    }
    .today {
        background: #fff;
        color: #4598F0;
    }
    .other-days {
        .date-day {
            font-weight: normal;
            color: #C2CCD0;
        }
    }
    .selected-day {
        background: rgba(60, 186, 255, 0.15);
        color: #4598F0;
    }
    .date-list {
        .date-day {
            height: 32px;
            width: 32px;
            line-height: 32px;
            cursor: pointer;
        }
    }
    .date-top {
        i {
            cursor: pointer;
        }
    }
}
</style>
