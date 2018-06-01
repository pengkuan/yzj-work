
<template lang="pug">
    .file-item(@click="showFile")
        i.file-icon(:class="fileIcon")
        .file-info(:class="{mr: !canDel}")
            .file-name {{fileInfo.fileName}}
            span.file-size {{fileSize}}
        i.iconfont.icon-close(v-if="canDel"
            @click.stop="removeFile")
</template>
<script>
export default {
    props: {
        fileInfo: {
            type: Object,
            default () {
                return null
            }
        },
        canDel: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        fileIcon () {
            const SUFFIXS = {
                doc: 'docx',
                docx: 'docx',
                ppt: 'ppt',
                pptx: 'ppt',
                pdf: 'pdf',
                xlsx: 'xlsx',
                xls: 'xlsx',
                txt: 'txt',
                zip: 'zip',
                rar: 'zip',
                jpg: 'png',
                png: 'png',
                mpeg: 'music',
                mp3: 'music',
                wav: 'music'
            }

            return `${SUFFIXS[this.fileInfo.fileExt.toLowerCase()] || 'unknown'}-icon`
        },
        fileSize () {
            return this.bytesToSize(this.fileInfo.fileSize)
        }
    },
    created () {
    },
    methods: {
        removeFile () {
            this.$emit('remove', this.fileInfo.fileId)
        },
        bytesToSize (bytes) {
            if (bytes === 0) return '0 B'
            const [k, sizes] = [1024, ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']]
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
        },
        showFile () {
            if (!this.$proms.isMobile) return
            window.XuntongJSBridge.call('showFile', this.fileInfo)
        }
    }
}
</script>

<style lang="less" scoped>
    .file-item {
        position: relative;
        overflow: hidden;
        margin-top: .08rem;
        padding: .08rem 0;
        border: 1px solid rgba(152, 161, 168, .3);
        background: rgba(241, 244, 248, .3);
        .file-icon {
            float: left;
            width: .29rem;
            height: .3rem;
            margin-left: .16rem;
            border-radius: .03rem;
            background-size: cover;
            background-repeat: no-repeat;
            &.docx-icon {
			    background-image: url('../../assets/file_icon/docx@2x.png');
            }

            &.pdf-icon {
                background-image: url('../../assets/file_icon/pdf@2x.png');
            }

            &.xlsx-icon {
                background-image: url('../../assets/file_icon/xlsx@2x.png');
            }

            &.ppt-icon {
                background-image: url('../../assets/file_icon/ppt@2x.png');
            }

            &.txt-icon {
                background-image: url('../../assets/file_icon/txt@2x.png');
            }

            &.zip-icon {
                background-image: url('../../assets/file_icon/zip@2x.png');
            }

            &.music-icon {
                background-image: url('../../assets/file_icon/voice@2x.png');
            }

            &.video-icon {
                background-image: url('../../assets/file_icon/video@2x.png');
            }

            &.png-icon {
                background-image: url('../../assets/file_icon/img@2x.png');
            }

            &.unknown-icon {
                background-image: url('../../assets/file_icon/unknown@2x.png');
            }
        }
        .file-info {
            margin: 0 .4rem 0 .59rem;
            color: #98A1A8;
            font-size: 0;
            .file-name {
                white-space: nowrap;
                text-overflow:ellipsis; 
                overflow:hidden; 
                font-size: .12rem;
            }
            .file-size {
                font-size: .1rem;
            }
        }
        .mr {
            margin-right: .16rem;
        }
        .icon-close {
            position: absolute;
            height: .3rem;
            width: .44rem;
            top: 50%;
            margin-top: -.15rem;
            right: 0;
            text-align: center;
            line-height: .3rem;
            font-size: .12rem;
            color: #C2CBD0;
        }
    }
</style>
