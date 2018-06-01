<!--协作人列表-->
<template lang="pug">
    .co-workers
      <!--banner-->
      section.co-banner
        a(v-for="(item, index) in tabList"  :class="[currTab === index ? 'curr':'']"  @click="changeTab(index)")
          span {{item}} {{numOfList[index]}}
      .co-split
      <!--list  -->
      ul.co-list
          li(v-for="item in showList")
              img(:src="item.img")
              p
                span {{item.name}}
                span(v-if="currTab === 0") {{!item.readStatus?'未读': item.acceptStatus === 1 ? '不接受' : item.acceptStatus === 2 ? '接受' : '已读'}}
                span(v-if="currTab === 1") {{ $moment(item.doneTime).format('MM-DD HH:mm')}}

      <!--为空显示-->
      .co-null(v-if="!nullInfo.isShow" )
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
            unDoneList: [],   // 未完成协作人列表
            doneList: [],    // 完成或参加的列表
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
        this.sortStaffList()
        this.setPageTitle()
    },
    methods: {
        ...mapActions(['setCurrentWork']),
        confirmNotify: Odds.confirmNotify,
        selectStaff: Odds.selectStaff,
        setPageTitle () {
            //  设置页面title
            this.$proms.compEnd.call(this, {
                mobileCb: () => {
                    XuntongJSBridge.call('setWebViewTitle', {
                        title: '协作人'
                    })
                },
                webCb: lappmask => {
                    lappmask.resetTitle('协作人')
                }
            })
        },
        sortStaffList () {
            // 列表分类
            this.beforeStaffIds = []
            this.unDoneList = []
            this.doneList = []
            this.staffList.filter((item) => {
                item.workStatus === 0 && (this.unDoneList.push(item))
                item.workStatus === 1 && (this.doneList.push(item))
                this.beforeStaffIds.push(item.id)
                this.beforeStaffLists.push(item)
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
                    console.log(11)
                    XuntongJSBridge.call('createPop', {
                        popTitle: '添加',
                        popTitleCallBackId: 'add'
                    }, (result) => {
                        this.selectStaff('work')
                    //   if (result.success) {
                    //   this.showRightCorner = true
                    // }
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
            // 删除协作人(功能暂屏蔽)
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
                            const staffs = data.data.persons
                            staffs.forEach((staff) => {
                                let index = this.staffIds.indexOf(staff.openId)
                                if (index !== -1) {
                                    this.staffList.splice(index, 1)
                                }
                            })
                        }
                    })
                }
            }])
        },
        showCheckNotify () {
            if (this.isNotified || this.curWork.unFinishNotice || !this.unDoneList.length) return
            this.notifyPop.show = true
        },
        cancelRightCorner () {
            // 取消右上角
            this.showRightCorner = false
            this.createPop()
        },
        updateCoWorkers () {
            // 更新协作人列表 （增加或删除）
            let diff = Odds.getdiff(this.staffList, this.beforeStaffIds)
            const pro = Requests.updateActorsForS({
                workId: this.curWork.id,
                // 当前所有协作人openid
                actorOids: diff.pids.toString(),
                // 增加的协作人
                addOids: diff.addIds.toString(),
                // 被删除的协作人
                delOids: diff.delIds.toString()
            })

            pro.then(resp => {
                if (!resp.success) {
                    // 请求失败，还原
                    this.type = 'recover'
                    this.staffList.splice(0, this.staffList.length)  // 清空数组
                    this.beforeStaffLists.forEach((item) => {
                        this.staffList.push(item)
                    })
                } else {
                    // 更新协作人显示列表showList
                    this.sortStaffList()
                }
                !this.$tip.isShow && this.$tip.show({
                    message: `日程修改${resp.success ? '成功' : '失败'}`,
                    duration: 1.5
                }).then(val => {})
            })
        }
    },
    watch: {
        staffList () {
            if (this.type === 'recover') {
            // 更新协作人显示列表showList
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
        isFinished () {
            // 默认认为完成了
            const {workStatus = 1} = this.curWork
            // 0 未完成 1 完成了
            return +workStatus === 1
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
        tabList () {
            return ['未完成', '已完成']
        },
        showList () {
            // 当前要展示的列表数据
            return (!this.currTab) ? this.unDoneList : this.doneList
        },
        numOfList () {
            // tab所对应的列表数
            return [this.unDoneList.length ? `(${this.unDoneList.length})` : '', this.doneList.length ? `(${this.doneList.length})` : '']
        },
        nullInfo () {
            // 为空展示
            return (!this.currTab) ? {img: require(`../../assets/nullOne.png`),
                tips: '所有协作人都已完成',
                isShow: this.unDoneList.length
            } : {
                img: require(`../../assets/nullTwo.png`),
                tips: '暂无已完成人员',
                isShow: this.doneList.length
            }
        },
        _height () {
            return `height:${window.innerHeight}px`
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
