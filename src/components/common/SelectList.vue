/**
 * 点即操作选项模态框
 * @prop {array}selectList[{text, action, style}] 选项列表
 */
<template lang="pug">
    .select-wrap
        .mask(v-if="popUp"
            @click="close")
        transition(name="toggle")
            .select-list(v-if="popUp")
                span.title {{selectTitle}}
                ul.list
                    li(v-for="item in selectList"
                        :style="item.style"
                        @click="click(item)") {{item.text}}
        
</template>

<script>
    export default {
        props: {
            popUp: {
                type: Boolean,
                default: false
            },
            selectTitle: {
                type: String,
                default: ''
            },
            selectList: {
                type: Array,
                default: function () {
                    return []
                }
            }
        },
        methods: {
            click (item) {
                item.action && item.action()
                this.close()
            },
            close () {
                this.$emit('close')
            }
        }
    }
</script>

<style lang="less" scoped>
.toggle-enter-active, .toggle-leave-active {
    transition: transform .1s ease-out;
}
.toggle-enter, .toggle-leave-to {
    transform: translateY(100%);
}
.select-wrap {
    .mask {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: rgba(14, 46, 70, .36);
    }
    .select-list {
        position: fixed;
        bottom: 0;
        width: 100%;
        line-height: .5rem;
        z-index: 1;
        
        .list {
            text-align: center;
            color: #030303;
            li {
                background: #fff;
                &:not(:last-child) {
                    margin-bottom: .03rem;
                    border-bottom: 1px solid #EAEFF3;
                }
            }
        }
    }
}
</style>
