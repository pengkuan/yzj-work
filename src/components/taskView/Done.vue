<template lang="pug">
    .done-work
        .filter-bar
            span 已完成
        ul.work-list.done-list
            mission(
                v-for= "(work, index) in list"
                v-if= "!work.isDel"
                :key="work.id"
                :work= "setWork(work)"
                :type="type"
                :class= "[{fadeout: work.remove},{fadeIn: work.isAdd}]")
</template>

<script>
import Mission from './Mission'

export default {
    props: {
        list: {
            type: Array,
            default: []
        },
        type: {
            type: String,
            default: 'schedule'
        }
    },
    methods: {
        setWork (work) {
            work.isPlan = false
            return work
        },
        toStr (val) {
            return `[-${val}-]`
        }
    },
    components: {
        Mission
    }
}
</script>

<style lang="less" rel="stylesheet/less">
.filter-bar{
    background: #fff;
    line-height: .48rem;
    overflow: hidden;
    padding:0 .16rem;
    // margin-top: .08rem;
    border-top: .08rem solid #F8F9FB;
    font-weight: bold;

    span:nth-child(1),
    .filter-select{
        color:#1D1D1D;
        font-size: .16rem;
    }

    .filter{
        float: right;
    }
    .filter-all,
    .filter-select{
        display: inline-block;
        line-height: .15rem;
    }
    .filter-all{
        border-left: 1px solid  #A4A8AB;
        padding-left:.05rem;
        margin-left:.05rem;
    }
}

.done-list{
    color: #A4A8AB !important;
    .iconfont{
        color: #A4A8AB !important;
    }
    .work-type{
        color: #A4A8AB !important;
        border-color:#A4A8AB !important;
    }

    .work-deadline{
        color: #A4A8AB !important;
    }
    .work-creater{
        color: #A4A8AB !important;
    }
}
</style>
