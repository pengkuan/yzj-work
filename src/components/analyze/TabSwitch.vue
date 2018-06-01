<template lang="pug">
    ul
        template(v-for="(tab, index) of tablist")
            li.item(@click="handleTabClicked(tab.value)" :class="{active: currentTab === tab.value}")
                span {{tab.text}}
            span.splitLine(v-if="index + 1 !== tablist.length")
</template>

<script>
    export default {
        name: 'TabSwitch',
        props: {
            tablist: {
                type: Array,
                default: () => []
            },
            currentTab: String
        },
        methods: {
            handleTabClicked (tab) {
                this.$emit('tabclicked', tab)
            }
        }
    }
</script>

<style lang="less" scoped>
ul {
    height: .45rem;
    line-height: .45rem;
    display: flex;
    text-align: center;
    font-size: .16rem;
    border-bottom: .01rem solid #EEEFF5;
    color: #768893;
    background: #FFF;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;

    .item {
        float: left;
        flex: 1;
        cursor: pointer;

        span {
            display: inline-block;
            height: .44rem;
        }

        &.active span{
            color: #4598F0;
            font-weight: bold;
            border-bottom: .03rem solid #4598F0;
        }

        &:active {
            opacity: 0.5;
        }
    }

    .splitLine {
        width: .01rem;
        height: .16rem;
        background: #DCE1E8;
        margin-top: .14rem;
    }
}
</style>
