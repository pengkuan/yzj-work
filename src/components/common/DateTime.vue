<template lang="pug">
    mt-datetime-picker(
        :type= "type"
        :visible-item-count= "visibleItemCount"
        :cancel-text= "cancelText"
        :confirm-text= "confirmText"

        :year-format= "yearFormat"
        :month-format= "monthFormat"
        :date-format= "dateFormat"
        :hour-format= "hourFormat"
        :minute-format= "minuteFormat"

        :end-hour= "endHour"
        :start-hour= "startHour"

        @confirm= "handleConfirm"

        :start-date= "startDate"
        :end-date= "endDate"
    )
</template>

<script>
export default {
    data: function () {
        return {
            dateInfo: null,
            currSelectDateType: ''
        }
    },
    props: {
        type: {
            type: String,
            default: 'datetime'
        },
        visibleItemCount: {
            type: Number,
            default: 5
        },
        cancelText: {
            type: String,
            default: '取消'
        },
        confirmText: String,

        yearFormat: {
            type: String,
            default: '{value}年'
        },
        monthFormat: {
            type: String,
            default: '{value}月'
        },
        dateFormat: {
            type: String,
            default: '{value}日'
        },
        hourFormat: {
            type: String,
            default: '{value}点'
        },
        minuteFormat: {
            type: String,
            default: '{value}分'
        },
        endHour: Number,
        startHour: {
            type: Number,
            default: 0
        },
        currentValue: {
            default: ''
        }
    },
    mounted () {
        const toolbar = this.$el.querySelector('.picker-toolbar')
        const dateInfo = document.createElement('span')
        const confirm = this.$el.querySelector('.mint-datetime-confirm')
        dateInfo.classList.add('mint-datetime-action')
        dateInfo.classList.add('date-info')
        toolbar.insertBefore(dateInfo, confirm)
        this.dateInfo = dateInfo

        this.$watch(function () {
            return this.$children[0].currentValue
        }, newVal => {

        })
    },
    computed: {
        startDate: function () {
            return this.$moment(`${new Date().getFullYear()}-01-01 00:00:00`)._d
        },
        endDate: function () {
            let dateStr = `${new Date().getFullYear() + 1}-12-31 00:00:00`
            return this.$moment(dateStr)._d
        }
    },
    methods: {
        open (type) {
            this.currSelectDateType = type
            this.$children[0].open()

            // 选中当前时间
            this.$children[0].currentValue = this.currentValue || new Date()
        },
        close () {
            this.$children[0].close()
        },
        handleConfirm (val) {
            this.$emit('confirm', val, this.currSelectDateType)
        }
    }
}
</script>

<style lang="less" rel="stylesheet/less">
.mint-datetime-cancel{
    color:#1d1d1d !important;
}
.picker-toolbar{
    position: relative;
    display: flex;
}
.mint-datetime-action{
    flex:1;
    width: auto !important;
}
</style>
