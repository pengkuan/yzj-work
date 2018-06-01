<template lang="pug">
    .msg-wrap
        .msg-detail
            .msg-title
                span.msg-sender [{{workData.originator}}]
                i.msg-time {{msgTime}}
            .msg-content
                // 文件
                .msg-file(v-if="checkType.isFile")
                    .msg-file-icon
                        img(:src="fileIcons[fileSuffix]")
                    .msg-file-info
                        .msg-file-name {{workData.attachContent.name}}
                        i.msg-file-size {{`${(workData.attachContent.size / 1024).toFixed(2)} kb`}}
                // 纯文本
                .msg-text(v-if="checkType.isText") {{workData.attachContent}}

                // 图片
                .msg-img(v-if="checkType.isImg")
                    img(:src="`/microblog/filesvr/${workData.attachContent.file_id}?thumbnail`")

                // 应用
                .msg-cloudflow(v-if="checkType.isLightApp" @click="toApp(workData)")
                    .msg-flow-icon
                        img(:src="workData.attachContent.thumbUrl")
                    .msg-flow-info
                        .msg-flow-name {{workData.attachContent.title}}
            .msg-source
                span.msg-source-count 来自：
                    img(:src="workData.groupHeaderUrl || workData.originatorPhotoUrl")
                    | {{workData.groupName || workData.originator}}
                a.msg-to-source(href="javascript:;" v-if="$proms.isMobile" @click="toSource(checkType, workData)") 查看来源
</template>
<script>
    export default {
        name: 'msgInfo',
        data () {
            return {
                // 文件类型icon
                fileIcons: {
                    xls: require('../../assets/file_icon/file_icon_xls.jpg'),
                    doc: require('../../assets/file_icon/file_icon_doc.jpg'),
                    pdf: require('../../assets/file_icon/file_icon_pdf.jpg'),
                    ppt: require('../../assets/file_icon/file_icon_ppt.jpg'),
                    'unknow': require('../../assets/file_icon/file_icon_unknow.jpg'),
                    zip: require('../../assets/file_icon/file_icon_zip.jpg')
                }
            }
        },
        props: {
            workData: {
                type: Object
            }
        },
        computed: {
            msgTime () {
                let date = this.$moment(this.workData.originateDate)
                return `${date.month() + 1}-${date.date()} ${date.hour()}:${date.minute()}`
            },
            // 判断文件类型
            checkType () {
                let con = this.workData.attachContent
                let type = this.workData.attachType
                const status = {}
                if (typeof con === 'object') {
                    if (type === 'FILE') {
                        if (/jpg|jpeg|png/g.test(con.ext)) {
                            // 图片
                            status.isImg = true
                        } else {
                            // 文件
                            status.isFile = true
                        }
                    } else {
                        status.isLightApp = true
                    }
                } else if (typeof con === 'string') {
                    // 纯文本
                    status.isText = true
                }

                return status
            },

            // 文件后缀
            fileSuffix () {
                let con = this.workData.attachContent
                let suffix
                if (typeof con === 'object') {
                    let reg = /xls|xlsx|doc|docx|pdf|zip|ppt|pptx/
                    if (reg.test(con.ext)) {
                        if (/xls|xlsx/.test(con.ext)) {
                            suffix = 'xls'
                        } else if (/doc|docx/.test(con.ext)) {
                            suffix = 'doc'
                        } else if (/pdf/.test(con.ext)) {
                            suffix = 'pdf'
                        } else if (/ppt|pptx/.test(con.ext)) {
                            suffix = 'ppt'
                        } else if (/zip/.test(con.test)) {
                            suffix = 'zip'
                        }
                    } else {
                        // 其他类型为 unknow
                        suffix = 'unknow'
                    }
                }
                return suffix
            }
        },
        mounted () {
            // alert(JSON.stringify(this.workData))
        },
        methods: {
            // 进入应用
            toApp (workData) {
                if (this.$proms.isMobile) {
                    XuntongJSBridge.call('gotoLightApp', {
                        appId: workData.attachContent.lightAppId,
                        appName: workData.attachContent.appName,
                        urlParam: workData.attachContent.webpageUrl
                    })
                } else {
                    this.$tip.show({
                        message: '暂不支持，请在手机上查看'
                    })
                }
            },
            // 查看工作来源
            toSource (checkType, workData) {
                XuntongJSBridge.call('chat', {
                    msgId: workData.msgId,
                    groupId: workData.groupId
                }, function (result) {
                    // alert(JSON.stringify(result))
                })
            }
        }
    }
</script>

<style lang="less" scoped rel="stylesheet/less">
@import "../../css/lineLimit.css";
.msg-base{
    background:#fff;
    padding:.08rem;
    font-size: .12rem;
    border:.5px solid #E1E3E6;
    display: flex;
}
.msg-icon{
    flex-basis:.34rem;
    box-sizing: border-box;
    margin-right: .08rem;
    flex-shrink: 0;
    flex-grow: 0;
}
.msg-wrap{
    background:#fff;
    padding:.2rem .12rem 0;
}
.msg-detail{
    background: rgba(244,246,251,0.65);
    border-radius: .05rem;
    padding:.12rem;
    .msg-title{
        overflow: hidden;
        padding-bottom:.1rem;
    }
    .msg-time{
        float: right;
        font-size:.12rem;
        color: #3F3F3F;
    }
    .msg-sender{
        font-size:.14rem;
    }
    // 文件
    .msg-file{
        .msg-base;
    }
    .msg-file-icon{
        .msg-icon;
    }
    .msg-file-info{
        flex:1;
        line-height: .18rem;
    }
    .msg-file-name{
        color:#3F3F3F;
    }
    .msg-file-size{
        color:#98A1A8;
    }
    // 应用
    .msg-cloudflow{
        .msg-base;
    }
    .msg-flow-icon{
       .msg-icon;
    }
    .msg-flow-name{
        color:#030303;
        font-size: .15rem;
        line-height: .34rem;
    }
    // 图片
    .msg-img{
        img{
            max-width:.55rem;
            max-height: .55rem;
        }
    }

}

.msg-source{
    font-size:.12rem;
    overflow: hidden;
    padding-top:.1rem;
    line-height: .24rem;
    color:#3F3F3F;
    .msg-to-source{
        float:right;
        text-decoration: none;
        color: #3F3F3F;
    }
    .msg-source-count{
        img {
            width:.18rem;
            height: .18rem;
            border-radius: 50%;
            vertical-align: sub;
            margin-right:.04rem;
        }
    }
}

</style>
