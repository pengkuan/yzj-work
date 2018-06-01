<template lang="pug">
    // 工作时间范围
    .date-set
        .work-timebase
            .work-start
                i 开始
                span.picker-val(
                    @click="openPicker('startDate')" ) {{startTime}}
            .work-time-split
                b
            .work-endtime
                i 结束
                span.picker-val(
                    @click="openPicker('endDate')") {{endTime}}
        date-time(
            ref= "timePicker"
            :current-value= "time"
            @confirm= "handlePicker")
</template>
<script>
import {getDate,
    formatDate} from '@/pages/works/operate'
import DateTime from '@/components/common/DateTime'
import {mapGetters, mapActions} from 'vuex'

export default {
    name: 'Dateset',
    data () {
        let {endDate, startDate} = this.getDefaultDate()
        return {
            workDate: {
                startDate,
                endDate
            }
        }
    },
    computed: {
        ...mapGetters({
            taskDate: 'taskDate'
        }),
        time () {
            return this.pickerDate ? this.$moment(this.pickerDate)._d : ''
        },
        startTime () {
            return this.formatDate(this.workDate.startDate)
        },
        endTime () {
            return this.formatDate(this.workDate.endDate)
        }
    },
    watch: {
        taskDate: val => {
            this.workDate = val
        }
    },
    created () {
        if (this.taskDate.startDate) {
            this.workDate = this.taskDate
        } else {
            this.setWorkDate(this.workDate)
        }
    },
    methods: {
        ...mapActions(['setWorkDate']),
        formatDate,
        getDate,
        getDefaultDate () {
            let startDate
            let endDate
            let formatStr = 'YYYY-MM-DD HH:mm:ss'
            if (this.$mywork.voiceContent && this.$mywork.startTime) {
                let start = this.$moment(parseInt(this.$mywork.startTime))
                startDate = start.format(formatStr)
                endDate = start.add(1, 'hour').format(formatStr)
            } else {
                startDate = this.$moment().format(formatStr)
                let today = this.$moment()
                let nextDay = this.$moment(`${today.year()}/${today.month() + 1}/${today.date()} 23:59:59`).valueOf()

                // 日历上所选的日期要大于今天的24点，则默认为明天
                if (this.$mywork.selectedDay && this.$mywork.selectedDay.time >= nextDay) {
                    startDate = this.$moment(this.$mywork.selectedDay.time)
                    .hour(8).minute(30).format(formatStr)
                }
                // 默认的任务截止时间: 18点前创建的，18点为截止时间；18后创建的，翌日的18点
                let time = this.$moment(startDate).hour(18).minute(0).second(0)

                if (this.$moment(startDate).hour() < 18) {
                    endDate = time.format(formatStr)
                } else {
                    endDate = time.add(1, 'day').format(formatStr)
                }
            }

            return {
                endDate,
                startDate
            }
        },
        openPicker (type) {
            if (!this.$isOldBridge) {
                this.getDate(this.workDate[type], value => {
                    this.handlePicker(value.data.dateTime, type)
                })
            } else {
                this.$refs.timePicker.open(type)
            }
        },
        handlePicker (val, type) {
            let date = this.$moment(val)
            if (JSON.stringify(date) === 'null') {
                this.$tip.show({
                    message: '时间格式出错，请重新选择'
                })
                return
            }
            let dateFm = date.format('YYYY-MM-DD HH:mm:ss')
            if (type === 'startDate') {
                if (date.valueOf() < Date.now()) {
                    this.$tip.show({
                        message: '开始时间不能是过去时间'
                    })
                    return
                }
                this.workDate.endDate = date.add('hour', 1).format('YYYY-MM-DD HH:mm:ss')
            } else if (type === 'endDate') {
                if (date.valueOf() < this.$moment(this.workDate.startDate).valueOf()) {
                    this.$tip.show({
                        message: '截止时间不能早于开始时间'
                    })
                    return
                }
            }
            this.workDate[type] = dateFm

            this.setWorkDate({
                startDate: this.workDate.startDate,
                endDate: this.workDate.endDate
            })
        }
    },
    components: {
        DateTime
    }
}

</script>
<style lang="less" scoped>
.work-timebase{
    padding:.15rem .16rem;
    background: #fff;
    display: flex;
    border-top:1px solid #F8F9FB;
    position: relative;
    .work-endtime, .work-start, .work-time-split{
        flex-basis: auto;
        flex-grow: 1;
        flex-shrink: 1;
    }
    .work-time-split{
        flex-basis: .6rem;
        flex-grow: 0;
        flex-shrink: 0;
    }
    span{
        font-size: .14rem;
        color:#4598F0;
        &:active{
            opacity: .5;
        }
        &.outdated{
            color:#F55147;
        }
    }
    i {
        line-height: .2rem;
        display: block;
        color:#889AA4;
        font-size: .12rem;
    }
    b {
        position: absolute;
        width:.3rem;
        height: .4rem;
        top:50%;
        transform: translate(0, -50%);
        &::before, &::after{
            position: absolute;
            content: ' ';
            height: .2rem;
            width:.14rem;
            border-right:1px solid #C2CCD0;
        }
        &::before{
            transform: rotate(-30deg);
            top:.06rem;
        }
        &::after{
            transform: rotate(30deg);
            top:.16rem;
        }
    }
}
</style>

