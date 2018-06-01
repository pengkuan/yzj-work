
<template lang="pug">
    .work-schedule#meetingList
        ul.work-list.plan-list(v-if="!isEmpty")
            Mission(
                v-for= "(work, index) in unDoneMeetingList"
                :key="work.id"
                :work="setWork(work)"
                :isPlan="isPlan"
                type="meeting"
                :class= `[{fadeout: work.remove},
                        {fadeIn: work.isAdd},
                        {anim: work.anim}]`
                @panleft="onPanleft"
                @doneTask="deleteWork")
        Done(v-if="doneMeetingList.length && !isEmpty"
            type="meeting"
            :list="doneMeetingList")
        .empty-list(v-if="isEmpty")
                i
                    img(:src="imgs.empty")
                span(v-if="!$proms.isDesktop") {{defaultTxt}}
        .load-more(v-if="!isEmpty && doneMeetingList.length > limit - 1")
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
            unDoneMeetingList: [],
            doneMeetingList: [],
            scrollEle: '#meetingList',
            imgs: {
                empty: require('@/assets/empty.png')
            },
            defaultTxt: '加载中 ~'
        }
    },
    created () {
        getWorkList({type: 'meeting', pageNo: this.pageIndex, limit: this.limit}).then((resp) => {
            if (resp.success) {
                this.doneMeetingList = resp.data.doneMeetingList || []
                this.unDoneMeetingList = resp.data.unDoneMeetingList || []
                this.setUndoMeetingLen(this.unDoneMeetingList.length)
                this.pageIndex++
                this.defaultTxt = '暂无会议 ~'
            }
        })
    },
    computed: {
        isEmpty () {
            return this.doneMeetingList.length === 0 && this.unDoneMeetingList.length === 0
        }
    },
    methods: {
        ...mapActions(['setUndoMeetingLen']),
        setWork (work) {
            work.isPlan = true
            return work
        },
        onPanleft (work) {
            this.animWork = work
        },
        // 取消会议 放到完成列表
        deleteWork (work) {
            delWorkData(this.unDoneMeetingList, work, 300)
            addWorkData(this.doneMeetingList, work, 310)
        },
        getMoreDate () {
            getWorkList({type: 'meeting', pageNo: this.pageIndex, limit: this.limit}).then((resp) => {
                if (resp.success) {
                    if (!resp.data.doneMeetingList || (resp.data.doneMeetingList && resp.data.doneMeetingList.length < this.limit)) {
                        this.isComplete = true
                    }
                    this.isError = false
                    this.isLoading = false
                    this.doneMeetingList = [...this.doneMeetingList, ...resp.data.doneMeetingList]
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
