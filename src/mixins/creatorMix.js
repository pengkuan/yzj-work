export default {
    data () {
        return {
            isSending: false
        }
    },
    methods: {
        sending () {
            if (!this.isSending) {
                this.isSending = true

                let timer = setTimeout(() => {
                    this.isSending = false
                    clearTimeout(timer)
                }, 1500)
            } else {
                this.$tip.show({
                    message: '正在保存'
                })
            }
            return this.isSending
        },

        /**
         * @param {string} text 输入的内容
         * @return {boolean} true/false
         */
        isEmptyText (text = '') {
            if (!text.trim()) {
                this.$tip.show({
                    message: '内容不能为空'
                })
                return true
            }
            return false
        }
    }
}
