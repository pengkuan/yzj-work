
<template lang="pug">
    .work-schedule#taskList
        ul.work-list.plan-list(v-if="!isEmpty")
            Mission(
                v-for= "(work, index) in unDoneWorkList"
                :key="work.id"
                :work="setWork(work)"
                :isPlan="isPlan"
                :class= `[{fadeout: work.remove},
                        {fadeIn: work.isAdd},
                        {anim: work.anim}]`
                @panleft="onPanleft"
                @doneTask="completeWork"
                @delTask="deleteWork")
        Done(v-if="doneWorkList.length && !isEmpty"
            :list="doneWorkList")
        .empty-list(v-if="isEmpty")
                i
                    img(:src="imgs.empty")
                span(v-if="!$proms.isDesktop") {{defaultTxt}}
        .load-more(v-if="!isEmpty && doneWorkList.length > limit - 1")
            span(v-if="isLoading") 加载中...
            span(v-if="isComplete") 已加载完
            span(v-if="isError") 加载失败
</template>

<script>
import { getWorkList } from '@/api/sendRequest'
import Mission from './Mission'
import Done from './Done'
import loadMore from '@/components/taskView/loadMore'
import { mapActions } from 'vuex'
import { delWorkData, addWorkData } from '@/utils/work-odds'

export default {
    mixins: [loadMore],
    data () {
        return {
            animWork: null,
            isPlan: true,
            pageIndex: 1,
            limit: 20,
            unDoneWorkList: [],
            doneWorkList: [],
            scrollEle: '#taskList',
            imgs: {
                empty: require('@/assets/empty.png')
            },
            defaultTxt: '加载中 ~'
        }
    },
    created () {
        getWorkList({type: 'task', pageNo: this.pageIndex, limit: this.limit}).then((resp) => {
            if (resp.success) {
                this.doneWorkList = resp.data.doneWorkList || []
                this.unDoneWorkList = resp.data.unDoneWorkList || []
                this.setUndoWorkLen(this.unDoneWorkList.length)
                this.pageIndex++
                this.defaultTxt = '暂无日程 ~'
            }
        })
    },
    computed: {
        isEmpty () {
            return this.doneWorkList.length === 0 && this.unDoneWorkList.length === 0
        }
    },
    methods: {
        ...mapActions(['setUndoWorkLen']),
        setWork (work) {
            work.isPlan = true
            return work
        },
        onPanleft (work) {
            this.animWork = work
        },
        completeWork (work) {
            delWorkData(this.unDoneWorkList, work, 300)
            addWorkData(this.doneWorkList, work, 310)
        },
        deleteWork (work) {
            delWorkData(this.unDoneWorkList, work, 300)
        },
        getMoreDate () {
            getWorkList({type: 'task', pageNo: this.pageIndex, limit: this.limit}).then((resp) => {
                if (resp.success) {
                    if (!resp.data.doneWorkList || (resp.data.doneWorkList && resp.data.doneWorkList.length < this.limit)) {
                        this.isComplete = true
                    }
                    this.isError = false
                    this.isLoading = false
                    this.doneWorkList = [...this.doneWorkList, ...resp.data.doneWorkList]
                    this.pageIndex++
                } else {
                    this.isLoading = false
                    this.isError = true
                }
            }, () => {
                this.isLoading = false
                this.isError = true
            })
        }
    },
    components: {
        Mission,
        Done
    }
}
</script>

<style lang="less" scoped>
.load-more {
    height: .4rem;
    width: 100%;
    line-height: .4rem;
    text-align: center;
    color: #B3B7B9;
    font-size: .14rem;
}
</style>
