<template lang="pug">
    .timeAnalysis
        template(v-if="analysisList.length")
            ul
                li(v-for="(item, index) of analysisList")
                    .avatar
                        img(:src="item.photoUrl")
                    .rightContent
                        .analysis
                            .header
                                span.name {{item.name}}
                                .like(
                                    :class="{down: item.up}"
                                    @click="!item.up && doLike({type: 'timeAnalysis', id: item.id, index})")
                                    i.icon
                                    span {{item.up ? '已赞' : '点赞'}}
                            span.words {{item.text}}
            .clear
        .empty(v-else)
            .no_analysis
            .info
                span 部门员工的工作还没通过云之家记录
                span.tip 快提醒他们使用云之家吧
</template>

<script>
    export default {
        name: 'TimeAnalysis',
        props: {
            analysisList: {
                type: Array,
                default: () => []
            },
            doLike: Function
        }
    }
</script>
