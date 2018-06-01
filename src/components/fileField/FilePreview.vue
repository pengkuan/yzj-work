
<template lang="pug">
    .file-content(:class=`{'file-content-cmt': type === 2}`)
        file-item(v-for="item in fileList.slice(0,collapseLen)"
            class="detail-file-item"
            :file-info="item"
            :canDel="false")
        .rest-file(v-if="fileList.length > collapseLen"
            @click="viewFileList") 查看全部{{fileList.length}}个附件 
        page-container(v-model="showList" hash="fileList")
            FileList(:fileList="fileList")
</template>
<script>
import FileItem from '@/components/fileField/FileItem'
import FileList from '@/components/fileField/FileList'
import PageContainer from '@/components/common/PageContainer'

export default {
    data () {
        return {
            showList: false,
            collapseLen: this.type === 1 ? 3 : 1
        }
    },
    props: {
        fileList: {
            type: Array,
            default () {
                return []
            }
        },
        // 1 详情文件 2 评论文件
        type: {
            type: Number,
            default: 1
        }
    },
    watch: {
        showList () {
            if (this.showList === true) {
                this.$proms.compEnd.call(this, {
                    mobileCb: () => {
                        XuntongJSBridge.call('setWebViewTitle', {'title': '附件'})
                        XuntongJSBridge.call('closePop')
                    },
                    webCb: lappmask => {
                        lappmask.resetTitle('附件')
                        lappmask.removeCreatePop()
                    }
                })
            } else {
                this.$emit('recoverMenu')
            }
        }
    },
    methods: {
        viewFileList () {
            this.showList = true
        }
    },
    components: {
        FileItem,
        PageContainer,
        FileList
    }
}
</script>
<style lang="less" scoped>
.file-content {
    padding: .2rem .16rem 0;
    background: #fff;
    .detail-file-item {
        margin-top: .04rem;
    }
    .rest-file {
        margin-top: .09rem;
        font-size: .13rem;
        color: #889AA4;
    }
}
.file-content-cmt {
    width: 100%;
    padding: .12rem 0 0 0;
    background: #fff;
    .rest-file {
        font-size: .12rem;
        color: #4598F0 !important;
    }
}
</style>
