
<template lang="pug">
    .work-schedule#recordList
        ul.work-list.record-list(v-if="!isEmpty")
            mission(
                v-for= "(work, index) in recordWorkList"
                :key="work.id"
                :work= "work"
                type="recordWork"
                :class= "[{fadeout: work.remove},{fadeIn: work.isAdd}]")
        .empty-list(v-if="isEmpty")
                i
                    img(:src="imgs.empty")
                span(v-if="!$proms.isDesktop") {{defaultTxt}}
        .load-more(v-if="!isEmpty && recordWorkList.length > limit - 1")
            span(v-if="isLoading") 加载中...
            span(v-if="isComplete") 已加载完
            span(v-if="isError") 加载失败
</template>

<script>
import { getWorkList } from '@/api/sendRequest'
import Mission from './Mission'
import Done from './Done'
import loadMore from '@/components/taskView/loadMore'
import { delWorkData } from '@/utils/work-odds'

export default {
    mixins: [loadMore],
    data () {
        return {
            animWork: null,
            isPlan: true,
            pageIndex: 1,
            limit: 20,
            recordWorkList: [],
            scrollEle: '#recordList',
            imgs: {
                empty: require('@/assets/empty.png')
            },
            defaultTxt: '加载中 ~'
        }
    },
    created () {
        getWorkList({type: 'recordWork', pageNo: this.pageIndex, limit: this.limit}).then((resp) => {
            if (resp.success) {
                this.recordWorkList = resp.data.recordWorkList || []
                this.pageIndex++
                this.defaultTxt = '暂无记事 ~'
            }
        })
    },
    computed: {
        isEmpty () {
            return this.recordWorkList.length === 0
        }
    },
    methods: {
        onPanleft (work) {
            this.animWork = work
        },
        deleteWork (work) {
            delWorkData(this.recordWorkList, work, 300)
        },
        getMoreDate () {
            getWorkList({type: 'recordWork', pageNo: this.pageIndex, limit: this.limit}).then((resp) => {
                if (resp.success) {
                    if (!resp.data.recordWorkList || (resp.data.recordWorkList && resp.data.recordWorkList.length < this.limit)) {
                        this.isComplete = true
                    }
                    this.isError = false
                    this.isLoading = false
                    this.recordWorkList = [...this.recordWorkList, ...resp.data.recordWorkList]
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

<style lang="less">
.load-more {
    height: .4rem;
    width: 100%;
    line-height: .4rem;
    text-align: center;
    color: #B3B7B9;
    font-size: .14rem;
}
.record-list {
    .work-deadline {
        color: #768893 !important;
    }
}
</style>
