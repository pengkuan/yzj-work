<template lang='pug'>
    .kw-null(v-cloak)
        section.kw-img
            img(src="../../assets/noData.png")
            p 暂无其他数据
        section.kw-desc
            p.desc-title
                img(src="../../assets/xiaoyun.png")
                | 小云机器人
            p.desc-content {{content}}
</template>

<script>
    export default {
        props: {
            content: {
                type: String,
                default: false
            }
        }
    }
</script>
<style lang="less" rel="stylesheet/less" scoped>
    .kw-img{
        margin: 1.02rem auto .75rem auto;
        text-align: center;
        p {
            color: #A4A8AB;
            font-size: .14rem;
        }
        img{
            width: 1.29rem;
            margin-bottom: .16rem;
        }
    }
    .kw-desc{
        width: 3.1rem;
        border-radius:.08rem;
        background: #F9F9FB;
        padding: .18rem;
        margin: auto;
        .desc-title{
            font-size:.18rem;
            color: #768893;
            margin-bottom:.1rem;
            font-weight:bold;
            img{
                width: .28rem;
                vertical-align: middle;
                margin-right: 3px;
            }
        }
        .desc-content{
            color:#1D1D1D;
            font-size:.15rem;
        }
    }
</style>
