<template lang="pug">
    .medalLine
        template(v-if="medalNewsList.length")
            ul
                li(v-for="(item, index) of medalNewsList")
                    .medal
                        img.medalPic(:src="getAwardPic(item.type)")
                        .medalText
                            span {{getCurrentAward(item.type).condition}}
                            span {{`获得“${getCurrentAward(item.type).name}”勋章`}}
                    .medalUser
                        .avatar
                            img(:src="item.photoUrl")
                        .name {{item.name}}
                        .like(
                            :class="{down: item.up}"
                            @click="!item.up && doLike({type: 'medal', id: item.id, index})")
                            i.icon
            .clear
        .empty(v-else)
            .no_analysis
            .info
                span 你的下属在上周没有获得任何勋章
</template>

<script>
    import AWARDS from '../../components/madel/awards'
    import env from '../../config/env.config'

    export default {
        name: 'MedalLine',
        props: {
            medalNewsList: {
                type: Array,
                default: () => []
            },
            doLike: Function
        },
        methods: {
            getCurrentAward (type) {
                return AWARDS[type]
            },
            getAwardPic (awardType) {
                let ratio = Math.ceil(window.devicePixelRatio)
                if (ratio > 3) ratio = 3
                const ratioSuffix = ratio > 1 ? `@${ratio}x` : ''
                const awardSrc = this.getCurrentAward(awardType).src

                return `${env.assetUrl}/assets/madel/awards/${awardSrc}${ratioSuffix}.png`
                // return `../../static/assets/madel/awards/${awardSrc}${ratioSuffix}.png`
            }
        }
    }
</script>
