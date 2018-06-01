
<template lang="pug">
    .work-cell(@click.stop="showList=true")
        .cell-content.border-t
            .cell-title 提醒
            .cell-value
                span {{value.remindValue}}
                i.iconfont.icon-youjiantou
                //- i.cell-arrow-right
            page-container(v-model="showList" hash="remind")
                remind-List(:gap-min="gapMin"
                            :remind-min="value.remindMin"
                            :type="type"
                            @choose="chooseTime")
</template>
<script>
import remindList from '@/components/common/remindList'
import PageContainer from '@/components/common/PageContainer'

export default {
    data () {
        return {
            showList: false
        }
    },
    props: {
        gapMin: {
            type: Number,
            default: 0
        },
        value: {
            default: {
                remindMin: 0,
                remindValue: '日程开始时'
            }
        },
        type: {
            type: Number,
            default: 1 // [0: 详情， 1: 日程， 2: 会议]
        }
    },
    methods: {
        chooseTime (remindObj) {
            this.$emit('input', {remindMin: remindObj.minute, remindValue: remindObj.value})
            setTimeout(() => {
                window.history.back()
                // this.showList = false
            }, 100)
        }
    },
    watch: {
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
    height: .48rem;
    background: #fff;
    line-height: .48rem;
    font-size: .16rem;
    .cell-content {
        margin: 0 .12rem;
        display: flex;
        flex-direction: row;
        // position: relative;
        .cell-title {
            flex: 1;
            padding-left: .06rem;
            color: #1D1D1D;
        }
        .cell-value {
            padding-right: .06rem;
            color: #768893;
            span {
                padding-right: .12rem;
            }
            .cell-arrow-right {
                display: inline-block;
                border: 2px solid #9BA4AB;
                border-bottom-width: 0;
                border-left-width: 0;
                top: 5px;
                right: .06rem;
                position: relative;
                width: 11px;
                height: 11px;
                transform: translateY(-50%) rotate(45deg);
            }
        }
    }
}
</style>

