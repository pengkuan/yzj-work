
<template lang="pug">
    transition(name="toggle")
        .remind-time(v-if="visible")
                .time-list(v-for="(item, index) in remindMap"
                    @click.stop="choose(item)"
                    :key="item.minute"
                    :class="[{'noremind': index === 0}, {'selected': item.minute === remindMin}, {'disabled': item.disable === true}]") {{item.value}}
                .remind-tips 提醒时间不可超过当前时间
</template>
<script>
import { meetingMap, scheduleMap } from '@/common/remindList'
export default {
    data () {
        return {
            mapValue: [],
            visible: true
        }
    },
    props: {
        gapMin: {
            type: Number,
            default: 0
        },
        type: {
            type: Number,
            default: 1 // [0: 详情， 1: 日程， 2: 会议]
        },
        remindMin: {
            type: Number,
            default: 0
        }
    },
    created () {
        this.mapValue = this.type === 1 ? scheduleMap : meetingMap
        // console.log(this.remindMin)
    },
    methods: {
        choose (obj) {
            if (obj.disable) return
            this.visible = false
            this.$emit('choose', obj)
        }
    },
    computed: {
        remindMap () {
            let arr = []
            this.mapValue.map((item, index) => {
                arr[index] = Object.assign({}, item)
                if (item.minute > this.gapMin) {
                    arr[index] = Object.assign({}, item, {disable: true})
                }
            })
            return arr
        }
    }
}
</script>
<style lang="less" scoped>
    .toggle-enter-active, .toggle-leave-active {
        transition: transform .2s ease-out;
    }
    .toggle-enter, .toggle-leave-to {
        transform: translateX(100%);
    }
    .remind-time {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 2;
        background: #F8F9FB;
        .time-list {
            position: relative;
            height: .48rem;
            line-height: .48rem;
            padding-left: .16rem;
            color: #1D1D1D;
            font-size: .16rem;
            background: #fff;
            &::before {
                content: "";
                display: block;
                position: absolute;
                bottom: 0;
                left: .12rem;
                width: 100%;
                height: 1px;
                background: -webkit-linear-gradient(bottom,#EEEFF5,#EEEFF5 50%,transparent 0);
                background-size: 100% 1px;
                background-repeat: no-repeat;
                background-position: 0 100%;
            }
            &:last-of-type {
                &::before {
                    content: "";
                    display: none;
                }
            }
        }
        .noremind {
            margin-bottom: .08rem;
            &::before {
                content: "";
                display: none;
            }
        }
        .selected {
            color: #4598f0;
            &::after {
                content: "";
                position: absolute;
                top: .2rem;
                right: .18rem;
                height: .09rem;
                width: .14rem;
                background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAaCAYAAAA0R0VGAAABQElEQVRYR83Wu20CQRAG4H/Al7sDKMGhDUiGAJHSAS7BdAAVYHdgKjAZOgggIYcOXAKS5ZRBe+YI0C77GmnvwtPdzqed2ZklVPihKtmel9x8qGGmTCfCtDK41oqfasAGwKPCMeOnErhbWJnN5DgT7AR8JsWZYMyY7wb0lgxng6nUJsG5wJLgXGFGnOo3WR2N3wyHfY+OUr3QB6bFveQ8rBO+i14D7P8y9CSAvjAtrrPiLYDXcrckgCEwLa695nfi/xEiAQyFGWuunfMXEUaxwBjY3dMaC4yFWVtJKFACZsWpD3yBUjAnnA9QEuaMcwFKw7xw94BEGIOLxl1cFK8t6HK7CJ0w3oNfV4O64OW1JxTmvXNlIBtQAhaMM6VYvZeCReF0QElYNE4t0Ml5AkKXCYtdnz5iauz2X+8DIRncttYZpMjvh9DiUmAAAAAASUVORK5CYII=) no-repeat;
                background-size: cover;
            }
        }
        .disabled {
            color: #a4a8ab;
        }
        .remind-tips {
            margin-top: .24rem;
            text-align: center;
            line-height: 1;
            font-size: .12rem;
            color: #768893;
        }
    }
</style>

