<template lang="pug">
    popup(:show="showPop"
        :className="advisePop.className"
        :title="advisePop.title")
        .advise-wrap(slot="content")
            .advise-close.iconfont.icon-close(@click="() => showPop = false")
            .advise-group-title
                h3
                    span
                        img(:src="groupImg")
                    | 云之家时间助手交流群
            .advise-group-qrcode(ref="qrCode")
            p {{isSupportTouchScan ? '长按识别二维码进群' : '截图保存并扫一扫进群'}}
</template>
<script>
import Popup from '@/components/common/Popup'
export default {
    data () {
        return {
            showPop: false,
            advisePop: {
                className: 'advise-popup',
                title: {
                    show: false
                }
            },
            groupImg: require('@/assets/feedback_group.png'),
            qrImg: null
        }
    },
    computed: {
        isSupportTouchScan () {
            let version = navigator.userAgent.match(/Qing\/\d+\.\d+.\d+/)[0].match(/\d+\.\d+.\d+/)[0].split('.')
            let isAndroid = navigator.userAgent.indexOf('Android') > -1
            let isSupport
            if (version[0] === '0') {
                let less = parseInt(version[1]) < 9 || (parseInt(version[1]) === 9 && parseInt(version[2]) < 55)
                if (less && isAndroid) {
                    isSupport = false
                } else {
                    isSupport = true
                }
            } else {
                isSupport = true
            }
            return isSupport
        }
    },
    created () {
        const qrImg = new Image()
        qrImg.src = 'https://www.yunzhijia.com/microblog/filesvr/59fbe4bc364a0f141842f432?big'
        this.qrImg = qrImg

        this.$proms.compEnd.call(this, {
            mobileCb: () => {
                this.reAdivse()
            },
            webCb: () => {
            }
        })
    },
    mounted () {
        this.$refs.qrCode.appendChild(this.qrImg)
    },
    components: {
        Popup
    },
    methods: {
        reAdivse () {
            XuntongJSBridge.call('createPop', {
                popTitle: '反馈',
                popTitleCallBackId: 'updateWork'
            }, resp => {
                this.showPop = true
                this.reAdivse()
            })
        }
    }
}
</script>
<style lang="less">
.advise-popup{
    .popup-wrap{
        transform:translate(-50%, -50%);
    }
}
.advise-wrap{
    width: 3.1rem;
    box-sizing: border-box;
    padding:.4rem;
    p{
        text-align: center;
        margin-bottom:.12rem;
        font-size: .14rem;
    }
}
.advise-close{
    position: absolute;
    right:.12rem;
    top:.2rem;
    color:#96A8B2;
    font-size: .12rem;
    &:active{
        opacity:.5;
    }
}
.advise-group-qrcode{
    width:2rem;
    height: 2rem;
    margin: .26rem auto .28rem;
    img{
        max-width: 100%;
        width:100%;
    }
}
.advise-group-title{
    text-align: center;
    h3{ font-weight: normal; }
    span{
        display: inline-block;
        vertical-align: middle;
        margin-right: .08rem;
        font-size: .16rem;
        width:.42rem;
        height: .42rem;
    }
}
</style>
