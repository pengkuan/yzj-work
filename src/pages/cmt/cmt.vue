<template lang="pug">
    .cmt-wrap
      .cmt-content(:class="showCmt ? 'cmt-left' : 'cmt-right'")
          textarea(v-cloak="" @focus="handerFocus" v-model="content" ref="$text"  :placeHolder="placeholder" maxLength="5000" @blur="focusBox" @textInput="checkAt")
      .opt-infos(v-show="showTaskGenerator || (content.length > 4000)")
        label.add-relative-schedule(v-show="showTaskGenerator" :class="{'at-disabled': !atEnable}")
            input(type="checkbox" :checked="generateTaskStatus" @change="toggleGenerateTaskStatus")
            span(:class="generateTaskIconCls")
            span.label-content 给@成员生成日程
        .count-remainder(:class="overFontNum ? 'over-count' : ''" v-show="content.length > 4000" ) {{ content.length }}/5000
      .cmt-opt(v-if="$proms.isMobile || atAble")
        span.opt-phiz.opt-item(v-if="isMobile" :class="tabType==='phiz'?'curr':''"  @click="selectTab(tabType)")
            i.iconfont
        span.opt-at.opt-item(v-if="atAble" @click="selectPerson")
            i.iconfont &#xea9a;
        FileUploadCmt.opt-item(v-model="files" v-if="$proms.isMobile" @closephiz = "closePhiz")
      .opt-content
          phiz(v-if="tabType === 'phiz'"
                @closephiz = "closePhiz"
                @getphiz="getPhiz"
                @delphiz="del_Phiz")
      .fileList
          FileField(v-model="files"
            :type="2")
</template>

<script>
    import { mapGetters } from 'vuex'
    import Phiz from '@/components/phiz/phiz.vue'
    import setCursort from '@/components/phiz/cursortPosition'
    import FileUploadCmt from '@/components/fileField/FileUploadCmt'
    import FileField from '@/components/fileField/FileField'
    import webSelect from '@/modules/selectPerson'
    import * as Operate from '../works/operate'
    import { acceptwork } from '@/api/sendRequest'
    import env from '@/config/env.config'

    const atSymbelReg = '@(?!@)(.{2,100}?)\\s+'

    export default {
        data () {
            return {
                atEnable: false,
                isIMEEnter: false,
                generateTaskStatus: false,
                selectedPersonMap: {},
                content: '',
                tipTxt: '',
                showCmt: false,
                // placeholder: '请输入回复内容.....',
                replyId: '', // 被回复人的Id，为空则为回复该帖子
                isSending: false, // 是否正在发送中
                tabType: '',
                files: [],
                isMobile: /Android|iPhone|iPad/g.test(navigator.userAgent),
                tag: '' // 记录是回复（cmt）或者是会议纪要(record)
            }
        },
        watch: {
            content: function (newVal, oldVal) {
                // 内容区域允许为空。当“内容区”内容变化时，动态切换“右上角”的“操作按钮”
                if (this.contentEmptyable) {
                    if (!newVal) { // 内容为空，设置“右上角”为“跳过”
                        this.setRightCornerWithSkip()
                    } else if (!oldVal) { // 内容区有“内容”，设置“右上角”为“提交”
                        this.setRightCorner()
                    }
                }
                const reg = new RegExp(atSymbelReg)
                this.atEnable = this.generateTaskStatus = reg.test(newVal)
            }
        },
        computed: {
            ...mapGetters({
                curWork: 'curWork'
            }),
            overFontNum () {
                return this.content.length >= 5000
            },
            atAble () {
                const { type } = this.curWork
                return this.isCreater && !this.curWork.record && (type === 'meeting') && this.isSummary
            },
            generateTask () {
                return this.atEnable && this.generateTaskStatus
            },
            generateTaskIconCls () {
                if (this.generateTaskStatus) {
                    return ['iconfont', 'icon-xuanzegou']
                }
                return ['checkbox-icon']
            },
            showTaskGenerator () {
                if (!this.atAble || this.curWork.record) {
                    return false
                }
                return true
            },
            isCreater () {
                const {
                    openid: creatorId,
                    currentWorkUser: { oid: currentUserId } = {}
                } = this.curWork
                return creatorId === currentUserId
            },
            pageTitle () {
                let _title = '回复'
                if (this.isSummary) {
                    const { type } = this.curWork
                    if (type === 'schedule') {
                        if (this.isCreater) {
                            _title = '日程总结'
                        } else {
                            _title = '日程意见'
                        }
                    } else {
                        if (this.isCreater) {
                            _title = '会议记要'
                        } else {
                            _title = '会议意见'
                        }
                    }
                }
                return _title
            },
            placeholder () {
                let placeholder = '请输入回复内容.....'
                if (this.isSummary) {
                    const { type } = this.curWork
                    if (type === 'schedule') {
                        if (this.isCreater) {
                            placeholder = '输入日程总结'
                        } else {
                            placeholder = '输入日程意见'
                        }
                    } else {
                        if (this.isCreater) {
                            placeholder = '输入会议记要'
                            // 如果是第一次提交“会议纪要”
                            if (this.atAble) {
                                placeholder = '输入会议记要, 可以@成员，并生成日程'
                            }
                        } else {
                            placeholder = '输入会议意见'
                        }
                    }
                }
                return placeholder
            },
            isSummary () {
                return this.tag === 'record'
            },
            // 内容区是否允许不输入内容：初次填写的日程总结、日程意见允许为“空”。其他情况，内容区都是“必填”的
            contentEmptyable () {
                const {type, record} = this.curWork
                return this.isSummary && (type === 'schedule') && !record
            }
        },
        created () {
            this.replyId = this.$route.params.replyid
            this.tag = this.$route.params.tag || 'cmt'
            this.setPageTitle()
            // “内容”允许为空。默认设置“右上角”为“跳过”
            if (this.contentEmptyable) {
                this.setRightCornerWithSkip()
            } else {
                this.setRightCorner()
            }
        },
        mounted () {
            this.$nextTick(() => {
                this.$refs.$text.focus()
            })
        },
        methods: {
            handerFocus () {
                this.$refs.$text.focus()
            },
            toggleGenerateTaskStatus (e) {
                if (this.atEnable) {
                    this.generateTaskStatus = e.target.checked
                }
            },
            // 输入@的时候，调用选人桥
            checkAt (e) {
                if (!this.atAble) {
                    return
                }
                const inputText = e.data
                if (inputText.length === 1) {
                    const keyCode = inputText.charAt(0)
                    if (keyCode === '@') {
                        this.selectPerson()
                    }
                }
            },
            /**
             * @deprecated 使用textInput代替
             */
            // 输入@的时候，调用选人桥
            old_checkAt (e) {
                if (!this.atAble) {
                    return
                }
                const condition1 = e.shiftKey && e.code === 'Digit2'
                const condition2 = e.key === '@'
                const condition3 = e.shiftKey && e.keyCode === 50
                if (condition1 || condition2 || condition3) {
                    this.selectPerson(!/@$/.test(this.content))
                }
            },
            selectPerson (prePendAt = false) {
                const me = this
                me.tabType = 'file'
                me.$proms.compEnd.call(me, {
                    webCb: () => {
                        webSelect({
                            multi: true,
                            needSession: false,
                            needContract: false,
                            success: persons => {
                                me.$nextTick(() => {
                                    me.insertPerson(persons, prePendAt)
                                })
                            },
                            cancel: () => {
                            }
                        })
                    },
                    mobileCb: () => {
                        XuntongJSBridge.call('selectPersons', {
                            isMulti: true,
                            isShowMe: false,
                            selected: [],
                            ignore: []
                        },
                        ({ success, data }) => {
                            if (`${success}` === 'true') {
                                const {persons} = data
                                me.insertPerson(persons, prePendAt)
                            }
                        })
                    }
                })
            },
            // 将选中的“人员”插入到文本中
            insertPerson (persons = [], prePendAt) {
                const me = this
                const selectedPerson = []
                // 对于通过点击'@'添加人员的情况，需要手动添加@
                const atText = prePendAt ? '@' : ''
                persons.map(person => {
                    const name = person.personName || person.name
                    const oid = person.oId || person.openId
                    me.selectedPersonMap[`@${name}`] = oid
                    selectedPerson.push(`${name} `)
                })
                setCursort.insertTextToInput(me.$refs.$text, `${atText}${selectedPerson.join('@')}`)
                me.content = this.$refs.$text.value
            },
            // 获取每一个“日程”的信息
            getTaskInfo (content) {
                const reg = new RegExp(atSymbelReg, 'g')
                const result = { content: content }
                const personIdNameMap = {}
                let matches
                while ((matches = reg.exec(content))) {
                    const personName = matches[1]
                    const personId = this.selectedPersonMap[`@${personName}`]
                    if (personId) {
                        personIdNameMap[personId] = personName
                    }
                }
                if (Object.keys(personIdNameMap).length) {
                    result.personIds = []
                    result.personNames = []
                    for (const key of Object.keys(personIdNameMap)) {
                        result.personIds.push(key)
                        result.personNames.push(personIdNameMap[key])
                    }
                }
                return result
            },
            // 生成“关联日程”列表
            generateRelativeTask () {
                const taskInfo = this.getTaskInfo(this.content)
                if (taskInfo.personIds) {
                    const data = this.getWorkInfo(taskInfo)
                    return Operate.addWork(data)
                }
                return Promise.reject()
            },
            // 获取“关联日程”的信息
            getWorkInfo ({ content, personIds, personNames }) {
                let { origin, protocol, host } = window.location
                if (!origin) {
                    origin = `${protocol}//${host}`
                }
                // 开始时间： = 当前时间+10分钟
                const startDate = this.$moment().add(10, 'minutes')
                return {
                    content: content,
                    personName: this.$userInfo.username,
                    workSource: '1',
                    // 当前所有协作人openid
                    actorOpenids: personIds.join(','),
                    actorNames: personNames.join(','),
                    startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
                    // 结束时间： 开始时间后1小时
                    endDate: startDate.add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                    topState: 0,
                    submitExperience: false,
                    // 消息数据
                    workData: {
                        attachContent: {
                            lightAppId: env.appId,
                            appName: '时间助手',
                            thumbUrl: `${origin}/mywork/static/public-group.png`,
                            title: this.curWork.content,
                            webpageUrl: this.getIndexUrl()
                        },
                        attachUrl: this.getIndexUrl(),
                        originateDate: this.$moment(+this.curWork.createDate).format('YYYY-MM-DD HH:mm:ss.SSS'),
                        originator: this.$userInfo.username,
                        originatorPhotoUrl: this.$userInfo.photoUrl
                    },
                    // 提前5分钟提醒
                    noticeTime: 5
                }
            },
            getIndexUrl () {
                const { fullPath } = this.$route
                const serverRootUrl = window.location.href.replace(new RegExp(`${fullPath}([/?].+)?`), '')
                return `${serverRootUrl}?workid=${this.curWork.id}&workType=meeting`
            },
            closePhiz () {
                // 聚焦
                this.tabType = ''
            },
            setPageTitle () {
                const pageTitle = this.pageTitle
                this.$proms.compEnd.call(this, {
                    mobileCb: () => {
                        // XuntongJSBridge.call('setWebViewTitle', {'title': `${this.tag === 'record' ? '会议纪要' : '回复'}`})
                        XuntongJSBridge.call('setWebViewTitle', { title: pageTitle })
                    },
                    webCb: lappmask => {
                        lappmask.resetTitle(pageTitle)
                    }
                })
            },
            // 设置右上角为“跳过”
            setRightCornerWithSkip () {
                // 创建右上角
                this.$proms.compEnd.apply(this, [{
                    mobileCb () {
                        XuntongJSBridge.call('createPop', {
                            popTitle: '跳过',
                            popTitleCallBackId: 'cancel'
                        },
                        result => {
                            if (this.isSending) return
                            this.isSending = true
                            this.sendCmt()
                        })
                    },
                    webCb () {
                        this.$proms.onLappReady().then(lappmask => {
                            lappmask.removeCreatePop()
                            lappmask.createPop([{
                                text: '跳过',
                                callBack: evt => {
                                    this.sendCmt()
                                }
                            }])
                        })
                    }
                }])
            },
            setRightCorner () {
                // 创建右上角
                this.$proms.compEnd.apply(this, [{
                    mobileCb () {
                        XuntongJSBridge.call('createPop', {
                            popTitle: '提交',
                            popTitleCallBackId: 'send'
                        },
                        result => {
                            if (this.isSending) return
                            this.isSending = true
                            this.sendCmt()
                        })
                    },
                    webCb (lappmask) {
                        lappmask.removeCreatePop()
                        lappmask.createPop([{
                            text: '发送',
                            callBack: evt => {
                                this.sendCmt()
                            }
                        }])
                    }
                }])
            },
            sendCmt () {
                // 发送
                if (!this.contentEmptyable && !this.content.trim()) {
                    this.tipsBox(`内容不能为空`)
                    this.isSending = false
                    return
                }
                // del whitespaces in right end of content
                const regExp = /[\s ]+$/g
                const replyForRefuseType = this.$route.params.replyForRefuseType
                const changeStatus = this.$route.params.changeStatus
                if (replyForRefuseType) {
                    changeStatus ? this.changeAcceptStatus(this.content.replace(regExp, '')) : this.handlerAccept(this.content.replace(regExp, ''))
                    this.$router.go(-1)
                    return
                }
                // 数据
                let params = {
                    workId: this.curWork.id,
                    beReplyOpenId: this.replyId,
                    content: this.content.replace(regExp, ''),
                    commentType: `${this.curWork.type === 'schedule' ? 'task' : 'meeting'}`,
                    files: this.files
                }

                let url = '/cloudwork/comment/add'
                if (this.isSummary) {
                    // 会议纪要、会议意见接口
                    url = '/cloudwork/comment/addReplaceByTag'
                    const { type } = this.curWork
                    // 日程总结、日程意见接口
                    if (type === 'schedule') {
                        url = '/cloudwork/work/finishworkwithcomment2'
                    }
                    params.tags = ['record']
                    params.openId = this.$userInfo.openid
                }
                // 请求数据
                this.$http.post(url, params).then(resp => {
                    this.isSending = false
                    if (resp.success) {
                        // 没有“关联日程”，直接重置content
                        if (!this.generateTask) {
                            this.content = ''
                        }
                        // 如果传入了“内容”， 才显示tips
                        if (this.content) {
                            this.showTips(this.isSummary ? `发送${this.pageTitle}成功` : '回复成功')
                        } else { // 没有“内容”（目前只允许日程的“总结、意见”不提交“内容”）。在“详情页”显示状态
                            // 如果是“没有总结、意见的"日程，在“详情页”弹出tips
                            sessionStorage.setItem(`${this.curWork.id}-tips`, true)
                        }
                        // 只有手机端的“日程”需要触发勋章
                        const { type } = this.curWork
                        if (type === 'schedule' && this.$proms.isMobile) {
                            // 如果触发了勋章，则写入sessionStorage 在详情页展示
                            const {data: {award = '', awardUrl = ''} = {}} = resp
                            if (award && awardUrl) {
                                sessionStorage.setItem(`${this.curWork.id}`, JSON.stringify({award, awardUrl}))
                            }
                        }
                        // 不需要生成“关联日程”,回退到详情页
                        if (!this.generateTask) {
                            // 回退到详情页
                            this.$router.go(-1)
                            // 阻止进一步”操作“
                            return Promise.reject()
                        }
                        // 需要生成“关联日程” -> 继续创建”相关日程“
                        return Promise.resolve()
                    } else {
                        this.showTips(this.isSummary ? `发送${this.pageTitle}失败` : '回复失败')
                        // 阻止进一步操作
                        return Promise.reject()
                    }
                })
                .then(() => {
                    if (!this.atEnable) {
                        return
                    }
                    this.generateRelativeTask()
                    .then(({ success, error, errorCode }) => {
                        this.content = ''
                        if (`${success}` !== 'true') {
                            this.showTips('日程没关联成功，再试试吧')
                            .then(() => {
                                this.$router.go(-1)
                            })
                        } else {
                            this.$router.go(-1)
                        }
                    })
                    .catch(() => {
                        this.showTips('网络错误，请稍后重试')
                    })
                })
            },
            showTips (msg) {
                return this.$tip.show({
                    message: msg
                })
            },
            handlerAccept (reason) {
                let data = {}
                if (this.$route.params.replyForRefuseType === 1) {
                    data = {
                        workId: this.curWork.id,
                        acceptStatus: 1, // 1代表不接受
                        reason: reason || ''
                    }
                } else {
                    data = {
                        meetingId: this.curWork.id,
                        joinStatus: 1,
                        reason: reason || ''
                    }
                }
                acceptwork(this.$route.params.replyForRefuseType, data).then(resp => {
                    if (resp.success === true) {
                        let tempObj = Object.assign({}, {currentWorkUser: Object.assign({}, this.curWork.currentWorkUser, {acceptStatus: status})})
                        this.setCurWorkStatus(tempObj)
                        this.isAccept = false
                        let cmtObj = {
                            photoUrl: this.$userInfo.photoUrl,
                            nickName: this.$userInfo.username,
                            openId: this.$userInfo.openid,
                            content: reason,
                            createDate: new Date().getTime()
                        }
                        this.$bus.$emit('addComment', cmtObj)
                    } else {
                        this.$tip.show({
                            message: '小云可能累了，请稍后再试'
                        })
                    }
                }, () => {
                    this.$tip.show({
                        message: '网络错误，请稍后再试'
                    })
                })
            },
            // 修改响应状态 status => 1: 不参加  2: 参加
            changeAcceptStatus (reason) {
                const me = this
                const {id: meetingId, joinCount} = me.curWork
                this.updateMeetingAcceptStatus({meetingId, status: 1, reason})
                .then(result => {
                    if (`${result.success}` === 'true') {
                        me.$tip.show({ message: '会议邀请状态已修改成功', duration: 1.5 })
                        const cmtObj = {
                            photoUrl: me.$userInfo.photoUrl,
                            nickName: me.$userInfo.username,
                            openId: me.$userInfo.openid,
                            content: reason,
                            createDate: new Date().getTime()
                        }
                        me.$bus.$emit('addComment', cmtObj)
                        // 参加： +1    不参加： -1
                        const newCount = -1
                        me.setCurWorkStatus({'joinCount': joinCount + newCount})
                    } else {
                        me.$tip.show({ message: result.error, duration: 1.5 })
                    }
                })
                .catch(() => {
                    me.$tip.show({ message: '网络异常，请稍后重试！！', duration: 1.5 })
                })
            },
            tipsBox (txt) {
                if (txt) {
                    this.$tip.show({
                        message: txt
                    }).then(val => {
                        this.$proms.compEnd.call(this, {})
                    })
                }
            },
            selectTab (type) {
//                console.log('type>>>>:', type)
                type !== 'phiz' && (this.tabType = 'phiz')
                type === 'phiz' && (this.tabType = '')
            },
            /*
            * 获取光标插入文本
            *
            */
            focusBox () {
                setCursort.getCursorPosition(this.$refs.$text)
            },
            getPhiz (phiz) {
                // 表情回调
                setCursort.insertTextByRecord(this.$refs.$text, phiz)
                this.content = this.$refs.$text.value
            },
            del_Phiz () {
                setCursort.delPhiz(this.$refs.$text)
                this.content = this.$refs.$text.value
            }
        },
        components: {
            Phiz,
            FileField,
            FileUploadCmt
        }
    }
</script>

<style lang="less" rel="stylesheet/less" scoped>
    .cmt-wrap {
      position: relative;
    }
    .cmt-content {
      height: 100%;
      width: 100%;
      background: #fff;
      textarea {
        width: 100%;
        height: 2.22rem;
        padding: 0.15rem;
        font-size: 0.16rem;
      }
    }
    .cmt-left {
      -webkit-animation: slideLeft 40s linear infinite;
    }
    .cmt-right {
      -webkit-animation: slideRight 40s linear infinite;
    }
    @-webkit-keyframes slideLeft {
      from {
        left: 100%;
      }
      to {
        left: 0;
      }
    }
    @-webkit-keyframes slideRight {
      from {
        left: 0;
      }
      to {
        left: 100%;
      }
    }
    @keyframes slideLeft {
      from {
        left: 100%;
      }
      to {
        left: 0;
      }
    }
    @keyframes slideRight {
      from {
        left: 0;
      }
      to {
        left: 100%;
      }
    }
    .opt-infos {
        background: #fff;
        display: flex;
        padding: 0 0.19rem;
        flex-direction: row;
        height: 0.4rem;
        justify-content: space-between;
        align-items: center;
        .add-relative-schedule {
          flex: none;
          font-size: 0;
          line-height: 0;
          input {
            display: none;
          }
          &.at-disabled {
              color: #a4a8ab;
              .checkbox-icon {
                border: 1px solid #dfe2e3;
              }
              .label-content {
                  color: #a4a8ab;
              }
          }
          .checkbox-icon {
            display: inline-block;
            margin-right: 0.06rem;
            width: 0.16rem;
            height: 0.16rem;
            border-radius: 50%;
            border: 1px solid #4598F0;
            box-sizing: border-box;
            vertical-align: middle;
          }
          .iconfont.icon-xuanzegou {
            display: inline-block;
            font-size: .152rem;
            color: #4598F0;
            vertical-align: middle;
            margin-right: .06rem;
          }
          .label-content {
            display: inline-bloc;
            font-size: 0.13rem;
            color: rgba(39, 39, 39, 1);
            line-height: 0.17rem;
            vertical-align: middle;
          }
        }
        .count-remainder {
          flex: 1;
          color: #889aa4;
          font-size: 0.13rem;
          direction: rtl;
        }
        .over-count{
            color: #EA5950;
        }
    }
    .cmt-opt {
      position: relative;
      height: 0.44rem;
      line-height: 0.44rem;
      padding: 0;
      background: #fff;

      &::after, &::before {
        content: '';
        position: absolute;
        width: 100%;
        border-bottom: solid 1px #dce3e7;
        -webkit-transform-origin: 100% 0;
        transform-origin: 100% 0;
        -webkit-transform: scaleY(0.5);
        transform: scaleY(0.5);
        color: #dce3e7;
      }
      &::before {
          left: 0;
          top: 0;
      }
      &::after {
          left: 0;
          bottom: 0;
      }
      .opt-item {
          display: inline-block;
          width: .88rem;
          height: .44rem;
          line-height: .44rem;
          text-align: center;
          vertical-align: middle;
          padding: 0 !important;
          margin: 0 !important;
          color: #768893;
          cursor: pointer;
          .iconfont {
              font-size: .19rem;
          }
      }

      .opt-phiz {
        position: relative;
        display: inline-block;
        margin-right: 0.42rem;
        color: #768893;
        i:after {
          content: "\e633";
          font-size: 0.19rem;
        }
      }
      .curr {
        i:after {
          content: "\ea04";
          color: #4598f0;
          font-size: 0.19rem;
        }
      }
    }
    .opt-content {
      position: relative;
      .phizWrap {
        position: absolute;
        z-index: 1;
        top: 0;
      }
    }
</style>

