<!--与会人列表-->
<template lang="pug">
    .co-workers
      <!--banner-->
      section.co-banner
        a(v-cloak v-for="(item, index) in tabList"  :class="[currTab === index ? 'curr':'']"  @click="changeTab(index)")
          span {{item}} {{numOfList[index]}}
      .co-split
      <!--list  -->
      ul.co-list
          li(v-cloak v-for="item in showList")
              img(:src="item.photoUrl")
              p
                span {{item.name}}
                span {{item | getStatus(currTab)}}

      <!--为空显示-->
      .co-null(v-cloak v-if="nullInfo.isShow === '0' || !nullInfo.isShow" )
          .null-img
            img(:src="nullInfo.img")
          p {{nullInfo.tips}}
      <!--button-->
      a.co-footer(v-if="currTab === 0 && isOwner" :class="{'notified': isNotified}"  @click="showCheckNotify")  一键提醒未响应成员

      <!--&lt;!&ndash;右上角&ndash;&gt;-->
      <!--div.right-corner-mask(v-if="showRightCorner"  :style="_height"  @touchstart="cancelRightCorner")-->
      <!--div.right-corner(v-if="showRightCorner")-->
        <!--a(@click="selectStaff('work')") 添加-->
        <!--a(@click="delWorkers") 删除-->

      <!--// 短信提醒未完成任务的成员-->
      popup(v-if="notifyPop.show"  :title="notifyPop.title" className="check-notify-popup")
          .notify-wrap(slot="content")
              .notify-content 确定以短信提醒所有未完成的成员?
              .notify-check-btns
                 span(@click="notifyPop.show = false") 取消
                 span(@click="confirmNotify") 确定

</template>
<script>
import {mapGetters, mapActions} from 'vuex'
import * as Odds from '@/utils/detail-odds'
import Popup from '@/components/common/Popup'
import * as Requests from '@/api/sendRequest'

export default{
    name: 'CoworkList',
    data () {
        return {
            currTab: 0,  // 按tab顺序
            noResponseList: [],   // 未响应与会人列表
            joinList: [],    // 参加的列表
            notJoinList: [],  // 不参加列表
            notifyPop: {
                show: false,
                title: {
                    show: true,
                    content: '一键提醒'
                }
            },
            isNotified: false,
            showRightCorner: false,
            /*
            *  编辑前后，保存后，staffIds，staffLists，当前操作type（update-更新, recover-恢复原样）
            * */
            beforeStaffIds: [], // 编辑前，保存后的staffIds
            beforeStaffLists: [],
            type: 'update'
        }
    },
    created () {
        XuntongJSBridge.call('closePop')
        this.getMeetingList()
        this.saveStaffList()
        this.setPageTitle()
    },
    methods: {
        ...mapActions(['setCurrentWork']),
        confirmNotify: Odds.confirmNotify,
        selectStaff: Odds.selectStaff,
        setPageTitle () {
            // 设置页面title
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {
                        title: '与会人'
                    })
                },
                webCb: lappmask => {
                    lappmask.resetTitle('与会人')
                }
            })
        },
        getMeetingList () {
            // 获取与会人列表
            Requests.getCoWorkerList({
                meetingId: this.curWork.id
            }).then((resp) => {
                if (resp.success) {
                    let data = resp.data
                    this.noResponseList = data.noResponse || []
                    this.joinList = data.join || []
                    this.notJoinList = data.notJoin || []
                }
            })
        },
        changeTab (index) {
            // 当前Tab
            this.currTab !== index && (this.currTab = index)
        },
        createPop () {
            // 创建右上角
            this.$proms.compEnd.apply(this, [{
                mobileCb () {
                    XuntongJSBridge.call('createPop', {
                        popTitle: '添加',
                        popTitleCallBackId: 'edit'
                    }, (result) => {
                        console.log(result)
                        this.selectStaff('work')
                    })
                },
                webCb (lappmask) {
                    lappmask.removeCreatePop()
                    lappmask.createPop([{
                        text: '添加',
                        callBack: (evt) => {
                            this.selectStaff('work')
                        }
                    }])
                }
            }])
        },
        delWorkers () {
            // 删除协作人
            this.showRightCorner = false
            this.createPop()

            this.$proms.compEnd.apply(this, [{
                mobileCb () {
                    XuntongJSBridge.call('selectPersons', {
                        isMulti: true,
                        range: this.staffIds,
                        isShowMe: false         // 选人组件是否显示自己
                    }, result => {
                        const staffs = result.data.persons
                        staffs.forEach((staff) => {
                            let index = this.staffIds.indexOf(staff.openId)
                            if (index !== -1) {
                                this.staffList.splice(index, 1)
                            }
                        })
                    })
                },
                webCb () {
                    this.$proms.selectPersons({
                        multi: true,
                        success: data => {
                        }
                    })
                }
            }])
        },
        showCheckNotify () {
            if (this.isNotified || this.curWork.unFinishNotice || !this.noResponseList.length) return
            this.notifyPop.show = true
        },
        cancelRightCorner () {
            // 取消右上角
            this.showRightCorner = false
            this.createPop()
        },
        updateCoWorkers () {
            // 更新与会人列表 （增加）
            let diff = Odds.getdiff(this.staffList, this.beforeStaffIds)

            let pro = Requests.updateActorsForM({
                meetingId: this.curWork.id,
                // 增加的协作人
                addOids: diff.addIds.toString(),
                // 被删除的协作人
                delOids: diff.delIds.toString()
            })

            pro.then(resp => {
                if (!resp.success) {
                // 请求失败，还原
                    this.type = 'recover'
                    this.staffList.splice(this.staffList.length - 1, 1)
                } else {
                    const item = this.staffList[this.staffList.length - 1]
                    this.noResponseList.push({
                        readStatus: 0,
                        oid: item.id,
                        name: item.name,
                        photoUrl: item.img
                    })
                    this.saveStaffList()
                }

                !this.$tip.isShow && this.$tip.show({
                    message: `会议修改${resp.success ? '成功' : '失败'}`,
                    duration: 1.5
                }).then(val => {
                })
            })
        },
        saveStaffList () {
            // 保存编辑前的staffList
            this.beforeStaffLists = []
            this.beforeStaffIds = []
            this.staffList.filter(item => {
                this.beforeStaffLists.push(item)
                this.beforeStaffIds.push(item.id)
            })
        }
    },
    watch: {
        staffList () {
            if (this.type === 'recover') {
                this.type = 'update'
                return
            }
            this.showRightCorner = false
            this.createPop()
            this.updateCoWorkers()
        }
    },
    computed: {
        ...mapGetters({
            curWork: 'curWork',
            coWorkers: 'coWorkers'
        }),
        isOwner () {
            // 是否是发起人
            return this.curWork.currentWorkUser.oid === this.curWork.openid
        },
        staffList () {
            // 协作人列表
            return this.coWorkers.staffList ? this.coWorkers.staffList : []
        },
        staffIds () {
            // 协作人列表ID
            let arr = []
            for (let i = 0; i < this.staffList.length; i++) {
                arr.push(this.staffList[i].id)
            }
            return arr
        },
        isFinished () {
            // 默认认为完成了
            const {workStatus = 1} = this.curWork
            // 0 未完成 1 完成了
            return +workStatus === 1
        },
        tabList () {
            return ['未响应', '参加', '不参加']
        },
        showList () {
            // 当前要展示的列表数据
            return (!this.currTab) ? this.noResponseList : this.currTab === 1 ? this.joinList : this.notJoinList
        },
        numOfList () {
            // tab所对应的列表数
            return [this.noResponseList.length ? `(${this.noResponseList.length})` : '', this.joinList.length ? `(${this.joinList.length})` : '', this.notJoinList.length ? `(${this.notJoinList.length})` : '']
        },
        nullInfo () {
            // 为空展示
            return (!this.currTab) ? {img: require(`../../assets/nullOne.png`),
                tips: '所有与会人都已响应',
                isShow: this.noResponseList.length} : {img: require(`../../assets/nullTwo.png`),
                    tips: `${this.currTab === 1 ? '暂无已参加人员' : '暂无不参加人员'}`,
                    isShow: `${this.currTab === 1 ? this.joinList.length : this.notJoinList.length}`}
        },
        _height () {
            return `height:${window.innerHeight}px`
        }
    },
    filters: {
        getStatus (item, currTab) {
            return !currTab ? `${item.readStatus ? '已读' : '未读'}` : currTab === 1 ? '参加' : '不参加'
        }
    },
    components: {
        Popup
    }
}
</script>

<style lang="less" scoped rel="stylesheet/less">
@import '../../css/CoworkersList';
</style>
