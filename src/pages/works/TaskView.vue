<template lang="pug">
.taskview-wrap
    .empty-list(v-if="$proms.isOldDesk")
        i
            img(:src="imgs.empty")
        span(v-if="$proms.isOldDesk") 请升级到最新版本的桌面端 <br/> 或在手机上体验~

    .page-navbar(v-else)
        TaskTopNavbar(v-model="type")
        TaskBarContainer(v-model="type")

    //-     create-enter(v-if="!$proms.isDesktop && $mywork.workType !== 'meeting'")
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import CreateEnter from '@/components/CreateEnter'

import TaskTopNavbar from '@/components/taskView/TaskTopNavbar'
import TaskBarContainer from '@/components/taskView/TaskBarContainer'

export default {
    name: 'taskView',
    data () {
        return {
            // 1 日程 2 会议
            type: 1,
            // 未完成工作列表是否为空
            isPlanEmpty: false,
            showbtn: false,
            imgs: {
                empty: require('@/assets/empty.png')
            }
        }
    },
    computed: {
        ...mapGetters({
            curWork: 'curWork',
            planList: 'planList',
            doneWorks: 'doneWorks'
        })
    },
    created () {
        this.$proms.compEnd.call(this, {
            mobileCb: () => {
                // 修改移动端webview的title
                XuntongJSBridge.call('setWebViewTitle', {'title': '时间助手'})

                // 隐藏右边的按钮
                XuntongJSBridge.call('createPop', {
                    popTitle: '日历视图',
                    popTitleCallBackId: 'calendar'
                }, resp => {
                    this.$common.datalyEvent({event: '点击日历视图'})
                    this.$router.push({
                        name: 'Index'
                    })
                })
            },
            webCb: lappmask => {
                lappmask.removeCreatePop()
                lappmask.createPop([{
                    text: '日历视图',
                    callBack: (evt) => {
                        this.$common.datalyEvent({event: '点击日历视图'})
                        this.$router.push({
                            name: 'Index'
                        })
                    }
                }])
            }
        })
        if (this.$proms.ready) {
            this.$proms.ready.then(userInfo => {
                // this.getDoneWorks()
                // this.getPlanList()
            })
        } else {
            let timer = setInterval(() => {
                if (this.$proms.ready) {
                    this.$proms.ready.then(userInfo => {
                        this.getDoneWorks()
                        this.getPlanList()
                    })
                    clearInterval(timer)
                }
            }, 16)
        }
    },
    mounted () {
        this.$watch(() => {
            return this.$store.getters.planList
        }, newVal => {
            this.isPlanEmpty = !newVal.length
            this.showbtn = true
        })
        this.$proms.onLappReady().then(lappmask => {
            const obj = {
                needBack: true
            }
            window.parent.postMessage(JSON.stringify(obj), '*')
            lappmask.resetTitle('时间助手')
        })
    },
    methods: {
        ...mapActions([
            'setCurrentWork',
            'getDoneWorks',
            'getPlanList']),
        toggleDone () {
            this.$set(this.$parent._data, '$showDone', !this.$parent._data.$showDone)
        }
    },
    beforeRouteLeave (to, from, next) {
        this.$mywork.workType = ''
        next()
        return
    },
    beforeRouteEnter (to, from, next) {
        next(vm => {
            if (from.name === 'ConInfo') {
                vm.type = 2
            } else if (from.name === 'EventInfo') {
                vm.type = 3
            }
        })
    },
    components: {
        CreateEnter,
        TaskTopNavbar,
        TaskBarContainer
    }
}
</script>

<style lang="less" rel="stylesheet/less">
.taskview-wrap {
    height: 100%;
    background: #F8F9FB;
}
.page-navbar {
    height: 100%;
    background: #F8F9FB;
}
@import '../../css/index';
</style>
