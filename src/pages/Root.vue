<template lang="pug">
    .wrapper
        router-view
</template>

<script>
import router from '@/router'
import store from '@/vuex'
import { mapActions } from 'vuex'
export default {
    data () {
        return {
            $showDone: false
        }
    },
    router,
    store,
    name: 'root',
    methods: {
        ...mapActions(['setCurrentWork'])
    },
    created () {
        // 适配iPhone X
        this.$proms.compEnd.call(this, {
            mobileCb: () => {
                window.XuntongJSBridge.call('setWebBottomInset', {
                    show: true
                })
            }
        })
    }
}
</script>

<style lang="less" rel="stylesheet/less">
    @import "../css/common";
</style>
