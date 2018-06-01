
<template lang="pug">
    .file-field
        .file-title(v-if="type === 1")
            label.label 选择文件
            .file-num 已经添加{{fileList.length}}/10个
            .file-input.iconfont.icon-add-field
                input(type="file" name="file" class="file-input" @click="selectFile" accept="*" multiple)
        .file-num-cmt(v-if="type === 2 && fileList.length > 0") 已经添加{{fileList.length}}/10个附件
        .file-content(v-if="fileList.length > 0" :class="{'file-content-scroll': scrolly}")
            file-item(v-for="item in fileList"
                :file-info="item"
                @remove="removeFile")
</template>
<script>
import FileItem from '@/components/fileField/FileItem'
import Uploader from '@/components/fileField/Uploader'

export default Uploader.extend({
    props: {
        // 1 会议编辑 2 评论上传
        type: {
            type: Number,
            default: 1
        },
        scrolly: {
            type: Boolean,
            default: false
        }
    },
    components: {
        FileItem
    }
})
</script>

<style lang="less" scoped>
.file-field {
    margin: .08rem 0;
    // border-top: .08rem solid #F8F9FB;
    // border-bottom: .08rem solid #F8F9FB;
    padding-left: .16rem;
    background: #fff;
    .file-title {
        display: flex;
        height: .48rem;
        line-height: 1;
        align-items: center;
        .icon-add-field:active {
            opacity: .5;
        }
        .label {
            color: #1D1D1D;
            font-size: .16rem;
        }
        .file-num {
            flex: 1;
            padding-left: .1rem;
            color: #98A1A8;
            font-size: .13rem;
        }
        .file-input {
            position: relative;
            margin-right: .16rem;
            font-size: .22rem;
            color: #B9C7D2;
            input {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                overflow: hidden;
            }
        }
    }
    .file-content {
        margin: .12rem .12rem 0 0;
        padding-bottom: .12rem;
    }
    .file-content-scroll {
        height: 3.26rem;
        overflow-y: scroll;
        margin: 0;
        padding: 0 .12rem .8rem 0;
    }
    .file-num-cmt {
        margin: .09rem 0;
        color: #889AA4;
        font-size: .13rem;
    }
}
</style>
