<template lang="pug">
.guidance(
    :class="directionClassName"
    :style="positionStyle"
) {{text}}
</template>

<script>
export default {
    name: 'guidance',

    props: {
        text: {
            type: String,
            required: true
        },

        direction: {
            type: String,
            required: true
        },

        top: {
            type: String
        },

        left: {
            type: String
        },

        bottom: {
            type: String
        },

        right: {
            type: String
        }
    },

    computed: {
        directionClassName () {
            return `direction-${this.direction}`
        },

        positionStyle () {
            const o = {}
            if (this.top) {
                o.top = `${this.top}rem`
            }
            if (this.left) {
                o.left = `${this.left}rem`
            }
            if (this.bottom) {
                o.bottom = `${this.bottom}rem`
            }
            if (this.right) {
                o.right = `${this.right}rem`
            }
            return o
        }
    }
}
</script>

<style lang="less" rel="stylesheet/less" scoped>
.guidance {
    position: absolute;
    color: #fff;
    font-size: .12rem;
    line-height: .17rem;
    padding: .12rem .18rem;
    background: rgba(14, 46, 70, .78);
    border-radius: .04rem;
    &::before {
        content: '';
        position: absolute;
        background: #405A6D;
        width: .01rem;
        height: .22rem;
    }
    &::after {
        content: '';
        position: absolute;
        background: #405A6D;
        width: .05rem;
        height: .05rem;
        border-radius: 50%;
    }
    &.direction-top {
        &::before {
            top: -.22rem;
            right: .22rem;
        }
        &::after {
            top: -.27rem;
            right: .2rem;
        }
    }
    &.direction-bottom {
        &::before {
            bottom: -.22rem;
            left: .22rem;
        }
        &::after {
            bottom: -.27rem;
            left: .2rem;
        }
    }
    &.direction-left {
        &::before {
            width: .22rem;
            height: .01rem;
            top: 50%;
            transform: translateY(-50%);
            left: -.22rem;
        }
        &::after {
            top: 50%;
            transform: translateY(-50%);
            left: -.27rem;
        }
    }
    &.direction-right {
        &::before {
            width: .22rem;
            height: .01rem;
            top: 50%;
            transform: translateY(-50%);
            right: -.22rem;
        }
        &::after {
            top: 50%;
            transform: translateY(-50%);
            right: -.27rem;
        }
    }
}
</style>
