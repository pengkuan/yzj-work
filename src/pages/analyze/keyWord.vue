<template lang='pug'>
    .kw-wrap(v-cloak v-show='isLoad')
        .keyword-wrap(v-cloak v-if='!isNull'  :class='{"keyword-wrap-x": isIphoneX}')
            section.kw-title
                p 你上周的大部分时间用在
                p.kw-time(v-cloak) {{time}}
            section.kw-content
                span(v-for='key in keyWords' :class='kwFontClass') {{key}}
            section.kw-split
                span.split
                span.split-font 分析
                span.split
            p.kw-desc(v-cloak) {{desc}}

            canvas#canvas

            footer
                img(src='../../assets/footbg.png')

        kw-null(v-cloak v-if='isNull' :content='desc')
</template>
<script src='../../lib/hidpi-canvas.min.js'></script>
<script>
// import imgData from './share-img'
import { ownKeyword, getUserInfo } from '@/api/sendRequest'
import { screeningKW, kwDesc } from './getKW'
import kwNull from './kwNull.vue'
export default {
    data () {
        return {
            keyword: '',
            keyWords: [],
            desc: '',
            image: '',
            startTime: '',
            endTime: '',
            val: '',
            isLoad: false
        }
    },
    created () {
        this.initPop()
        this.xtSetTitle('时间使用分析')
    },
    mounted () {
        this.getKWDetail()
    },
    computed: {
        kwFontClass () {
            const length = this.keyWords.length
            return length === 2 ? 'kw-two' : length === 3 ? 'kw-three' : 'kw-four'
        },
        isNull () {
            return this.keyword === '签到'
        },
        time () {
            return this.setTime(this.startTime) + '-' + this.setTime(this.endTime)
        },
        isIphoneX () {
            return /iphone/gi.test(navigator.userAgent) &&
                (window.screen.height === 812 && window.screen.width === 375)
        }
    },
    methods: {
        setTime (time) {
            let _time = this.$moment(time)
            let year = _time.format('YYYY')
            return year !== 'Invalid date' ? year + '.' + (_time.format('MM') || '') + '.' + (_time.format('DD') || '') : ''
        },
        initPop () {
            this.$proms.compEnd.apply(this, [{
                mobileCb: () => {
                    this.shareMobileKW()
                },
                webCb: () => {
                    this.shareWeb()
                }
            }])
        },
        shareWeb () {
            this.$proms.onLappReady().then(lappmask => {
                lappmask.removeCreatePop()
                // 隐藏或显示web端返回按钮
                let obj = {
                    needBack: true
                }
                window.parent.postMessage(JSON.stringify(obj), '*')
            })
        },
        shareMobileKW () {
            XuntongJSBridge.call('createPop', {
                popTitle: '分享',
                popTitleCallBackId: 'share'
            }, resp => {
                XuntongJSBridge.call('share', {
                    shareType: 2,
                    appId: 10619,
                    appName: '日程安排',
                    imageData: this.image.replace('data:image/png;base64,', ''),
                    toChat: true
                }, resp => {

                })
            })
        },
        getKWDetail () {
            let time = this.$route.params.time
            time && ownKeyword(`time=${time}`).then(resp => {
//                resp = {'data': {'startTime': 1526227200000, 'endTime': 1526832000000}, 'errorCode': 0, 'success': false}
//                console.log('??????:', resp)
                if (resp.success) {
                    !resp.data && (resp['data'] = {})

                    this.startTime = resp.data.startTime || ''
                    this.endTime = resp.data.endTime || ''

                    let {kw, name, val} = screeningKW(resp.data.keyword || {})
                    this.keyword = name
                    this.keyWords = name.split('')
                    this.val = val

                    if (kw === 'MSG_CONTACT_MOST_SIZE_WEEK') {
                        // 发消息
                        let data = new FormData()
                        data.append('id', resp.data.keyword.data['MSG_CONTACT_MOST_WEEK'] || '')
                        getUserInfo(data).then(resp1 => {
                            if (resp1.success) {
                                this.val = resp1.data.name
                            } else {
                                this.val = ''
                            }

                            this.desc = kwDesc({kw, val: this.val, resp: resp.data.keyword})
                            this.canvasImg()
                        })
                    } else {
                        this.desc = kwDesc({kw, val, resp: resp.data.keyword})
                        this.keyword !== '签到' && this.canvasImg()
                    }

                    this.keyword === '签到' && XuntongJSBridge.call('closePop')
                } else {
                    this.keyword = '签到'
                    this.desc = kwDesc({kw: 'SING_LONG_WEEK', val: 0})
                    XuntongJSBridge.call('closePop')
                }
                this.isLoad = true
            })
        },
        /*
        * 画布
        * */
        canvasImg () {
            this.canvas = document.getElementById('canvas')
            this.context = this.canvas.getContext('2d')

            let getPixelRatio = (context) => {
                let backingStore = context.backingStorePixelRatio ||
                    context.webkitBackingStorePixelRatio ||
                    context.mozBackingStorePixelRatio ||
                    context.msBackingStorePixelRatio ||
                    context.oBackingStorePixelRatio ||
                    context.backingStorePixelRatio || 1

                return (window.devicePixelRatio || 1) / backingStore
            }

            let ratio = getPixelRatio(this.context)

            this.canvas.width = 375 * ratio
            this.canvas.height = 667 * ratio

            let url = require(`../../assets/share${this.keyWords.length - 1}.png`)

            let img = new Image()
            img.src = url

            const me = this
            img.onload = function () {
                me.context.drawImage(img, 0, 0, 375 * ratio, 667 * ratio)
//                me.context.scale(1 / ratio)
                me.canvas.style.zoom = 1 / ratio
                me.canvasFont(ratio)
            }
        },
        canvasFont (ratio) {
            let style = [{font: `${70 * ratio}px PingFangSC-Regular`, h: 282, wArr: [128, 247]},
                {font: `${58 * ratio}px PingFangSC-Regular`, h: 277, wArr: [96, 188, 280]},
                {font: `${36 * ratio}px PingFangSC-Regular`, h: 272, wArr: [77, 151, 225, 299]}]

            this.singleFont('你上周的大部分时间用在', {
                font: `${20 * ratio}px PingFangSC-Regular`,
                textAlign: 'center'
            }, 192 * ratio, 104 * ratio)

            this.singleFont(this.time, {
                font: `${14 * ratio}px PingFangSC-Regular`,
                alpha: '.62',
                textAlign: ''
            }, 192 * ratio, 126 * ratio)
            const singleStyle = style[this.keyWords.length - 2]

            this.keyWords.forEach((item, index) => {
                this.singleFont(item, {
                    font: singleStyle.font
                }, singleStyle.wArr[index] * ratio, singleStyle.h * ratio)
            })

            this.newLine(this.desc.replace('你', this.$userInfo.username), ratio)
            this.canvasToImage()
        },
        singleFont (font, fontStyle, x, y) {
            this.context.font = fontStyle.font
            this.context.globalAlpha = fontStyle.alpha || 1
            this.context.fillStyle = '#fff'
            this.context.textAlign = 'center'
            this.context.fillText(font, x, y)
        },
        newLine (desc = '', ratio) {
            if (!desc) return

            // 太长文字的换行
            let canvasWidth = 440 * ratio
            let startIndex = 0

            let num = parseInt(canvasWidth / 17) + (canvasWidth % 17 !== 0 ? 1 : 0)
            if (desc.length > 17) {
                for (let i = 0; i < num; i++) {
                    let txt = desc.substring(startIndex, 17 * (i + 1))
                    startIndex += 17
                    this.singleFont(txt, {
                        font: `${14 * ratio}px PingFangSC-Regular`,
                        textAlign: 'center'
                    }, 192 * ratio, 417 * ratio + (20 * i) * ratio)
                }
            } else {
                this.singleFont(desc, {
                    font: `${14 * ratio}px PingFangSC-Regular`,
                    textAlign: 'center'
                }, 192 * ratio, 417 * ratio)
            }
        },
        canvasToImage () {
            this.image = this.canvas.toDataURL('image/png')
        }
    },
    components: {
        kwNull
    }
}
</script>
<style lang='less' scoped>
.keyword-wrap{
    width:100%;
    height:100%;
    position: absolute;
    padding: .63rem .22rem 0.2rem .22rem;
    color: #ffffff;
    text-align: center;
    background:url('../../assets/kwbg.png');
    background-size:100% 100%;
    background:#5D98FA;

    .kw-title{
        font-size:.2rem;
        .kw-time{
            font-size:.14rem;
            opacity: .62;
            margin-top: .02rem;
         }
    }
    .kw-content{
        margin:.59rem auto .87rem auto;
        overflow:hidden;
        span{
            display: inline-block;
            background: url('../../assets/fontbg.png') center no-repeat;
            background-size: cover;
            img{
                width: .88rem;
            }

            &:first-child {
                margin-left: 0;
            }

            &:last-child {
                margin-right: 0;
            }
        }
        .kw-two{
            width: .88rem;
            height: .89rem;
            font-size: .7rem;
            line-height: .89rem;
            margin:0 .15rem;
            font-weight: bold;
         }
        .kw-three{
            font-size: .58rem;
            margin:0 .08rem;
            width: .77rem;
            height: .78rem;
            font-weight: bold;
        }
        .kw-four{
            font-size: .36rem;
            width: .66rem;
            height: .67rem;
            margin:0 .08rem;
            line-height: .67rem;
            background-size: 98% 99%;
            font-weight: bold;
        }
    }
    .kw-split{
        height: .19rem;
        line-height:.19rem;
        .split{
            width: .93rem;
            height: 1px;
            display: inline-block;
            background: #FFFFFF;
            vertical-align: middle;
        }
        .split-font{
            margin: auto .24rem;
            font-size:.14rem;
        }
    }
    .kw-desc{
        width: 2.66rem;
        margin:.21rem auto;
        text-align: center;
        font-size: .14rem;
        font-family:PingFangSC-Regular;
    }
    footer{
        position: absolute;
        bottom: .21rem;
        margin:auto;
        left:50%;
        transform: translateX(-50%);
        img{
            height: .18rem;
        }
    }

    canvas{
        position: absolute;
        top:0;
        left:0;
        display: none;
    }
}

.keyword-wrap-x{
    padding-top: .8rem;
    .kw-content{
        margin: .68rem auto 1.07rem auto;
    }
    .kw-desc{
        margin-top: .3rem;
    }
}

@media screen and (max-width: 330px){
    .keyword-wrap>.kw-content{
        .kw-four{
            width: 20%;
            height: 20%;
         }
    }
}
[v-cloak]{
    display: none !important;
}
</style>
