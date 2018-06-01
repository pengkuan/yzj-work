<!-- create by shuiling_wu -->
<template lang="pug">
    transition(name="toggle")
        .remind-time(v-if="visible")
                .time-list(v-for="(item, index) in repeatMap"
                    @click.stop="choose(item)"
                    :key="item.value"
                    :class="[{'noremind': index === 0}, {'selected': item.value === repeatObj.repeatFlag}, {'disabled': item.disable === true}]") {{item.title}}
                .remind-tips 重复时间不可小于当前选取的时间段
</template>
<script>
export default {
    data () {
        return {
            mapValue: [],
            visible: true
        }
    },
    props: {
        repeatObj: {
            default: {
                repeatFlag: 1,
                repeatTitle: '永不'
            }
        },
        repeatFlag: {
            type: Number,
            default: 1
        }
    },
    created () {
        // 重复弹窗的选择列表 @shuiling_wu
        this.mapValue = [
            { 'title': '永不', 'value': 1 },
            { 'title': '每天', 'value': 2 },
            { 'title': '每周', 'value': 3 },
            { 'title': '每两周', 'value': 4 },
            { 'title': '每月', 'value': 5 }
        ]
    },
    methods: {
        choose (obj) {
            if (obj.disable) return
            this.visible = false
            this.$emit('choose', obj)
        }
    },
    computed: {
        repeatMap () {
            let arr = []
            let that = this
            console.log(that.repeatFlag)
            this.mapValue.map((item, index) => {
                arr[index] = Object.assign(
                    (that.repeatFlag >= index ? {'disable': false} : {'disable': true}), item)
            })
            return arr
        }
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
    .remind-time {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 2;
        background: #F8F9FB;
        .time-list {
            position: relative;
            height: .48rem;
            line-height: .48rem;
            padding-left: .16rem;
            color: #1D1D1D;
            font-size: .16rem;
            background: #fff;
            &::before {
                content: "";
                display: block;
                position: absolute;
                bottom: 0;
                left: .12rem;
                width: 100%;
                height: 1px;
                background: -webkit-linear-gradient(bottom,#EEEFF5,#EEEFF5 50%,transparent 0); 
                background-size: 100% 1px;
                background-repeat: no-repeat;
                background-position: 0 100%;
            }
            &:last-of-type {
                &::before {
                    content: "";
                    display: none;
                }
            }
        }
        .noremind {
            margin-bottom: .08rem;
            &::before {
                content: "";
                display: none;
            }
        }
        .selected {
            color: #46C7FF;
            &::after {
                content: "";
                position: absolute;
                top: .2rem;
                right: .18rem;
                height: .09rem;
                width: .13rem;
                background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAANCAYAAACpUE5eAAAArElEQVQ4T63SsQ3CMBAF0H+wEC1JQ5UaJgA2yCYZgWyAKBMaqtQslHx0hREO9tlS4u4s3bN19wUrnaLnZRrxkjW8smMrgjOJx2LQYfqxkTgtAn+xCbgOlbQeWPTcDZW8c8YQwrTvC5ZP1kI07iULjWEeuO943AruemmhFuaBWujqN8AthqawP9BCc7AgGEKFOGjOUuOIgnPULShnYWYOUzMNJSEZbM2mNubm8wN9lGoAFOlDTAAAAABJRU5ErkJggg==) no-repeat;
                background-size: cover;
            }
        }
        .disabled {
            color: #a4a8ab;
        }
        .remind-tips {
            margin-top: .24rem;
            text-align: center;
            line-height: 1;
            font-size: .12rem;
            color: #768893;
        }
    }
</style>
