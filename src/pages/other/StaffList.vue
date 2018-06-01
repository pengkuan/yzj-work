
<template lang="pug">
    .staff-list-wrapper
        .staff-list
            .staff-item
                img.staff-portrait(src="https://yunzhijia.com/space/c/photo/load?id=58e8be83e4b001b0b2d18dd9&spec=90")
                .staff-msg
                    .staff-name 周恒颖
                    .staff-post 前端开发
            .staff-item
                img.staff-portrait(src="https://yunzhijia.com/space/c/photo/load?id=58e8be83e4b001b0b2d18dd9&spec=90")
                .staff-msg
                    .staff-name 周恒颖
                    .staff-post 前端开发
</template>

<script>
export default {
    created () {
        this.$proms.compEnd.call(this, {
            mobileCb: () => {
                XuntongJSBridge.call('setWebViewTitle', {'title': '直属下属'})
            }
        })
    }
}
</script>


<style lang="less" scoped>
    .staff-list-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background: #F8F9FB;
        .staff-list {
            margin-top: .08rem;
            background: #fff;
            .staff-item {
                display: flex;
                position: relative;
                align-items: center;
                height: .6rem;
                .staff-portrait {
                    height: .38rem;
                    width: .38rem;
                    margin: 0 .16rem;
                    border-radius: .38rem;
                }
                .staff-msg {
                    flex: 1;
                    &::before {
                        content: "";
                        position: absolute;
                        bottom: 0;
                        border-top: 1px solid #EEEFF5;
                        width: 200%;
                        transform: scale(.5);
                        transform-origin: 0;

                    }
                    
                    .staff-name {
                        font-size: 17px;
                        color: #1D1D1D;
                    }
                    .staff-post {
                        font-size: 13px;
                        color: #768893;
                    }
                }
            }
        }
    }
</style>

