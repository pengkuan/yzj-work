<template lang="pug">
    .popup(v-show="show" :class="className ? className : ''" @click.stop="" @touchmove.stop="")
        .popup-wrap(ref="popupWrap")
            h4.popup-title(v-if="title.show" style="padding:.16rem 0 !important;") {{title.content}}
                slot(name="title")
            .popup-content
                slot(name="content") 请输入内容
</template>

<script>
export default {
    data: function () {
        return {
            level: 1
        }
    },
    props: {
        show: {
            type: Boolean,
            default: true
        },
        className: {
            type: String,
            default: ''
        },
        title: {
            type: Object,
            default: function () {
                return {
                    show: true,
                    content: '标题'
                }
            }
        }
    },
    methods: {
        remove () {
            this.show = false
        }
    }
}
</script>

<style lang="less" rel="stylesheet/less" scoped>
    .popup{
        position:fixed;
        width:100%;
        height:100%;
        left:0;
        top:0;
        bottom:0;
        right: 0;
        background: rgba(14,46,71,0.36);
        z-index:1000;
    }
    .popup-wrap{
        position: absolute;
        left:50%;
        top:50%;
        transform:translate(-50%, -80%);
        background:#fff;
        border-radius:6px;
    }
    .popup-title{
        font-size: .16rem;
        font-weight: normal;
        border-top-right-radius:4px;
        border-top-left-radius:4px;
    }
</style>
