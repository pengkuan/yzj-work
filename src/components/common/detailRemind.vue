
<template lang="pug">
    .work-cell
        .cell-content
            .cell-left(:class="{multiLine: !!countingText && !isLimitChoose}"
                @click.stop="popList")
                //- .cell-title 提醒
                .cell-text(
                    v-if="countingText"
                    :class="{overdue: workStageId && workStatus.OVERDUE.id === workStageId}") {{countingText}}
                .cell-value(v-if="!isLimitChoose") {{!remindValue.endsWith('提醒') ? `${remindValue}提醒` : remindValue}}
                    span
                        //- i.cell-arrow-right(v-if="!isLimitChoose")
                        i.iconfont.arrow-right(v-if="!isLimitChoose") &#xead8;
            .cell-right
                .cell-tip(v-if="remindTip") {{remindTip}}
                slot(name="add-comment")
            page-container(v-model="showList" hash="remind")
                remind-List(:gap-min="gapMin"
                            :remind-min="selectedMin"
                            :type="type"
                            @choose="chooseTime")
</template>
<script>
import remindList from '@/components/common/remindList'
import { meetingMap, scheduleMap, WORK_STATUS } from '@/common/remindList'
import { updateNoticeTime } from '@/api/sendRequest'
import PageContainer from '@/components/common/PageContainer'
import {mapGetters, mapActions} from 'vuex'

export default {
    data () {
        return {
            showList: false,
            mapValue: this.type === 1 ? scheduleMap : meetingMap,
            remindValue: '',
            selectedMin: this.remindMin,
            workStatus: WORK_STATUS
        }
    },
    props: {
        gapMin: {
            type: Number,
            default: 0
        },
        remindMin: {
            type: Number,
            default: 0
        },
        type: {
            type: Number,
            default: 1 // [0: 详情， 1: 日程， 2: 会议]
        },
        remindTip: [String, Boolean],
        countingText: String,
        workStageId: Number
    },
    methods: {
        ...mapActions(['setCurWorkStatus']),
        popList () {
            if (this.isLimitChoose) {
                return
            }
            this.showList = true
        },
        chooseTime (remindObj) {
            updateNoticeTime(this.type,
                this.type === 1 ? {'workId': this.curWork.id, 'noticeTime': remindObj.minute}
                : {'meetingId': this.curWork.id, 'noticeTime': remindObj.minute})
            let tempObj = Object.assign({}, {currentWorkUser: Object.assign({}, this.curWork.currentWorkUser, {noticeTime: remindObj.minute})})
            this.setCurWorkStatus(tempObj)
            setTimeout(() => {
                window.history.back()
                // this.showList = false
            }, 100)
            this.remindValue = remindObj.value
            this.selectedMin = remindObj.minute
        }
    },
    mounted () {
        this.remindValue = this.mapValue.filter((item) => item.minute === this.remindMin)[0].value
    },
    computed: {
        ...mapGetters({
            curWork: 'curWork'
        }),
        isLimitChoose () {
            return this.gapMin <= 0 ||
            (this.curWork.currentWorkUser && this.curWork.currentWorkUser.workStatus === 1) ||
            this.curWork.workStatus === 1 ||
            (this.curWork.currentWorkUser && this.curWork.currentWorkUser.acceptStatus === 1)
        }
    },
    watch: {
        remindMin () {
            this.selectedMin = this.remindMin
            this.remindValue = this.mapValue.filter((item) => item.minute === this.remindMin)[0].value
        },
        showList () {
            if (this.showList === true) {
                this.$proms.compEnd.call(this, {
                    mobileCb: () => {
                        XuntongJSBridge.call('setWebViewTitle', {'title': '提醒'})
                        XuntongJSBridge.call('closePop')
                    },
                    webCb: lappmask => {
                        lappmask.resetTitle('提醒')
                        lappmask.removeCreatePop()
                    }
                })
            } else {
                this.$emit('recoverMenu')
            }
        }
    },
    components: {
        remindList,
        PageContainer
    }
}
</script>

<style lang="less" scoped>
.work-cell {

    background: #fff;
    line-height: .42rem;
    font-size: .16rem;
    // margin-bottom: .16rem;
    padding: .4rem 0 .16rem;
    .cell-content {
        margin: 0 .14rem 0 .16rem;
        display: flex;
        flex-direction: row;
        height: .42rem;
        // position: relative;
        align-items: center;
        .cell-left {
            flex: 1;
        }
        .cell-right {
            flex: none;
        }
        .cell-title {
            flex: 1;
            padding-left: .06rem;
            color: #1D1D1D;
        }

        .cell-text {
            font-size: .16rem;
            color: #272727;
            &.overdue {
                color: #F55147;
            }
        }

        .cell-value {
            padding-right: .06rem;
            color: #4598F0;
            line-height: .42rem;
            span {
                padding-right: .12rem;
            }
            .cell-arrow-right {
                display: inline-block;
                border: 2px solid #4598F0;
                border-bottom-width: 0;
                border-left-width: 0;
                top: 3px;
                left: .05rem;
                position: relative;
                width: 9px;
                height: 9px;
                transform: translateY(-50%) rotate(45deg);
            }

            &:active {
                opacity: 0.5;
            }
        }

        .cell-tip {
            font-size: .13rem;
            color: #B3B7B9;
            text-align: right;
        }
        .commitBtn-wrap {
            display: inline-block;
            width: 1.18rem;
            height: .36rem;
            color:#768893;
            border-radius: .04rem;
            margin:.02rem .02rem .02rem 0;
            overflow: hidden;
        }

        .commitBtn.re-send {
            border: 1px solid #768893;
            color:#768893;
        }

        .commitBtn{
            display: block;
            width: 99%;
            height: 98%;
            line-height: .35rem;
            border: 1px solid #4598F0;
            color: #fff;
            background: #4598F0;
            border-radius: .04rem;
            text-align: center;
            font-size: .14rem;
            transform-origin: 0 0;
            transform: scale(1);
            &:active{
                background: rgba(69, 152, 240, .5);
                opacity:.5;
            }
        }
        @media screen and (-webkit-min-device-pixel-ratio: 2) {
            .commitBtn{
                width: 199%;
                height: 198%;
                line-height: .70rem;
                border-radius: .08rem;
                font-size: .28rem;
                transform: scale(.5);
            }
        }

        .multiLine {
            .cell-text {
                line-height: .22rem;
                margin-bottom: .01rem;
            }

            .cell-value {
                font-size: .13rem;
                line-height: .18rem;

                .arrow-right {
                    font-size: .13rem;
                }
            }
        }
    }
}
</style>

