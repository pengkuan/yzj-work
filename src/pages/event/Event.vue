<template lang="pug">
    .event-main
        text-file-editor(
            :work-text="workInfo.textContent"
            :files="files"
            @filechange="onFileChange"
            @textchange="onTextChange"
            placeholder="这一刻想记点什么..."
        )
        .voice-contaniner
            VoiceToText(@voiceToText="getText")
</template>
<script>
import {mapGetters} from 'vuex'
import * as Operate from '../works/operate'
import TextFileEditor from '@/components/common/textFileEditor'
import VoiceToText from '@/components/common/voiceToText'
import {formatDate} from '@/utils/index'

export default {
    computed: {
        ...mapGetters({
            curWork: 'curWork',
            taskDate: 'taskDate',
            coWorkers: 'coWorkers'
        })
    },
    data () {
        return {
            workInfo: {
                textContent: '',
                topState: 0,
                workData: null,
                submitExperience: false
            },
            files: [],
            // 防止重复保存的
            isSaving: false
        }
    },
    created () {
        this.getReady()
        if (this.curWork.isOld) {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {'title': '编辑记事'})
                },
                webCb: lappmask => {
                    lappmask.resetTitle('编辑记事')
                }
            })
            this.setDefaultData()
        }
    },
    components: {
        TextFileEditor,
        VoiceToText
    },
    methods: {
        onTextChange (newText) {
            this.workInfo.textContent = newText
        },
        onFileChange (newFiles) {
            this.files = newFiles
        },
        getText (text) {
            this.workInfo.textContent += text
        },
        // 共用创建方法
        getReady () {
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {title: '新建记事'})
                    XuntongJSBridge.call('createPop', {
                        popTitle: '提交',
                        popTitleCallBackId: 'addWork'
                    }, resp => {
                        this.curWork.isOld ? this.update() : this.createEvent()
                    })
                },
                webCb: lappmask => {
                    lappmask.resetTitle('新建记事')
                    lappmask.removeCreatePop()
                    const obj = {
                        needBack: true
                    }
                    window.parent.postMessage(JSON.stringify(obj), '*')
                    lappmask.createPop([{
                        text: '提交',
                        callBack: (evt) => {
                            this.curWork.isOld ? this.update() : this.createEvent()
                        }
                    }])
                }
            })
        },
        /**
         * 创建工作
         * @method createEvent
         * @return {undefined} undefined
        */
        createEvent () {
            // 防止高频重复提交
            if (!this.isSaving) {
                this.isSaving = true
            } else {
                this.$tip.show({
                    message: '正在保存'
                })
                if (!this.timer) {
                    this.timer = setTimeout(() => {
                        this.isSaving = false
                        this.timer = undefined
                    }, 1500)
                }
                return
            }
            if (!this.workInfo.textContent.trim()) {
                this.$tip.show({
                    message: '记事内容不能为空'
                })
                return
            }
            let eventTime = formatDate(new Date(this.$mywork.selectedDayOrigin.time), 'yy-MM-dd')
            const nowTime = formatDate(new Date(), 'hh:mm:ss')
            let data = {
                content: this.workInfo.textContent,
                personName: this.$userInfo.username,
                workSource: '1',
                channel: 'recordWork',
                startDate: eventTime + ' ' + nowTime,
                endDate: eventTime + ' ' + nowTime,
                submitExperience: this.workInfo.submitExperience,
                // 消息数据
                workData: this.workInfo.workData || {},
                noticeTime: 0,
                files: this.files
            }
            let result = Operate.addWork(data)
            result.then(resp => {
                this.$tip.show({
                    message: '已记录，你太棒啦',
                    duration: 1.5
                }).then(val => {
                    this.$proms.compEnd.call(this, {
                        mobileCb: () => {
                            this.$common.urlParams = {}
                            this.$router.go(-1)
                        },
                        webCb: () => {
                            this.$router.go(-1)
                        }
                    })
                })
            })
        },
        setDefaultData () {
            this.workInfo.textContent = this.curWork.content
            this.files = this.curWork.files
        },
        /**
         * 更新工作
         * @method update
         * @return {undefined} undefined
        */
        update () {
            if (!this.workInfo.textContent.trim()) {
                this.$tip.show({
                    message: '记事内容不能为空'
                })
                return
            }
            const pro = Operate.updateWork({
                id: this.curWork.id,
                content: this.workInfo.textContent,
                personName: this.$userInfo.username,
                workSource: '1',
                channel: 'recordWork',
                submitExperience: this.workInfo.submitExperience,
                // 消息数据
                workData: this.workInfo.workData || {},
                noticeTime: 0,
                files: this.files
            })

            pro.then(resp => {
                this.$tip.show({
                    message: '记事修改成功',
                    duration: 1.5
                }).then(val => {
                    this.$router.go(-1)
                })
            })
        }
    }
}
</script>
<style lang="less" scoped>
    .event-main{
        .voice-contaniner{
            width:100%;
            position:fixed;
            bottom:0;
        }
    }
</style>
