<template lang="pug">
.work-editor
    .work-con
        textarea.work-text(v-model="workText"
            ref="workText"
            :placeholder="placeholder" maxLength="5000")
    .work-num
        .txt-count(:class="overFontNum ? 'over-count' : ''" v-show="workText.length > 4000" ) {{ workText.length }}/5000
    .work-voice(@click="voiceInput"
                v-if="$proms.isMobile")
        i.iconfont.icon-yuyinshuru1
</template>
<script>
import creatorMix from '@/mixins/creatorMix'
import {mapGetters, mapActions} from 'vuex'

export default {
    name: 'ContentEditor',
    mixins: creatorMix,
    props: {
        workText: {
            type: String
        },
        placeholder: {
            type: String
        }
    },
    data () {
        return {}
    },
    computed: {
        ...mapGetters({
            coWorkers: 'coWorkers'
        }),
        overFontNum () {
            return this.workText.length >= 5000
        }
    },
    watch: {
        workText (newVal) {
            this.$emit('textchange', newVal)
        }
    },
    methods: {
        ...mapActions(['setCoworkers', 'setWorkDate']),
        // 语音录入
        voiceInput () {
            if (this.coWorkers.type === 'meeting' && this.workText === '') {
                this.$common.datalyEvent({event: '新建会议点击语音'})
            } else if (this.coWorkers.type === 'schedule' && this.workText === '') {
                this.$common.datalyEvent({event: '新建日程点击语音'})
            }
            const _this = this
            XuntongJSBridge.call('voiceRecognize', {}, response => {
                // this.workText += response.data.text
                // if (response.data.text) {}
                _this.getNlpResult(response.data.text).then(text => {
                    _this.workText += text
                })
            })
        },

        // 自然语言分析，并对返回结果进行处理
        getNlpResult (text) {
            let dataStr = this.$qs.stringify({
                statement: text,
                currentDateTime: Date.now(),
                subjectId: this.$userInfo.openid,
                tenantId: this.$userInfo.eid
            })
            const _this = this
            return new Promise((resolve, reject) => {
                _this.$http.post('/cloudwork/nlp/semantics', dataStr).then(resp => {
                    if (!resp.success) {
                        reject(resp)
                        return
                    }
                    let nameMeaning = resp.data.nameMeaning
                    let timeRec = resp.data.temporalMeaning

                    nameMeaning.hitIndexes.forEach(item => {
                        let name = resp.data.terms[item].content

                        let staffs = _this.coWorkers.staffList || []
                        if (nameMeaning.names[name].length) {
                            let info = nameMeaning.names[name][0]
                            text = text.replace(name, info.name)
                            if (staffs.every(item => item.id !== info.oid)) {
                                staffs.push({
                                    id: info.oid,
                                    img: info.avatar,
                                    name: info.name
                                })
                            }
                            this.$parent.$refs.coworkers._data.staffList = staffs
                        }
                    })
                    let start = timeRec.hitIndexes.length
                        ? this.$moment(timeRec.startDateTime).format('YYYY-MM-DD HH:mm:ss') : ''
                    if (start) {
                        const workDate = {}
                        workDate.startDate = start
                        workDate.endDate = this.$moment(timeRec.endDateTime).format('YYYY-MM-DD HH:mm:ss')
                        this.setWorkDate(workDate)
                    }
                    resolve(text)
                })
            })
        }
    }
}
</script>
<style lang="less" scoped>
.work-editor{
    display: flex;
    min-height:1rem;
    background:#fff;
    box-sizing: border-box;
    padding:.20rem .16rem 0 .16rem;
    position: relative;
    padding-bottom: 0;
    .work-detail_check{
        flex:0 .16rem;
        padding-top: .04rem;
        text-align: center;
        box-sizing: border-box;
        padding-right: .12rem;
    }

    .iconfont{
        color: #768893;
    }
    .work-creater{
        position: absolute;
        bottom: .12rem;
        left: .12rem;
        color: #A4A8AB;
        font-size: .12rem;
    }
    .work-con{
       flex:1;
        margin-bottom: .42rem;
    }
    .work-text{
        width:100%;
        min-height: 1.4rem;
        box-sizing: border-box;
        padding: 0;
        font-size: .16rem;
    }
    .work-voice{
        text-align: right;
        flex-basis:.24rem;
        flex-grow: 0;
        flex-grow: 0;
        &:active{
            opacity: .5;
        }
    }
    .work-num{
        direction: rtl;
        position: absolute;
        bottom:0;
        width:95%;
        padding: 0 0.19rem;
        align-items:center;
        display:block;
        overflow-x:hidden;
        .txt-count{
            height: 0.4rem;
            line-height:.4rem;
            color: #889aa4;
            font-size: 0.13rem;
        }
        .over-count{
            color: #EA5950;
        }
    }

}
</style>

