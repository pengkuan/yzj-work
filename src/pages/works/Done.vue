<template lang="pug">
    .done-work
        .filter-bar(v-if="istaskview")
            span 已完成
            //- span.filter
            //-     i.filter-select.iconfont.icon-shaixuanqi
            //-     b.filter-all 全部
        ul.work-list.done-list(ref="list")
            mission(
                v-for= "(work, index) in list"
                v-if= "!work.isDel"
                :key="work"
                :work= "setWork(work)"
                :class= "[{fadeout: work.remove},{fadeIn: work.isAdd}]")
</template>

<script>
import Mission from './Mission'
import { mapActions, mapGetters } from 'vuex'

export default {
    data () {
        return {
        }
    },
    props: {
        // 是否是任务视图
        istaskview: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        ...mapGetters({
            doneWorks: 'doneWorks'
        }),
        list: function () {
            return this.doneWorks
        }
    },
    methods: {
        ...mapActions(['getDoneWorks']),
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
    background: #F8F9FB;
    line-height: .3rem;
    overflow: hidden;
    padding:0 .12rem;

    span:nth-child(1),
    .filter-select{
        color:#768893;
        font-size: .12rem;
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
