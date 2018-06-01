<template lang="pug">
.work-schedule(ref="planWorks")
    ul.work-list.plan-list(ref="list")
        mission(
            v-for= "(work, index) in list"
            :key="work"
            :work= "setWork(work)"
            :isPlan="isPlan"
            :class= `[{fadeout: work.remove},
                    {fadeIn: work.isAdd},
                    {anim: work.anim}]`
            @panleft="onPanleft")
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Mission from './Mission'

export default {
    name: 'Schedule',
    computed: {
        list () {
            return this.$store.getters.planList
        },
        ...mapGetters({
            planList: 'planList'
        })
    },
    data () {
        return {
            animWork: null,
            isPlan: true
        }
    },
    mounted () {
        // if (this.$proms.ready) {
        //     this.setDefault()
        // } else {
        //     let timer = setInterval(() => {
        //         if (this.$proms.ready) {
        //             this.setDefault()
        //             clearInterval(timer)
        //         }
        //     }, 16)
        // }
    },
    methods: {
        ...mapActions(['getPlanList']),
        setWork (work) {
            work.isPlan = true
            return work
        },
        onPanleft (work) {
            this.animWork = work
        },
        setDefault () {
            this.$proms.ready.then(resp => {
                this.getPlanList().then(resp => {
                    window.timePoints['firstPageVisible'] = Date.now()
                    window.timePoints['worklistShown'] = Date.now()
                    let points = window.timePoints
                    this.$speedsdk.report([
                        points['getPersonInfo'] - points['startAuthen'],
                        points['indexMounted'] - points['htmlStart'],
                        points['worklistShown'] - points['htmlStart']
                    ])
                })
            })
        }
    },
    components: {
        Mission
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" rel="stylesheet/less">
.work-list{
    overflow: hidden;
    background:#fff;
    li{
        height:.8rem;
        position: relative;
        transition:all .4s;
        display: flex;
        padding-left: .16rem;
        &.top{
            background: url(../../assets/top.png) no-repeat;
        }
        &.anim{
            // transform: translateX(-1.2rem);
            transform: translateX(-.6rem);
        }
        &.active {
            /*background:rgba(232, 238, 240, .5);*/
            background: rgba(243,244,245,1);
            color:rgba(0,0,0,.5)
        }
    }
    .work-check, .work-brief{
        position: relative;
        height: 100%
    }
    .work-check{
        display: block;
        flex:0 auto;
        width:.54rem;
    }

    .check-box{
        position: absolute;
        width: .18rem;
        height: .18rem;
        left:.24rem;
        position: absolute;
        top:50%;
        transform: translateY(-50%);
        &.icon-conf{
            img{
                width: 100%;
            }
        }
    }

    .icon-mark{
        position: absolute;
        right:.12rem;
        color: #FBA129;
        top:50%;
        transform: translateY(-50%);
    }
}
.work-brief{
    border-bottom:.5px solid #EEEFF5;
    flex:1 auto;
    .work-con{
        position: absolute;
        top:50%;
        transform: translateY(-50%);
        width:100%;
    }

    .work-info{
        margin-top: .02rem;
        &:after {
            display: block;
            content: ' ';
            clear: both;
        }
    }

    .work-creater{
        color:#768893;
    }

    .work-deadline{
        color: #4598F0;
        margin-right: .12rem;
        &.outdated{
            color:#F55147;
        }
    }

    .work-desc{
        position: relative;
        font-size: .16rem;
        width:100%;
        b{
            display: inline-block;
            // height: .2rem;
            // white-space: nowrap;
            line-height: .20rem;
            box-sizing: border-box;
            padding-right: .16rem;
            width:100%;
            overflow : hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-wrap: break-word;
        }

        .work-co{
            display: inline-block;
            vertical-align: middle;
            width: .18rem;
            margin-right: .04rem;
            img{
                max-width: 100%;
            }
        }
    }
}

.work-ctrls{
    position: absolute;
    line-height: .8rem;
    left:100%;
    // width:1.2rem;
    width:.64rem;
    span{
        display: inline-block;
        width:.64rem;
        text-align: center;
        color:#fff;
        &.work-del, &.conf-cancel{
            background: #F55147;
        }
        &.work-mark{
            background: #A4A8AB;
        }
    }
}

// 完成确认弹窗
.check-confirm-popup{
    .popup-wrap{
        width:2.67rem;
    }
    .popup-title{
        padding:.16rem 0;
        text-align: center;
        font-size: .16rem;
    }
    .work-wrap{
        position: relative;
        height: 100%;
    }
    .work-content{
        max-height: 0.8rem;
        line-height: .2rem;
        padding-bottom: .16rem;
        width:2.43rem;
        margin:0 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: .14rem;
        box-sizing: content-box;
        &.center{
            text-align: center;
        }
    }
    .work-check-btns{
        width: 100%;
        display: flex;
        height: .45rem;
        align-items: center;
        border-top:.5px solid #EEEFF5;
        span{
            display: block;
            flex-grow: 1;
            flex-shrink: 1;
            text-align: center;
            &:first-child{
                border-right: .5px solid #EEEFF5;
            }
            font-size: .16rem;
            &:active{
                opacity: .5;
            }
        }
    }
}
</style>
