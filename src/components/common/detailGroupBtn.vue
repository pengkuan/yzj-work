
<template lang="pug">
    .group-wrap
        .group-btn.border-t
                .btn.btn-highlight(v-if="isShowBtn && isRelevantPerson"
                    @click="handlerAccept(2)") {{joinTxt}}
                entrust(v-if="isEntrustBtn" @acceptEntrust="acceptEntrust")
                .btn(@click="handerRefuse" v-if="isShowBtn && isRelevantPerson") {{noJoinTxt}}
                .btn(v-if="showReplyBtn" @click="commentEvent()" type="button") 回复


        refuseToggle(:popUp="popUp"
            :type="type"
            @refuse="handlerAccept"
            @cancelRefuse="cancelRefuse")

        popup(v-if="isShowPopup" :show="isShowPopup" :title="comPupTitle"
            class="check-confirm-popup")
            .work-wrap(slot="content")
                .work-content.center {{popupContent}}
                .work-check-btns
                    span(@click="optUpdate(false)") 我知道了
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import { acceptwork } from '@/api/sendRequest'
import refuseToggle from '@/components/common/refuseToggle'
import Popup from '@/components/common/Popup.vue'
import Entrust from '@/components/common/entrust.vue'

export default {
    props: {
        type: {
            type: Number,
            default: 1 // 1、日程 2 会议
        }
    },
    computed: {
        ...mapGetters({
            curWork: 'curWork'
        }),
        isRelevantPerson () {
            return (!!this.curWork.currentWorkUser) && (!!this.curWork.currentWorkUser.oid) &&
                (this.curWork.currentWorkUser.workStatus !== 2)
        },
        // 开始时间距离当前时间的分钟间隔
        gapMin () {
            return -(this.$moment().diff(this.curWork.endDate, 'seconds') / 60)
        },
        isMyWork () {
            return this.$userInfo.openid === this.curWork.openid
        },
        // 是否逾期
        isOutDate () {
            return this.gapMin < 0
        },
        isShowBtn () {
            const isTask = `${this.type}` === '1'
            const isMeeting = `${this.type}` === '2'
            let isOutDate = this.isOutDate
            // 日程“逾期”，不做处理。
            if (isTask) {
                isOutDate = false
            } else if (isMeeting) { // 会议“取消”后，不显示“接受、不接受”按钮
                const {cancelTime} = this.curWork
                if (cancelTime) {
                    return false
                }
            }
            // 以下情况不显示接受不接受按钮 1、发起人 2、已完成  3、已响应 4、逾期
            return !isOutDate &&
                (this.curWork.currentWorkUser && this.curWork.currentWorkUser.workStatus !== 1) &&
                this.curWork.workStatus !== 1 &&
                !this.isMyWork &&
                this.isAccept &&
                (this.curWork.currentWorkUser && this.curWork.currentWorkUser.acceptStatus === 0)
        },
        showReplyBtn () {
            const isMeeting = `${this.type}` === '2'
            // 会议“取消”后，不显示“回复”
            if (isMeeting) {
                const {cancelTime} = this.curWork
                if (cancelTime) {
                    return false
                }
            }
            return !this.isShowBtn && this.isRelevantPerson
        },
        isEntrustBtn () {
            // 是否显示委托按钮
            // 1、从委托分享进来   2、从会议详情进来并且符合isShowBtn
//            console.log('???isEntrustBtn???', this.curWork)
            return this.curWork.type === 'meeting' && (this.gapMin > 0 && !this.isMyWork && this.curWork.clientOid &&
                this.curWork.workStatus !== 1) ||
                (!this.curWork.clientOid && this.isShowBtn)
        }
    },
    data () {
        return {
            popUp: false,
            isAccept: true,
            joinTxt: this.type === 1 ? '接受' : '参加',
            noJoinTxt: this.type === 1 ? '不接受' : '不参加',
            tips: this.type === 1 ? '已接受' : '已参加',
            isShowPopup: false,
            popupContent: '已为你生成新的会议日程',
            comPupTitle: {
                show: true,
                content: ' '
            }
        }
    },
    methods: {
        ...mapActions(['setCurWorkStatus']),
        handerRefuse () {
            this.popUp = true
            if (this.type === 1) {
                this.$common.datalyEvent({ event: '点击日程不接受' })
            } else {
                this.$common.datalyEvent({ event: '点击会议不参与' })
            }
        },
        handlerAccept (status, reason) {
            if (status === 0) { // 为0时代表手动输入回复
                this.commentEvent(true)
                return
            }
            let data = {}
            if (this.type === 1) {
                data = {
                    workId: this.curWork.id,
                    acceptStatus: status,
                    reason: reason || ''
                }
                this.$common.datalyEvent({ event: '点击日程接受' })
            } else {
                data = {
                    meetingId: this.curWork.id,
                    joinStatus: status,
                    reason: reason || ''
                }
                this.$common.datalyEvent({ event: '点击会议参与' })
            }
            acceptwork(this.type, data).then(resp => {
                if (resp.success === true) {
                    let tempObj = Object.assign({}, {currentWorkUser: Object.assign({}, this.curWork.currentWorkUser, {acceptStatus: status})})
                    this.setCurWorkStatus(tempObj)
                    if (status === 2) {
                        this.$tip.show({
                            message: this.tips
                        }).then(() => {
                            this.isAccept = false
                            // 更新与会人或协作人数字
                            this.$bus.$emit('changeJoinStatus')
                        })
                    } else {
                        this.isAccept = false
                        // 更新curWork的acceptStatus字段 是日程变成不可编辑状态
                        /*
                        let tempObj = Object.assign({}, {currentWorkUser: Object.assign({}, this.curWork.currentWorkUser, {acceptStatus: 1})})
                        this.setCurWorkStatus(tempObj)
                        */
                        let cmtObj = {
                            photoUrl: this.$userInfo.photoUrl,
                            nickName: this.$userInfo.username,
                            openId: this.$userInfo.openid,
                            content: reason,
                            createDate: new Date().getTime()
                        }
                        this.$bus.$emit('addComment', cmtObj)
                    }
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
        cancelRefuse () {
            this.popUp = false
        },
        commentEvent (isReplyForRefuse) {
            if (this.type === 1) {
                this.$common.datalyEvent({ event: '日程回复' })
            } else {
                this.$common.datalyEvent({ event: '会议回复' })
            }
            this.$router.push({name: 'Cmt', params: { replyid: '', replyForRefuseType: isReplyForRefuse ? this.type : null }})
        },
        optUpdate (status) {
            this.isShowPopup = status
        },
        acceptEntrust (status) {
            this.isShowPopup = status
        }
    },
    components: {
        refuseToggle,
        Popup,
        Entrust
    }
}
</script>

<style lang="less">
.group-btn {
    position: fixed;
    bottom: 0;
    display: flex;
    height: .44rem;
    width: 100%;
    line-height: .44rem;
    padding-top: 1px;
    .btn {
        flex: 1;
        color: #4598F0;
        text-align: center;
        cursor: pointer;
        background: #fff;

        /*&:nth-child(3) {*/
            &::before {
                content: "";
                position: absolute;
                display: block;
                top: .13rem;
                height: 18px;
                width: 1px;
                background: #E6E8EE;
            }
        /*<!--}-->*/
        &:nth-child(1){
            &::before {
                content: "";
                position: absolute;
                display: block;
                top: .13rem;
                height: 0;
                width: 0px;
            }
        }
        &:active{
            /*opacity: .5;*/
            background: #F3F4F5;
            color:rgba(60,186,255,.5)
        }
    }
    .btn-highlight{
        background: #4598F0;
        color: #fff;
    }

}

.work-check-btns {
 span:first-child {
     color: #4598F0 !important;
 }
}
</style>
