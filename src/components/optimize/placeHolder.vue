<template lang="pug">
.place-holder
        .holder.holder-long
        .holder.holder-long
        .holder.holder-medium
        .holder-block
            .holder.holder-medium
            .holder.holder-medium
        .holder-block
            .holder.holder-long
            .holder.holder-long
        .holder.holder-medium
</template>
<script>
export default {
    data () {
        return {}
    }
}
</script>
<style lang="less" scoped>
// 占位图
.place-holder{
    height: 5rem;
    padding: .16rem;
    .holder{
        height: .2rem;
        margin:.1rem 0;
        background:rgba(230, 234, 236, .28);
    }
    .holder-medium{
        width: 50%;
    }
    .holder-block{
        padding-top: .3rem;
    }
}
</style>

