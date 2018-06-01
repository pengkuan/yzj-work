<template lang="pug">
    .work-voice(v-if="$proms.isMobile")
        span.yuyin-bg(@click="voiceInput")
            i.iconfont.icon-yuyinshuru1
</template>
<script>
export default {
    name: 'VoiceToText',
    props: {},
    data () {
        return {}
    },
    methods: {
        // 语音录入
        voiceInput () {
            this.$common.datalyEvent({
                event: '语音录入点击'
            })
            XuntongJSBridge.call('voiceRecognize', {}, response => {
                this.$emit('voiceToText', response.data.text)
            })
        }
    }
}
</script>
<style lang="less" scoped>
.work-voice{
    width:100%; 
    height:1.24rem;
    background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.88),rgba(255,255,255,1));
    text-align: center;
    display:flex;
    justify-content:center;
    .yuyin-bg{
        display:inline-block;
        width:.7rem;
        height:.7rem; 
        margin-top:.1rem;
        color:#fff;
        line-height:.7rem;
        border-radius:.35rem;
        background:rgba(63,183,223,1);
        box-shadow: 0px 2px 5px 0px rgba(69,184,225,0.42);
        &:active{
            opacity: .5;
        }
    }
    .icon-yuyinshuru1{
        font-size:.26rem;
    }
}
</style>

