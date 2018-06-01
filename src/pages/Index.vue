<template lang="pug">
    .my-work.page(ref="page")
        date-picker(:holiday=`{
            show: true,
            url: '/cloudwork/work/getWorkCalendarByRange'}`
            @change-day="setDay")

        //- Schedule(ref="Schedule")
        transition(name="fade")
            TimeLine(v-if="dayWorksRecieved && planList.length")
        transition(name="fade")
            .empty-work(v-if="dayWorksRecieved && !planList.length")
                img(
                    :src="defaultIconSrc"
                    alt="default-icon"
                    class="default-icon")
                .default-text {{ defaultText }}
                .create-schedule(v-if="!isPast" @click="createSchedule") 马上创建日程
        //- Done(ref="Done" v-if="doneWorks.length")
        create-enter
</template>

<script>
import Done from './works/Done'
import Schedule from './works/Schedule'
import {mapState, mapGetters, mapActions} from 'vuex'
import DatePicker from '@/components/datepicker/datepicker'
import CreateEnter from '@/components/CreateEnter'
import TimeLine from '@/components/TimeLine/TimeLine'

export default {
    name: 'Index',
    data () {
        return {
            showbtn: false,

            // 缺省图列表, 从过去时间, 到星期一, 到星期日
            defaultIconList: [
                // 第一个是用户点击过去时间的缺省图
                require('../assets/default-icons/default-icon-0.png'),
                require('../assets/default-icons/default-icon-1.png'),
                require('../assets/default-icons/default-icon-2.png'),
                require('../assets/default-icons/default-icon-3.png'),
                require('../assets/default-icons/default-icon-4.png'),
                require('../assets/default-icons/default-icon-5.png'),
                require('../assets/default-icons/default-icon-6.png'),
                require('../assets/default-icons/default-icon-7.png')
            ],

            // 缺省文案列表, 从过去时间, 到星期一, 到星期日
            defaultTextList: [
                // 第一个是用户点击过去时间的缺省文案
                '过去的这一天，好像什么都没做',
                '新的一天从日程管理开始',
                '经常错过重要的事，时间助手试一试',
                '时间往往不知不觉，我们习惯后知后觉',
                '拖延是一个人的焦虑，焦虑是一群人的拖延',
                '管理时间的前提，是管理自己',
                '大部分成功人士，把一切事情都放进日程',
                '一万小时能做什么？能让你每小时都值一万'
            ],

            // 用户当前选中的是日期星期几, 默认是今天
            day: new Date().getDay() || 7,

            // 当前选中的是否是过去的时间
            isPast: false
        }
    },

    computed: {
        ...mapState([
            'dayWorksRecieved'
        ]),

        ...mapGetters({
            curWork: 'curWork',
            planList: 'planList',
            doneWorks: 'doneWorks'
        }),
        test () {
            return this.$test
        },

        // 缺省图
        defaultIconSrc () {
            const src = this.defaultIconList[this.day]
            return src
        },

        // 缺省文案
        defaultText () {
            const text = this.defaultTextList[this.day]
            return text
        }
    },
    created () {
        this.$proms.compEnd.call(this, {
            mobileCb: () => {
                XuntongJSBridge.call('setWebViewTitle', {title: '时间助手'})
                XuntongJSBridge.call('createPop', {
                    popTitle: '全部日程',
                    popTitleCallBackId: 'task'
                }, resp => {
                    this.$common.datalyEvent({event: '点击全部日程'})
                    this.$router.push({name: 'TaskView'})
                })
            },
            webCb: lappmask => {
                lappmask.removeCreatePop()
                lappmask.removeSettingPop()
                lappmask.createPop([{
                    text: '全部日程',
                    callBack: evt => {
                        this.$common.datalyEvent({event: '点击全部日程'})
                        this.$router.push({name: 'TaskView'})
                    }
                }])
                lappmask.createSettingPop([{
                    text: '导出日程',
                    callBack: evt => {
                        this.$router.push({name: 'Export'})
                    }
                }])
            }
        })
    },
    mounted () {
        // H5测速平台埋点
        window.timePoints['indexMounted'] = Date.now()

        if (this.$proms.isOldIE) {
            // 对IE10以下做兼容处理，提示升级浏览器
            this.$refs.page.innerHTML = `
                <div class="ie-less9">
                    <span>
                        <img src="${this.imgs.empty}"/>
                    </span>
                    <p>您当前的IE版本过低，为了您能更好的体验时间助手<br/>
                    请升级到IE10或IE10以上的版本<br/>
                    使用<i>Chrome、Firefox、360浏览器</i>体验会更佳</p>
                </div>
            `
            return
        }
        // web端兼容
        this.$proms.onLappReady().then(lappmask => {
            // 隐藏返回按钮
            const obj = {
                needBack: false
            }
            window.parent.postMessage(JSON.stringify(obj), '*')
            lappmask.resetTitleBg('#46C7FF')
            lappmask.resetTitle('时间助手')
        })
    },
    methods: {
        ...mapActions([
            'setCurrentWork',
            'setPlanList',
            'setCoWorkers',
            'setWorkDate'
        ]),

        createSchedule () {
            this.$common.datalyEvent({event: '点击马上创建日程按钮'})
            this.setCurrentWork({})
            this.setWorkDate({})
            this.setCoWorkers({source: 'editor', type: 'schedule'})
            this.$router.push({name: 'Editor'})
        },

        setDay (data) {
            // 当前选中的日期
            const date = new Date(data.timestamp)
            // 当前选中的是星期几, 从 1 到 7
            this.day = date.getDay() || 7
            this.isPast = false
            if (data.isPast) {
                // 如果是用户选择的时间是过去, 则设定为星期 0
                this.day = 0
                this.isPast = true
            }
        },

        toEditor () {
            this.$common.datalyEvent({
                event: '新增按钮点击'
            })
            this.setCurrentWork({})
            this.$router.push({
                name: 'Editor'
            })
        },
        goList () {
            this.$router.push({
                name: 'TaskView'
            })
        }
    },
    components: {
        Done,
        Schedule,
        DatePicker,
        CreateEnter,
        TimeLine
    }
}
</script>

<style lang="less" rel="stylesheet/less">
@import '../css/index';
</style>
