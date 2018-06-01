
<template lang="pug">
    transition(name="toggle")
        .file-list-wrap
            .file-list(v-if="visible")
                file-item(v-for="item in fileList"
                    class="detail-file-list"
                    :file-info="item"
                    :canDel="false")
                .gap
</template>
<script>
import FileItem from '@/components/fileField/FileItem'
export default {
    data () {
        return {
            visible: true
        }
    },
    props: {
        fileList: {
            type: Array,
            default () {
                return []
            }
        }
    },
    watch: {
    },
    components: {
        FileItem
    }
}
</script>

<style lang="less" scoped>
.toggle-enter-active, .toggle-leave-active {
    transition: transform .2s ease-out;
}
.toggle-enter, .toggle-leave-to {
    transform: translateX(100%);
}
.file-list-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
    overflow: hidden;
    background: #fff;
    .file-list {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        padding: .15rem .16rem;
        background: #fff;
        &::-webkit-scrollbar {
            display:none
        }
        .detail-file-list {
            margin-top: .12rem;
        }
        .gap {
            height: .4rem;
        }
    }
}
</style>
