<template lang="pug">
    .m-records
        .record-detail(v-cloak v-if="mRDetail.content" :class="{'hideShow':!isShow}" )
            p.r-title
                span.r-t-title {{mRTitle}}
                span.r-t-time {{mRDetail.nickName}} {{$moment(mRDetail.createDate).format('MM-DD HH:mm')}}
            .r-content(v-if="mrContent")
                p(v-html="mrContent" ref="rc" :class="{'msg-text': !isExpanded}")
            .file-list(v-show="showFileList" :class="{expanded: isExpanded}")
                file-item(v-for="item in mRDetail.files"
                            class="detail-file-item"
                            :file-info="item"
                            :canDel="false")
            div
                a.r-fontBtn(v-if="expandable" @click="toggleContentExpand") {{isExpanded ? '收起' : '展开'}}
                span.file-icon(v-if="showAttachIcon")
                    i.iconfont &#xe643;
                    span {{mRDetail.files.length}}
            .re-send(v-if="isCreater" @click="isShowPopup = true") 重新提交


        popup(v-if="isShowPopup" :show="isShowPopup" :title="comPupTitle" class="check-confirm-popup")
            .work-wrap(slot="content")
                .work-content.center 重新提交会覆盖原有{{mRTitle}}，是否继续？
                .work-check-btns
                    span(@click="optUpdate(false)") 取消
                    span(@click="addRecordBefore") 继续
</template>

<script>
    import Popup from './Popup.vue'
    import phizTranslate from '@/components/phiz/phiz'
    import FileItem from '@/components/fileField/FileItem'
    import { mapGetters } from 'vuex'

    export default {
        props: {
            mRDetail: {
                type: Object,
                default: function () {
                    return {}
                }
            },
            mRTitle: {
                type: String,
                required: true
            }
        },
        data () {
            return {
                isShowPopup: false,
                comPupTitle: {
                    show: true,
                    content: ' '
                },
                expandable: false,    // 是否可伸缩
                isExpanded: true,  // 按钮是展开true或收起false
                isShow: false   // 是否展示
            }
        },
        mounted () {
            this.$nextTick(() => {
                this.mRDetail.content && this.setLineClamp()
            })
        },
        computed: {
            ...mapGetters({
                curWork: 'curWork'
            }),
            mrContent () {
                let content = phizTranslate.translatePhizIcon(this.mRDetail.content || '')
                return content
            },
            showAttachIcon () {
                const files = this.mRDetail.files || []
                return (files.length > 1) && !this.isExpanded
            },
            showFileList () {
                if (!this.mrContent || this.isExpanded) {
                    return true
                }
                return false
            },
            isCreater () {
                const {
                    openid: creatorId,
                    currentWorkUser: { oid: currentUserId } = {}
                } = this.curWork
                return creatorId === currentUserId
            }
        },
        watch: {
            mrContent () {
                this.$nextTick(() => {
                    this.mRDetail.content && this.setLineClamp()
                })
            }
        },
        methods: {
            setLineClamp () {
                // 设置文字行数
                const rootFontSize = parseInt(document.getElementsByTagName('html')[0].style.fontSize.replace('px', ''))
                const maxHeight = rootFontSize * 0.58
                const height = this.$refs.rc ? this.$refs.rc.clientHeight : 0
                const isTxtOverHeight = height > maxHeight
                const attachmentCount = (this.mRDetail.files || []).length
                // 显示“展开、收起”逻辑 1、文本超过范围 2、没有文本，附件数量 > 1 3、有文本，有附件
                this.expandable = isTxtOverHeight || (attachmentCount > 1) || (height && (attachmentCount > 0))
                this.isExpanded = false
                this.isShow = true
            },
            toggleContentExpand () {
                // 是否展开收起
                this.isExpanded = !this.isExpanded
            },
            clickBtn (status) {
                status && this.addRecordBefore()
                !status && this.optUpdate(true)
            },
            addRecordBefore () {
                this.$router.push({name: 'MeetingRecord', params: { tag: 'record' }})
            },
            optUpdate (status = false) {
                // 操作重新提交的Box是否展示
                this.isShowPopup = status
            },
            translatePhiz (content = '') {
                return phizTranslate.translatePhizIcon(content)
            }
        },
        components: {
            Popup,
            FileItem
        }
    }
</script>

<style lang="less" rel="stylesheet/less" >
    @import "../../css/lineLimit.css";
    .m-records{
        background: #ffffff;
        /*span{display: inline-block;}*/
        .r-title{
            overflow: hidden;
            padding: .13rem 0;
            margin-bottom: .15rem;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
        .r-t-title{
            color:#0F092A;
            font-size: .16rem;
            font-weight: bold;
        }
        .r-t-time{
            color:#768893;
            font-size: .12rem;
        }
    }
    .record-detail{
        padding: 0 .16rem;
        padding-bottom:.13rem;
        overflow:hidden;

        .r-content{
            overflow: hidden;
            word-wrap: break-word;
            word-break: break-word;
            white-space: pre-wrap;
            p {
                font-size: .14rem;
            }
            img{
                width: .16rem;
                margin: auto .01rem;
            }
            .r-c-detail{
                line-height: .25rem;
            }
            .msg-text{
                word-wrap: break-word;
                word-break: break-word;
                white-space: pre-wrap;
            }
        }
        .r-content + .file-list {
            margin-top: .21rem;
            max-height: none;
        }
        // 没有正文，则默认只显示44px；如果”展开“，则不显示高度
        .file-list {
            max-height: .44rem;
            &.expanded{
                max-height: none;
            }
            overflow: hidden;
            .file-item:first-of-type {
                margin-top: 0;
            }
        }
        .r-fontBtn {
            font-size: .14rem;
            color:#4598F0;
            padding-top: .20rem;
            display: inline-block;
            cursor: pointer;
        }
        .file-icon {
            display: inline-block;
            margin-left: .20rem;
            color: #768893;
            font-size:.14rem;
            span{
                font-size:.12rem;
                margin-left: .02rem;
            }
        }
        .re-send {
            float: right;
            margin-top: .08rem;
            color: #768893;
            font-size: .12rem;
            cursor: pointer;
        }
    }
    .hideShow{
        .r-content{
            max-height: .58rem;
        }
        .file-list{
            display: none;
        }
    }

    /*// 完成确认弹窗*/
    .check-confirm-popup{
        .popup-wrap{
            width:2.67rem;
        }
        .popup-title{
            padding:.16rem 0 !important;
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
                color:#4598F0;
                &:first-child{
                    border-right: .5px solid #EAEFF3;
                    color:#768893
                }
                font-size: .16rem;
                &:active{
                    opacity: .5;
                }
            }
        }
    }
</style>
