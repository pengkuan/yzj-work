
const rootElement = document.documentElement || document.body

export default {
    data () {
        return {
            scrollEle: rootElement,
            distance: 20,
            timer: null,
            delay: 10,
            isLoading: false,
            isComplete: false,
            isError: false
        }
    },
    mounted () {
        this.scrollEle = typeof this.scrollEle === 'string' ? document.querySelector(this.scrollEle) : this.scrollEle
        document.addEventListener('scroll', this.handleScroll)
    },
    methods: {
        handleScroll () {
            if (this.timer) {
                clearTimeout(this.timer)
            }
            this.timer = setTimeout(() => {
                const currentDistance = this.getCurrentDistance()
                if (currentDistance <= this.distance) {
                    if (this.isLoading === true || this.isComplete === true) {
                        return
                    }
                    this.isLoading = true
                    this.getMoreDate && this.getMoreDate()
                }
            }, this.delay)
        },
        getCurrentDistance () {
            let _scrollTop = this.scrollEle === (rootElement) ? document.body.scrollTop || document.documentElement.scrollTop
                : this.scrollEle.offsetTop + Math.abs(this.scrollEle.getBoundingClientRect().top)
            let _clientHeight = document.documentElement.clientHeight
            let _scrollHeight = document.documentElement.scrollHeight
            if (_clientHeight === _scrollHeight) {
                return this.distance + 100
            }
            return _scrollHeight - (_scrollTop + _clientHeight)
        },
        throttle (fn, delay) {
            let timer = null
            return function () {
                clearTimeout(timer)
                timer = setTimeout(() => {
                    fn()
                }, delay)
            }
        }
    },
    beforeDestroy () {
        document.removeEventListener('scroll', this.handleScroll, false)
    }
}
