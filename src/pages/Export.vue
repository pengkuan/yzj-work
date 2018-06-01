
<template lang="pug">
    .export-task-wrap 
        // 选择导出人员
        .export-person
            .export-title 选择导出人员
                span 仅能导出自己部门的下属
            .export-staff
                ul.export-staff-list
                    li.staff-item(v-for="item in staffList")
                        .staff-msg
                            img(:src="item.img")
                            i.staff-del(@click="delStaff(item.id)")
                            span.staff-name {{item.name}}
                    li.staff-item.export-add-btn(@click="selectStaff")
                        i.iconfont.icon-xinzeng
            
        // 选择导出日期
        .export-datetime
            .export-title 选择导出日期
            .export-cell(@click="chooseDate('startDate')")
                .export-cell-title 起始日期
                .export-cell-value {{startDate.format('YYYY-MM-DD')}}
                i.export-cell-arrow-right
            .export-cell.border-t(@click="chooseDate('endDate')")
                .export-cell-title 截止日期
                .export-cell-value {{endDate.format('YYYY-MM-DD')}}
                i.export-cell-arrow-right
        .export-btn.border-t(:class="{gray: disable}" @click="exportWork") {{btnValue}}
        .date-picker-mask(v-if="showDatepicker" @click="showDatepicker=false")
        datepicker(v-if="showDatepicker"
                    :selected-time="selectedTime"
                    @select="pickerDate")

</template>

<script>
    import datepicker from '@/components/common/calendar'
    import * as Odds from '@/utils/detail-odds'
    import { downloadFile } from '@/utils/helper'
    export default {
        name: 'ExportTask',
        data () {
            return {
                staffList: [],
                startDate: this.$moment().subtract(1, 'months'),
                endDate: this.$moment(),
                showDatepicker: false,
                currType: '',
                selectedTime: '',
                disable: true,
                btnValue: '确认导出'
            }
        },
        created () {
            // this.$tip.show({
            //     message: '你不是当前部门负责人,无权限导出相关excel报表',
            //     duration: 1000,
            //     type: 'failure'
            // })
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {'title': '导出日程'})
                },
                webCb: lappmask => {
                    lappmask.removeCreatePop()
                    lappmask.removeSettingPop()
                    lappmask.resetTitle('导出日程')
                    const obj = {
                        needBack: true
                    }
                    window.parent.postMessage(JSON.stringify(obj), '*')
                }
            })
        },
        mounted () {

        },
        watch: {
            staffList: function () {
                if (this.staffList.length > 0) {
                    this.disable = false
                } else {
                    this.disable = true
                }
            }
        },
        methods: {
            getStaffArr: Odds.getStaffArr,
            selectStaff: Odds.selectStaff,
            delStaff (id) {
                this.staffList.forEach(item => {
                    if (item.id === id) {
                        this.staffList.splice(this.staffList.indexOf(item), 1)
                    }
                })
            },
            pickerDate (day) {
                let _date = this.$moment(day.date)
                this.showDatepicker = false
                if (this.currType === 'startDate') {
                    if (this.endDate < _date) {
                        this.$tip.show({
                            message: '起始日期不能晚于截止日期'
                        })
                        return
                    }
                    this.startDate = _date
                } else {
                    if (this.startDate > _date) {
                        this.$tip.show({
                            message: '截止日期不能早于起始日期'
                        })
                        return
                    }
                    this.endDate = _date
                }
            },
            chooseDate (type) {
                this.currType = type
                let _time
                if (type === 'startDate') {
                    _time = new Date(this.startDate.year(), this.startDate.month(), this.startDate.date()).getTime()
                } else {
                    _time = new Date(this.endDate.year(), this.endDate.month(), this.endDate.date()).getTime()
                }
                this.selectedTime = _time
                this.showDatepicker = true
            },
            exportWork () {
                if (this.disable) {
                    return
                }
                this.disable = true
                this.btnValue = '正在导出'
                let ods = []
                this.staffList.forEach((item) => {
                    ods.push(item.id)
                })
                let params = this.$qs.stringify({
                    openIds: ods.join(',')
                })
                this.$http.post('/cloudwork/work/checkPersonPermission', params).then(resp => {
                    this.downloadFile(resp)
                }).catch(() => {
                    this.$tip.show({
                        message: '网络连接失败，请稍后再试',
                        type: 'failure'
                    })
                })
            },
            downloadFile (resp) {
                if (resp.success) {
                    if (resp.errorCode === 100) {
                        this.$tip.show({
                            message: '你不是当前部门负责人,无权限导出相关excel报表',
                            type: 'failure'
                        })
                        this.disable = false
                        this.btnValue = '确认导出'
                        return
                    } else if (resp.errorCode === 500) {
                        this.$tip.show({
                            message: '内部调用接口失败异常',
                            type: 'failure'
                        })
                        this.disable = false
                        this.btnValue = '确认导出'
                        return
                    }
                    let params = {
                        openIds: resp.data.join(','),
                        startDate: new Date(this.startDate.format()).getTime(),
                        endDate: new Date(this.endDate.format()).getTime()
                    }
                    let url = '/cloudwork/statistics/export'
                    downloadFile(params, url)
                    setTimeout(() => {
                        if (resp.errorCode === 300) {
                            this.$tip.show({
                                message: '导出成功，由于权限原因，其他部门人员的日程未能导出。',
                                duration: 3,
                                type: 'success'
                            })
                        } else if (resp.errorCode === 200) {
                            this.$tip.show({
                                message: '导出成功，已下载到本地',
                                duration: 3,
                                type: 'success'
                            })
                        }
                        this.disable = false
                        this.btnValue = '确认导出'
                    }, 1000)
                }
            }
        },
        components: {
            datepicker
        }
    }
</script>

<style lang="less" rel="stylesheet/less" scoped>
    .export-task-wrap {
        height: 100%;
        width: 100%;
        overflow: auto;
        padding-bottom: 60px;
        background: #F8F9FB;
        font-size: 16px;
        .date-picker-mask {
            position: fixed;
            height: 100%;
            width: 100%;
            top: 0;
            left: 0;
            background: rgba(14, 46, 71, 0.36);
        }
        .export-cell {
            height: .48rem;
            display: flex;
            align-items: center;
            color: #272727;
            &-radio {
                height: 16px;
                width: 16px;
                margin-right: .12rem;
                border: 1px solid #4598F0;
                border-radius: 16px;
            }
            &-select-radio {
                position: relative;
                background: #4598F0;
                &::after {
                    content: "";
                    position: absolute;
                    top: 1px;
                    left: 4px;
                    border: 1px solid #fff;
                    border-top-color: transparent;
                    border-left-color: transparent;
                    width: 6px;
                    height: 9px;
                    transform: rotateZ(45deg);
                }
            }
            &-title {
                flex: 1;
            }
            &-value {
                margin-right: .2rem;
            }
            &-arrow-right {
                border: 2px solid #9BA4AB;
                border-bottom-width: 0;
                border-left-width: 0;
                content: "";
                top: 6px;
                right: .12rem;
                position: relative;
                width: 11px;
                height: 11px;
                transform: translateY(-50%) rotate(45deg);
            }
        }
        .export-title {
            height: .5rem;
            line-height: .5rem;
            font-weight: bold;
            color: #0F092A;
            span {
                color: #889AA4;
                font-size: 14px;
                font-weight: normal;
                float: right;
                padding-right: .2rem;
            }
        }
        .export-person {
            padding-left: .16rem;
            margin-bottom: .09rem;
            margin-top: .08rem;
            background: #fff;
            .export-staff-list {
                display: flex;
                margin-left: -.16rem;
                padding-bottom: .18rem;
                flex-wrap: wrap;
                .staff-item {
                    .staff-msg {
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    display: flex;
                    align-items: center;
                    flex-direction: column;
                    flex: 0 0 20%;
                    img {
                        display: block;
                        height: .42rem;
                        width: .42rem;
                        margin: .08rem 0;
                        border-radius: 50%;
                    }
                    .staff-name {
                        display: block;
                        text-align: center;
                        font-size: .14rem;
                        padding: .06rem .08rem 0;
                        width: .7rem;
                        margin: 0 auto;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        color: #1D1D1D;
                    }
                    .staff-del {
                        position: absolute;
                        top: 8px;
                        right: 14px;
                        width: .14rem;
                        height: .14rem;
                        border-radius:50%;
                        border:.005rem solid #B9C7D2;
                        background:#fff;
                        transform: rotate(45deg);
                        cursor: pointer;
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
                }
            }
            .export-add-btn {
                padding: .08rem 0;
                .icon-xinzeng {
                    cursor: pointer;
                    font-size: 42px;
                    color: #768893;
                }
            }
        }
        .export-datetime {
            padding-left: .16rem;
            background: #fff;
            .export-cell {
                cursor: pointer;
            }
        }
        .export-btn {
            position: fixed;
            bottom: 0;
            width: 100%;
            height: .44rem;
            color: #46C7FF;
            background: #fff;
            text-align: center;
            line-height: .44rem;
            font-size: 14px;
            cursor: pointer;
            border-top: .5px solid #EAEFF3;
        }
        .gray {
            color: #768893;
        }
    }
</style>
