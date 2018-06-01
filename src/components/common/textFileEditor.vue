<template lang="pug">
.editor-container
    .work-editor
        textarea.work-text(v-model="workText"
            ref="workText"
            :placeholder="placeholder" maxLength="5000")
    .work-num
        .txt-count(:class="overFontNum ? 'over-count' : ''" v-show="workText.length > 4000" ) {{ workText.length }}/5000
    .time-container
        .work-time
            i.iconfont.icon-time1
            span 日期：{{eventTime}}
        .fun-btn(v-if="$proms.isMobile")
            span.file-icon-contaier(@click="showChooseFile = !showChooseFile")
                i.iconfont.icon-shangchuanwendang(:class="{active: showChooseFile}")
                span.file-count(v-if="files.length>0") {{files.length}}
    FileField(v-if="showChooseFile" v-model="files" :scrolly="true")
</template>
<script>
import creatorMix from '@/mixins/creatorMix'
import FileField from '@/components/fileField/FileField'
import {mapGetters} from 'vuex'
import {formatMD} from '@/pages/works/operate'

export default {
    name: 'TextFileEditor',
    mixins: creatorMix,
    components: {
        FileField
    },
    props: {
        workText: {
            type: String
        },
        placeholder: {
            type: String
        },
        files: {
            type: Array
        }
    },
    data () {
        return {
            showChooseFile: false
        }
    },
    computed: {
        ...mapGetters({
            curWork: 'curWork'
        }),
        overFontNum () {
            return this.workText.length >= 5000
        },
        eventTime () {
            // curWork有值代表编辑
            let startTime = this.curWork.startDate ? this.curWork.startDate : this.$mywork.selectedDayOrigin.time
            return this.formatMD(startTime)
        }
    },
    watch: {
        workText (newVal) {
            this.$emit('textchange', newVal)
        },
        files (newVal) {
            this.$emit('filechange', newVal)
        }
    },
    methods: {
        formatMD
    }
}
</script>
<style lang="less" scoped>
.editor-container{
    padding:0 .02rem;
    position: relative;
}
.file-field{
    margin:0 !important;
    border: none;
}
.work-editor{
    display: flex;
    background:#fff;
    box-sizing: border-box;
    height:2rem;
    padding-top:.20rem;
    position: relative;
    padding-bottom: 0;
    .iconfont{
        color: #768893;
    }
    .work-text{
        width:100%;
        min-height: 1.4rem;
        box-sizing: border-box;
        padding: 0 .12rem;
        font-size: .16rem;
    }
}
.fun-btn{
    height:.4rem;
    line-height:.4rem;
    text-align:right;
    padding-right:.26rem;
    margin:0 .12rem;
    border-bottom:1px solid #E6E8EE;
    background:rgba(255,255,255,1);
    .icon-shangchuanwendang{
        color:#768893;
        font-size:.17rem;
        &.active{
            color:#4598F0
        }
    }
    .file-icon-contaier{
        position:relative;
        .file-count{
            position:absolute;
            font-size:.14rem;
            color:#768893;
            left:.18rem;
        }
    }
}

.work-num {
    direction: rtl;
    width: 95%;
    margin: 0 .12rem;
    align-items: center;
    display: block;
    overflow-x: hidden;

    .txt-count {
        height: 0.4rem;
        line-height: .4rem;
        color: #889aa4;
        font-size: 0.13rem;
    }

    .over-count {
        color: #EA5950;
    }
}

.time-container{
    position:relative;
    .work-time{
        position:absolute;
        top:.12rem;
        left: .12rem;
        color: #272727;
        font-size: .13rem;
        background: #fff;
        vertical-align: middle;
        .icon-time1 {
            margin-right: .07rem;
            font-size: .14rem;
            &::before {
                color: #C2CCD0;
            }
        }
        .name {
            color: #345791;
            font-weight: bold;
        }
    }
}
</style>

