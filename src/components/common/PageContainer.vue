<template lang="pug">
    div(v-if="isOpen")
        slot
</template>
<script>
    export default {
        name: 'PageContainer',
        data () {
            return {
                isOpen: false,
                oldHash: null
            }
        },
        props: {
            value: {
                type: Boolean,
                required: true,
                default: false
            },
            hash: {
                type: String,
                required: false,
                default: 'pageContainer'
            }
        },
        watch: {
            value (val) {
                if (val) {
                    this.checkOpen()
                } else {
                    if (document.location.hash === `#${this.hash}`) {
                        window.history.back()
                    }
                    document.body.className = document.body.className.replace(' stopScroll', '')
                }
                this.isOpen = val
            }
        },
        methods: {
            checkOpen () {
                if (this.value) {
                    this.isOpen = true
                    document.body.className += ' stopScroll'
                    this.popstateManage()
                }
            },
            popstateManage () {
                // oldHash记录跳转前的哈希，没有则是undefined
                this.oldHash = window.location.hash || undefined
                window.history.pushState({hash: `#${this.hash}`}, `${this.hash}`, `#${this.hash}`)
                const callback = (e) => {
                    const stateHash = e.state && e.state.hash
                    if (stateHash === this.oldHash) {
                        this.$emit('input', false)
                        window.removeEventListener('popstate', callback)
                    }
                }
                window.addEventListener('popstate', callback)
            }
        },
        created () {
            this.checkOpen()
        }
    }
</script>
<style lang="less">
    body.stopScroll {
        overflow: hidden;
    }
</style>
