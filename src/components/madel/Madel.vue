<template lang="pug">
    .madel-honor-body
        .madel-honor-wrap
            .madel-wrap
                img(:src="getAwardImg(awardObj.src)")
            .honor-wrap
                .content
                    span 恭喜你
                    div
                        span 获得
                        span.madel-name “{{awardObj.name}}”
                        span 勋章
                button.btn(v-fb="feedback" @click="gotoPage") 立即领取
            .closer(v-fb="feedback" @click="close")
</template>
<script>
import awards from './awards'
import env from '@/config/env.config.js'

export default {
    props: {
        award: {
            type: String,
            required: true
        },
        awardUrl: {
            type: String,
            required: true
        }
    },
    computed: {
        awardObj () {
            return awards[this.award] || {}
        }
    },
    data () {
        return {
            feedback: {
                cls: 'touch-feedback'
            }
        }
    },
    methods: {
        getAwardImg (name) {
            let ratio = Math.ceil(window.devicePixelRatio)
            if (ratio > 3) {
                ratio = 3
            }
            const ratioTxt = ratio > 1 ? `@${ratio}x` : ''
            return `${env.assetUrl}/assets/madel/awards/${name}${ratioTxt}.png`
            // return require(`../../assets/madel/awards/${name}${ratioTxt}.png`)
        },
        gotoPage () {
            location.href = this.awardUrl
        },
        close () {
            setTimeout(() => {
                this.$emit('close-madel-honor')
            }, 30)
        }
    }
}
</script>

<style lang="less" scoped>
    .madel-honor-body {
        font-family: PingFangSC-Regular;
        position: fixed;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        padding-bottom: .23rem;
        background:rgba(14,46,71,0.36);
    }
    .madel-honor-wrap {
        height: 100%;
        width: 100%;
        // background:rgba(14,46,71,0.36);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        .madel-wrap {
            width: 2.33rem;
            height: 1.62rem;
            position: relative;
            margin-left: -.07rem;
            z-index: 1;
            &::after {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                z-index: 1;
                width: 100%;
                height: 100%;
                background: url('../../assets/madel/stars.svg') center center no-repeat;
                background-size: 100% 100%;
            }
            img {
                position: absolute;
                width: 1.94rem;
                height: 1.34rem;
                left: 50%;
                bottom: 0.05rem;
                transform: translateX(-50%);
            }
        }

        .honor-wrap {
            width: 2.46rem;
            height: 2.53rem;
            box-sizing: border-box;
            margin-top: -.95rem;
            background: url('../../assets/madel/bg-lightning.png') center center no-repeat;
            background-size: 100% 100%;
            padding: 1.1rem .22rem 0 .22rem;
            .content {
                font-size: .18rem;
                color: rgba(209,225,239,1);
                line-height: .30rem;
                & > span:first-of-type {
                    display: block;
                }
                .madel-name {
                    display: inline;
                    color: #fff;
                }
            }
            .btn {
                display: block;
                margin-top: .26rem;
                width: 100%;
                height: .31rem;
                background: rgba(253,163,44,1);
                border: none;
                border-radius: .65rem;
                font-size: .15rem;
                color: rgba(255,255,255,1);
                line-height: .31rem;
                text-align: center;
                -webkit-tap-highlight-color: none;
                -webkit-user-select: none;
                user-select: none;
                outline: none;
                cursor: pointer;
            }
        }
        @media screen and (-webkit-min-device-pixel-radio: 2) {
            .honor-wrap {
                background-image: url('../../assets/madel/bg-lightning@2x.png');
            }
        }
        @media screen and (-webkit-min-device-pixel-radio: 3) {
            .honor-wrap {
                background-image: url('../../assets/madel/bg-lightning@3x.png');
            }
        }
        .closer {
            margin-top: .36rem;
            width: .31rem;
            height: .31rem;
            background: url('../../assets/madel/closer.svg') center center no-repeat;
            background-size: 100% 100%;
            -webkit-tap-highlight-color: none;
            cursor: pointer;
        }
        .touch-feedback {
            opacity: 0.5;
        }
    }
</style>

