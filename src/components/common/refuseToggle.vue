
<template lang="pug">
    .refuse-warp
        .mask(v-if="popUp"
            @click="cancel")
        transition(name="toggle")
            .refuse-toggle(v-if="popUp")
                .header
                    button.cancel-btn(@click="cancel") 取消
                    //- button.confirm-btn(@click="refuse") 确定
                ul.refuse-list
                    li(v-for="item in list"
                        :class="{'selected': item === refuseValue}"
                        @click="select(item)") {{item}}
</template>
<script>
import { meetingMap, scheduleMap, mapToReply } from '@/common/refuseTxt'
export default {
    data () {
        return {
            list: [],
            refuseValue: ''
        }
    },
    props: {
        popUp: {
            type: Boolean,
            default: false
        },
        type: {
            type: Number,
            default: 1 // 1 日程 2 会议
        }
    },
    created () {
        this.list = this.type === 1 ? scheduleMap : meetingMap
    },
    methods: {
        select (item) {
            this.refuseValue = item
            this.$emit('cancelRefuse')
            if (item === mapToReply) {
                this.$emit('refuse', 0)
                return
            }
            this.$emit('refuse', 1, this.refuseValue)
        },
        refuse () {
            if (this.refuseValue === '') {
                this.$tip.show({
                    message: '请选择'
                })
                return
            }
            this.$emit('cancelRefuse')
            this.$emit('refuse', 1, this.refuseValue)
        },
        cancel () {
            this.refuseValue = ''
            this.$emit('cancelRefuse')
        }
    }
}
</script>

<style lang="less" scoped>
.toggle-enter-active, .toggle-leave-active {
    transition: transform .2s ease-out;
}
.toggle-enter, .toggle-leave-to {
    transform: translateY(100%);
}
.refuse-warp {
    .mask {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background: rgba(14, 46, 70, .36);
    }
    .refuse-toggle {
        position: fixed;
        width: 100%;
        bottom: 0;
        background: #fff;
        .header {
            height: .41rem;
            display: flex;
            line-height: .41rem;
            background: #F8F9FB;
            button {
                color: #272727;
                padding: 0 .16rem;
                font-size: .16rem;
                background: #F8F9FB;
                cursor: inherit;
            }
            .confirm-btn {
                flex: 1;
                text-align: right;
                color: #46C7FF;
            }
        }
        .refuse-list {
            li {
                position: relative;
                height: .48rem;
                margin-left: .16rem;
                line-height: .48rem;
                font-size: .16rem;
                color: #030303;
                &:not(:last-child) {
                    border-bottom: 1px solid #EAEFF3;
                }
            }
            .selected {
                &::after {
                    content: "";
                    position: absolute;
                    top: .2rem;
                    right: .18rem;
                    height: .09rem;
                    width: .13rem;
                    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAaCAYAAAA0R0VGAAABQElEQVRYR83Wu20CQRAG4H/Al7sDKMGhDUiGAJHSAS7BdAAVYHdgKjAZOgggIYcOXAKS5ZRBe+YI0C77GmnvwtPdzqed2ZklVPihKtmel9x8qGGmTCfCtDK41oqfasAGwKPCMeOnErhbWJnN5DgT7AR8JsWZYMyY7wb0lgxng6nUJsG5wJLgXGFGnOo3WR2N3wyHfY+OUr3QB6bFveQ8rBO+i14D7P8y9CSAvjAtrrPiLYDXcrckgCEwLa695nfi/xEiAQyFGWuunfMXEUaxwBjY3dMaC4yFWVtJKFACZsWpD3yBUjAnnA9QEuaMcwFKw7xw94BEGIOLxl1cFK8t6HK7CJ0w3oNfV4O64OW1JxTmvXNlIBtQAhaMM6VYvZeCReF0QElYNE4t0Ml5AkKXCYtdnz5iauz2X+8DIRncttYZpMjvh9DiUmAAAAAASUVORK5CYII=) no-repeat;
                    background-size: cover;
                }
            }
        }
    }
}
</style>

