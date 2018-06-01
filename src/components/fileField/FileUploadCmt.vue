
<template lang="pug">
    span.file-upload-icon(@click="close_Phiz")
        i.iconfont.icon-shangchuanwendang
            input(type="file" name="file" class="file-input" @click="selectFile" accept="*" multiple)
</template>
<script>
import Uploader from '@/components/fileField/Uploader'

export default Uploader.extend({
    methods: {
        close_Phiz () {
            console.log('????')
            this.$emit('closephiz')
        }
    }
})
</script>

<style lang="less" scoped>
.file-upload-icon {
    position: relative;
    overflow: hidden;
    // padding-left: .35rem;
    .icon-shangchuanwendang {
        font-size: .17rem;
        color: #768893;
        &:active {
            color: #4598F0;
        }
    }
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
</style>
