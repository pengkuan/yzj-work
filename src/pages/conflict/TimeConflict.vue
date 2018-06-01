/**
 * @component TimeConflict 时间冲突列表
 */
<template lang="pug">
    .time-comflict(
        ref="timeConflict"
        :class="{empty: !conflictList.length, mask: maskStyle}")
        .mask-layer(
            v-if="maskStyle"
            @click="beforeCloseMask"
            :class="{beforeClose: beforeClose}")
        .conflict-wrap(
            ref="conflictWrap"
            @touchstart="setTouchStartPoint"
            @touchmove="forbidDetailScroll"
            :class="{beforeClose: beforeClose}")
            .close
                i.iconfont.icon-close(v-if="maskStyle" @click.stop="beforeCloseMask")
            template(v-if="conflictList.length")
                .conflict-staff
                    span.avatar
                        img(:src="conflictStaff.img")
                    span.name {{conflictStaff.name}}
                .content
                    .time-text 当前选择时段
                        span.time {{selectTimeRange}}
                        <br/> 与Ta冲突的日程:
                    ul.conflict-list
                        li.conflict-item(v-for="item of conflictList" :key="item.id")
                            span.icon
                                i.iconfont(:class="item.type === 'meeting' ? 'icon-meeting' : 'icon-schedule'")
                            .conflict-content
                                .conflict-time {{formatDate(item.startDate, item.endDate)}}
                                .conflict-text {{renderText(item.type)}}
                .wrap-button
                    .contact(v-if="showContactButton" @click="toContact") 找Ta沟通
            .empty-conflict(v-else-if="!isDefault")
                .no-conflict-img
                span.empty-text 当前时间段Ta已无时间冲突

</template>

<script>
import {xtsend, fetchConflictList} from '@/api/sendRequest'
import env from '@/config/env.config'

export default {
    data () {
        return {
            conflictList: [],
            isDefault: true, // 标识conflictList是否初始值或已被改变过
            startY: 0, // touch起点y方向位置
            beforeClose: false
        }
    },
    props: {
        crtConflictPerson: Object,
        taskDate: Object,
        meetingId: [String, Number],
        maskStyle: {
            type: Boolean,
            default: false
        },
        close: Function
    },
    computed: {
        conflictStaff () {
            const {staffId, staffName, img, creator} = this.crtConflictPerson || this.$common.urlParams

            return {
                img: decodeURIComponent(decodeURIComponent(img)),
                id: staffId,
                name: decodeURIComponent(decodeURIComponent(staffName)),
                creatorId: creator
            }
        },
        taskDateTime () {
            if (!this.taskDate) return

            const {startDate, endDate} = this.taskDate

            return {
                startDate: typeof startDate === 'number' ? startDate : new Date(startDate.replace(/-/g, '/')).getTime(),
                endDate: typeof endDate === 'number' ? endDate : new Date(endDate.replace(/-/g, '/')).getTime()
            }
        },
        selectTimeRange () {
            let {startDate, endDate} = this.taskDateTime || this.$common.urlParams
            return this.formatDate(Number(startDate), Number(endDate), true)
        },
        showContactButton () {
            // 仅创建人且有冲突列表显示
            return this.$userInfo.oid === this.conflictStaff.creatorId && this.conflictList.length && this.$proms.isMobile
        }
    },
    created () {
        // 仅在作为独立页面展示时，设置title和popup
        if (!this.maskStyle) {
            this.setHeaderBar()
        }
        this.getConflictList()
    },
    methods: {
        setHeaderBar () {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {'title': '时间冲突'})
                    setTimeout(() => {
                        XuntongJSBridge.call('closePop')
                    }, 100)
                    XuntongJSBridge.call('defback', {}, () => {
                        XuntongJSBridge.call('closeWebView')
                    })
                },
                webCb: lappmask => {
                    lappmask.resetTitle('时间冲突')
                    lappmask.removeCreatePop()
                }
            })
        },
        getConflictList () {
            const {startDate, endDate} = this.taskDateTime || this.$common.urlParams
            const meetingId = this.meetingId || this.$common.urlParams.meetingId
            const params = {
                startDate: Number(startDate),
                endDate: Number(endDate),
                oid: this.conflictStaff.id
            }

            if (meetingId && meetingId !== 'undefined') {
                params.meetingId = meetingId
            }
            fetchConflictList(params).then(resp => {
                this.isDefault = false
                if (resp.success === true) {
                    this.conflictList = resp.data
                } else {
                    throw new Error(resp.errorCode)
                }
            }).catch(e => {
                console.log(e)
            })
        },
        renderText (type) {
            return type === 'meeting' ? '有一场会议' : '有一项协作'
        },
        toContact () {
            // Qing 0.9.70版本以下提示升级
            if (this.$proms.belowWhichVersion('0.9.70') && /iPhone|iPad/g.test(navigator.userAgent)) {
                this.showOldVersionTip()
                return
            }

            this.close && this.close()

            XuntongJSBridge.call('chat', {
                openId: this.conflictStaff.id
            }, function (result) {
                console.log(result)
            })
            // this.sendIMessage()
        },
        showOldVersionTip () {
            this.$tip.show({
                message: '请升级到最新版的云之家～'
            })
        },
        sendIMessage () {
            const data = {
                content: '有个会议需要沟通下时间',
                toUserId: this.conflictStaff.id,
                msgType: 7,
                param: {
                    appId: env.appId,
                    lightAppId: env.appId,
                    appName: '时间助手',
                    title: '协作时间冲突',
                    content: '当前的协作与现有的安排存在时间冲突，我们沟通下',
                    webpageUrl: this.spliceConflictUrl()
                }
            }

            xtsend(data)
        },
        spliceConflictUrl () {
            const {
                startDate,
                endDate
            } = this.taskDateTime || this.$common.urlParams
            const {
                id,
                name,
                img,
                creatorId
            } = this.conflictStaff
            const meetingId = this.meetingId || this.$common.urlParams.meetingId
            const {fullPath} = this.$route
            const serverRoot = this.$common.env !== 'localhost' ? location.href.replace(new RegExp(`${fullPath}([/?].+)?`), '') : `http://${location.host}`

            return `${serverRoot}?page=conflict&staffId=${id}&staffName=${encodeURIComponent(name)}&img=${encodeURIComponent(img)}
                    &startDate=${startDate}&endDate=${endDate}&meetingId=${meetingId}&creator=${creatorId}`
        },

        /**
         * @formatDate 格式化时间，同一天仅显示时间段，否则显示完整日期
         * @param {number}startDate 开始时间
         * @param {number}endDate 结束时间
         * @param {boolean}fullShow 是否展示完整日期(不包括年)
         * @return {string}格式化后的时间段
         */
        formatDate (startDate, endDate, fullShow = false) {
            const zeroTime = time => time < 10 ? `0${time}` : time

            const start = new Date(startDate)
            const end = new Date(endDate)
            const startTime = `${zeroTime(start.getHours())}:${zeroTime(start.getMinutes())}`
            const endTime = `${zeroTime(end.getHours())}:${zeroTime(end.getMinutes())}`

            if (start.setHours(0, 0, 0, 0) === end.setHours(0, 0, 0, 0) && !fullShow) {
                return `${startTime} — ${endTime}`
            } else {
                return `${start.getMonth() + 1}月${start.getDate()}日${startTime} — ${end.getMonth() + 1}月${end.getDate()}日${endTime}`
            }
        },
        setTouchStartPoint (e) {
            if (!this.maskStyle) return
            this.startY = e.changedTouches[0].pageY
        },

        // 防止移动端有不兼容禁止滚动
        forbidDetailScroll (e) {
            if (!this.maskStyle) return
            const conflictWrap = this.$refs.conflictWrap
            const clientH = conflictWrap.clientHeight
            const scrollH = conflictWrap.scrollHeight
            const scrollT = conflictWrap.scrollTop
            const touchY = e.changedTouches[0].pageY

            if (scrollT === 0 && touchY > this.startY) {
                e.preventDefault()
            }

            if (scrollT >= scrollH - clientH && touchY < this.startY) {
                e.preventDefault()
            }
        },
        beforeCloseMask () {
            this.beforeClose = true
            setTimeout(() => {
                this.close()
            }, 200)
        }
    }
}
</script>

<style lang="less" scoped>
.time-comflict {
    color: #1D1D1D;
    font-size: .14rem;
    width: 100%;
    min-height: 100%;
    top: 0;
    left: 0;
    background: #FFF;
    position: absolute;
    transition: all .2s;

    &.empty {
        background: #f6f7f8;
    }
}
.conflict-staff {
    margin: .4rem auto .3rem;
    text-align: center;

    .avatar {
        display: block;
        width: .56rem;
        height: .56rem;
        border-radius: 50%;
        margin: 0 auto .06rem;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
    }
}
.content {
    padding: 0 .3rem;

    .time-text {
        margin-bottom: .24rem;
        font-size: .15rem;

        .time {
            color: #4598F0;
            margin-left: .02rem;
        }
    }

    .conflict-item {
        margin-bottom: .32rem;
        display: flex;
        line-height: .2rem;
        align-items: center;

        &:last-child {
            margin-bottom: .8rem;
        }

        .icon {
            width: .28rem;
            height: .28rem;
            border-radius: 50%;
            background: #C2CCD0;
            margin-right: .13rem;
            color: #FFF;
            text-align: center;
            line-height: .3rem;

            .iconfont {
                font-size: .17rem;

                &.icon-meeting {
                    font-size: .16rem;
                }
            }
        }
    }
}
.wrap-button {
    width: 100%;
    height: .44rem;
    position: fixed;
    background: #fff;
    bottom: 0;
}
.contact {
    width: 100%;
    height: .44rem;
    line-height: .44rem;
    text-align: center;
    color: #FFF;
    position: fixed;
    bottom: 0;
    background: #4598F0;
    cursor: pointer;

    &:active {
        opacity: 0.5;
    }
}

.empty-conflict {
    position: absolute;
    top: 45%;
    left: 50%;
    width: 100%;
    text-align: center;
    transform: translate(-50%, -50%);

    .no-conflict-img {
        width: .8rem;
        height: .93rem;
        margin: 0 auto .12rem;
        background-image: url('../../assets/file_icon/no_conflict_schedule@2x.png');
        background-size: cover;
    }
}

.time-comflict.mask {
    background: transparent;
    overflow: hidden;
    z-index: 1;

    .mask-layer {
        background: rgba(14, 46, 70, 0.36);
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 2;
        animation: fade-toggle .2s;

        &.beforeClose {
            transition: all .2s;
            opacity: 0;
        }
    }

    .conflict-wrap {
        position: absolute;
        height: 3.81rem;
        width: 100%;
        bottom: 0;
        left: 0;
        z-index: 3;
        background: #FFF;
        overflow: auto;
        animation: slide-conflict .2s;

        .close {
            position: fixed;
            height: .3rem;
            width: 100%;
            background: #FFF;
        }

        .icon-close {
            float: right;
            margin: .11rem .16rem 0 0;
            color: #768893;
            cursor: pointer;

            &:active {
                opacity: 0.5;
            }
        }

        &.beforeClose {
            transition: all .2s;
            transform: transLateY(3.81rem);
        }
    }

    .conflict-staff {
        padding: 0 .3rem;
        text-align: left;
        margin: .31rem auto .15rem;

        .avatar, .name {
            vertical-align: middle;
        }

        .avatar {
            display: inline-block;
            width: .42rem;
            height: .42rem;
            margin: 0 .12rem 0 0;
        }
    }

    .content {
        .time-text {
            margin-bottom: .21rem;
        }
    }

    .conflict-item {
        margin-bottom: .29rem;

        &:last-child {
            margin-bottom: .77rem;
        }
    }

    @keyframes slide-conflict {
        from {
            transform: transLateY(3.81rem)
        }
        to {
            transform: transLateY(0)
        }
    }

    @keyframes fade-toggle {
        from {
            opacity: 0
        }
        to {
            opacity: 1
        }
    }
}
</style>
