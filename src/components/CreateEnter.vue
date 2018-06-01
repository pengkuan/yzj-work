<template lang="pug">
    .create-container
        transition(name="mask-slide-fade")
            .create-mask(
                v-if="isShowItem"
                @click="showItems")
        .create-enter
            .create-btn(@click="showItems"
                :class=`[
                    {'btn-shrink': isShowItem,
                    rotate: isShowItem}
                ]`
            )
                i.iconfont.icon-tianjiagongzuo(:class="{'btn-rotate': isShowItem}")
            transition(name="popup-fade")
                ul.create-popup(v-if="isShowItem")
                    li.create-item.create-event(
                        @click="createEvent")
                        span.create-text 记事
                        span.create-icon
                            i.icon.iconfont.icon-task
                    li.create-item.create-conference(
                        @click="createConf") 
                        span.create-text 会议
                        span.create-icon
                            i.icon.iconfont.icon-meeting
                    li.create-item.create-schedule(@click="createSchedule")
                        span.create-text 日程
                        span.create-icon
                            i.icon.iconfont.icon-schedule
</template>

<script>
import {mapActions} from 'vuex'

export default {
    name: 'Index',
    data () {
        return {
            isShowItem: false
        }
    },
    methods: {
        ...mapActions(['setCurrentWork',
            'setPlanList',
            'setDoneList',
            'setCoWorkers',
            'setWorkDate']),
        showItems () {
            this.$common.datalyEvent({ event: '点击新建按钮' })
            this.isShowItem = !this.isShowItem
        },
        createSchedule () {
            this.$common.datalyEvent({ event: '点击新建日程按钮' })
            this.setCurrentWork({})
            this.setWorkDate({})
            this.setCoWorkers({
                source: 'editor',
                type: 'schedule',
                staffList: []
            })
            this.$router.push({ name: 'Editor' })
        },
        createConf (e) {
            this.setCoWorkers({source:
                'editor',
                type: 'meeting',
                staffList: []})
            this.$common.datalyEvent({ event: '点击新建会议按钮' })
            this.setWorkDate({})
            this.setCurrentWork({})
            this.$router.push({ name: 'Creator' })
        },
        createEvent () {
            this.$common.datalyEvent({ event: '点击记事日程按钮' })
            this.setWorkDate({})
            this.setCurrentWork({})
            this.$router.push({ name: 'Event' })
        }
    }
}
</script>

<style lang="less" rel="stylesheet/less">
.create-mask{
    position: fixed;
    width:100%;
    height: 100%;
    border-radius: 50%;
    background:rgba(255, 255, 255, .9);
    z-index: 1000;
    transform: scale(3, 3);
}

.mask-slide-fade-enter-active{
    animation: create-mask .1s;
}

.mask-slide-fade-leave-active{
    animation: create-mask .1s reverse;
}

.create-enter{
    position: fixed;
    bottom:.44rem;
    right:.24rem;
    z-index:2000;
}
.create-btn {
    // background: linear-gradient(139.9deg,rgba(69,180,255,1),rgba(62,137,252,1));
    // box-shadow: 0px 2px 2px 0px rgba(134,141,147,0.36);
    background: linear-gradient(to bottom right, #3C95FF, #3C4DFF) #3C95FF;
    width: .54rem;
    height: .54rem;
    border-radius: 50%;
    box-shadow: 4px 4px 10px rgba(16, 117, 173, .2);
    transition: background .1s, transform .1s;
    cursor: pointer;
    &.rotate{
        background: #C2CCD0;
        box-shadow: none;
    }
    .iconfont{
        color:#fff;
        position: absolute;
        left:50%;
        top:50%;
        transform: translate(-50%, -50%);
        font-size: .24rem;
    }
    &.btn-shrink {
        transform: scale(0.75, 0.75) rotate(45deg);
    }
}

.create-popup{
    position: absolute;
    bottom: .54rem;
    right: 0;
    transform-origin: 63% 100%;
    .create-item{
        display: flex;
        display: -webkit-box;
        margin-bottom: .24rem;
        span{
            display: block;
            -webkit-box-flex: 1;
            flex:1;
        }
    }
    .create-text{
        padding-top: .18rem;
        width:.3rem;
        font-size: .14rem;
        color:#889AA4;
        margin-right:.1rem;
    }
    .create-icon{
        width: .54rem;
        height: .54rem;
        border-radius: 50%;
        color:#fff;
        position: relative;
        transition: all 2s;
        cursor: pointer;
        &:active{
            opacity: .5;
        }
        .icon{
            position: absolute;
            width: .27rem;
            height: .27rem;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size:.27rem;
        }
        .icon-task {
            width: .26rem;
            height: .26rem;
            font-size: .26rem;
        }
        .icon-meeting {
            width: .24rem;
            height: .24rem;
            font-size: .24rem;
        }
    }
    .create-event{
        .create-icon{
            background:rgba(63,183,223,1);
            box-shadow: 0px 2px 4px 0px rgba(69,184,225,0.42);
        }
    }
    .create-schedule{
        .create-icon{
            background:rgba(69,152,240,1);
            box-shadow: 0px 2px 4px 0px rgba(69,152,240,0.42);
        }
    }
    .create-conference{
        .create-icon{
            background:rgba(69,112,211,1);
            box-shadow: 0px 2px 4px 0px rgba(68,112,211,0.42);
        }
    }
}

.popup-fade-enter-active {
    animation: create-popup .1s;
}

.popup-fade-leave-active {
    animation: create-popup-out .1s;
}

@keyframes bin-shrink {
    0% {
    }
    100% {
        background:rgba(194,204,208,1);
        box-shadow: 0px 3px 8px 0px rgba(134,143,147,0.42);
        width: .41rem;
        height: .41rem;
    }
}

@keyframes btn-rotate {
    0%{
        transform: rotate(0);
    }
    100%{
        transform: rotate(45deg);
    }
}

@keyframes create-mask {
    from {
        transform: scale(1, 1) translate(100%, 80%);
        opacity: 0;
    }
    to {
        transform: scale(3, 3) translate(-10%, -3%);
        opacity: 1;
    }
}

@keyframes create-popup {
    0% {
        opacity: 0;
        transform: scale(0, 0) translate(.12rem, .74rem);
    }
    100% {
        opacity: 1;
        transform: scale(1, 1) translate(0, 0);
    }
}

@keyframes create-popup-out {
    from {
        opacity: 1;
        transform: scale(1, 1);
        transform-origin: 70% 100%;
    }
    to {
        opacity: 0;
        transform: scale(0.3, 0.3);
        transform-origin: 70% 100%;
    }
}
 
</style>
