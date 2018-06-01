<template lang="pug">
  .cmt-list
      .cmt-list-box(v-cloak :class="{'cmt-list-data': !!filtedCmtList.length}")
          p {{sectionLabel}}{{ filtedCmtList.length ? `(${cmtNum})` : ''}}
          ul.cmt-list-display
            li(v-for="(item, index) in filtedCmtList" :key="item.id"  @click="cmtEvent(item)")
                img(:src="item.photoUrl")
                p
                  span.cmt-name {{item.nickName}}
                    i.time {{ $moment(item.createDate).format('MM-DD HH:mm')}}
                    //- iconfont在ios上有问题，暂时采用css绘制的方式
                    //- i.iconfont(:class="tagClass" v-for="(tag, tagIndex) of item.tags" :key="tagIndex") 日程意见
                    span.tag-name(v-for="(tag, tagIndex) of item.tags" :key="tagIndex") {{ tagName }}
                  span.cmt-content
                      span.cmt-replyName(v-if="item.beReplyOpenId") 回复{{item.beReplyNickName}}：
                      span.cmt-replyContent(v-html="translatePhiz(item.content)")
                  FilePreview(:fileList="item.files"
                      v-if="item.files && item.files.length > 0"
                      :type="2"
                      @recoverMenu="recoverMenu")
                  span.cmt-time
                      template(v-if="item.tags && item.tags.length")
                        span.cmt-re-send(@click="reSendSummary" v-if="item.openId === $userInfo.openid") 重新提交
                      template(v-else)
                        span.cmt-del(@click="toggleSelect({id: item.id, index})" v-if="item.openId === $userInfo.openid")
                          i.iconfont.icon-set_delete_normal
                      span.cmt-reply(v-if="(item.openId !== $userInfo.openid) && showCmtIcon")
                        i.iconfont &#xeae7;

          p.cmt-list-no(v-cloak="",  v-if="!filtedCmtList.length") {{cmtTxt}}
      p.cmt-hide 分割线

      //- .cmt-opt(@click="cmtEvent()" type="button")
      //-   i.iconfont &#xeae7;
      //-   span 回复

      <!--//回复框-->
      <!--cmt(ref="cmt"  @changelist="changeCmtList" :replyinfo="replyInfo")-->
      SelectList(:popUp="deleteSelectShow"
          :selectList="selectList"
          @close="toggleSelect")
</template>
<script>
  import {mapGetters} from 'vuex'
  import {deleteComment, getCmtListPaging} from '@/api/sendRequest'
  import FilePreview from '@/components/fileField/FilePreview'
  import SelectList from '@/components/common/SelectList'
//  import cmt from '@/components/common/cmt'
  import phizTranslate from '@/components/phiz/phiz'
  export default {
      props: {
          sectionLabel: {
              type: String,
              default: '回复'
          }
      },
      data () {
          return {
              cmtList: [],
              replyInfo: {
                  openId: '',
                  name: ''
              },
              selectList: [{
                  text: '删除',
                  action: this.delCmt,
                  style: {
                      color: '#FF7777'
                  }
              }, {
                  text: '取消',
                  action: null
              }],
              deleteSelectShow: false,
              crtDeletedCmt: {},
              cmtTxt: '',
              pageIndex: 1,
              isRequest: true,   // 是否正在请求中
              cmtNum: 0
          }
      },
      mounted () {
          this.getCmtList()
          let wrap = document.getElementsByClassName('work-detail')[0]
          window.addEventListener('scroll', (e) => {
              let scrollY = window.scrollY
              let windowH = window.innerHeight
              let scrollH = wrap.clientHeight

              if (windowH + scrollY >= scrollH && !this.isRequest && this.pageIndex !== 1) {
                  this.isRequest = true
                  this.getCmtList()
              }
          })
          this.$bus.$on('addComment', this.changeCmtList)
      },
      computed: {
          ...mapGetters({
              curWork: 'curWork'
          }),
          tagClass () {
              const {type} = this.curWork
              if (type === 'schedule') {
                  return 'icon-richengyijian'
              } else {
                  return 'icon-huiyiyijian'
              }
          },
          tagName () {
              const {type} = this.curWork
              if (type === 'schedule') {
                  return '日程意见'
              } else {
                  return '会议意见'
              }
          },
          filtedCmtList () {
              const {id: filterId = '$default$'} = (this.curWork.record || {})
              const cmtList = this.cmtList.filter(item => item.id !== filterId)
              !cmtList.length && (this.cmtTxt = '暂无回复~')
              this.$emit('changecolor', cmtList.length)
              return cmtList
          },
          showCmtIcon () {
              // 判断当前用户是否是创建者或者协作人
              let isSchedule = this.curWork.type === 'schedule'
              let workSource
              isSchedule && (workSource = this.curWork.workSource)
              !isSchedule && (workSource = this.curWork.currentWorkUser && this.curWork.currentWorkUser.workSource)
              return `${workSource}` === '1' || `${workSource}` === '2'
          }
      },
      methods: {
          reSendSummary () {
              this.$emit('re-send-summary')
          },
          getCmtList () {
              if (this.curWork.id) {
//                  let fd = new FormData()
//                  fd.append('workId', this.curWork.id)
//                  this.$http.post('/cloudwork/comment/query', fd, {
//                      headers: {
//                          'Content-Type': 'multipart/form-data'
//                      }
//                  }).then((resp) => {
//                      if (!resp.success || (resp && !resp.data)) {
//                          this.cmtTxt = '暂无回复~'
//                          return
//                      }
//                      this.cmtList = resp.data || []
//                  })
                  let param = {
                      workId: this.curWork.id,
                      pageNo: this.pageIndex || 1,
                      limit: 10
                  }
                  getCmtListPaging(param)
                      .then((resp) => {
                          if (!resp.success || (resp && !resp.data)) {
                              this.pageIndex === 1 && (this.cmtTxt = '暂无回复~')
                              this.pageIndex !== 1 && (this.cmtTxt = '')
                              this.isRequest = false
                              return
                          }
                          let data = resp.data || {}
                          this.pageIndex === 1 && (this.cmtList = data.comments || [])
                          this.pageIndex === 1 && (this.cmtNum = data.count)

                          if (this.pageIndex !== 1) {
                              this.cmtList = this.cmtList.concat(data.comments || [])
                          }

                          data.comments.length < 10 && (this.isRequest = true)
                          data.comments.length >= 10 && (this.isRequest = false)
                          this.pageIndex ++
                      })
                      .catch(() => {
                          this.isRequest = false
                      })
              }
          },
          cmtEvent ({openId = ''}) {
              // 点击回复
              if ((openId !== this.$userInfo.openid) && this.showCmtIcon) {
                  this.$router.push({name: 'Cmt', params: { replyid: openId }})
              }
          },
          changeCmtList (item) {
              // 子组件回调
              this.cmtList.splice(0, 0, item)
              this.$emit('changecolor', true)
          },
          recoverMenu () {
              this.$emit('recoverMenu')
          },
          translatePhiz (content) {
              return phizTranslate.translatePhizIcon(content)
          },
          delCmt () {
              const {id: cmtId, index: cmtIndex} = this.crtDeletedCmt
              if (cmtId) {
                  let fd = new FormData()
                  fd.append('id', cmtId)
                  deleteComment(fd).then((resp) => {
                      if (resp.errorCode !== 200) throw new Error(`${resp.errorCode}: ${resp.error}`)
                      this.$tip.show({
                          message: '删除成功',
                          duration: 1
                      })
                      this.$emit('del-comment')
                      // 从已缓存评论列表中删除
                      this.cmtList.splice(cmtIndex, 1)
                  }).catch((error) => {
                      this.error = error
                      // console.log(error)
                      this.$tip.show({
                          message: '删除失败，请稍后再试～',
                          duration: 1
                      })
                  })
              }
          },
          toggleSelect (crtDeletedCmt = {}) {
              if (crtDeletedCmt && crtDeletedCmt.id) {
                  this.crtDeletedCmt = crtDeletedCmt
              }
              this.deleteSelectShow = !this.deleteSelectShow
          }
      },
      components: {
          FilePreview,
          SelectList
      }
  }
</script>

<style lang="less" rel="stylesheet/less">

  *{

   -webkit-touch-callout:none;

   -webkit-user-select:none;

   -khtml-user-select:none;

   -moz-user-select:none;

   -ms-user-select:none;

   user-select:none;

   -o-user-select:none;

   }
   input,textarea {
     -webkit-user-select:auto; /*webkit浏览器*/
     margin: 0px;
     padding: 0px;
     outline: none;
   }

  .cmt-list {
    position: relative;
    background-color: #F8F9FB;
    padding-top: .08rem;

  .cmt-hide{
     height: 0px;
     visibility: hidden;
  }
  .cmt-list-data{
    margin-bottom:.74rem;
    .cmt-hide{
      height: 1px;
    }
  }
  .cmt-list-box {
    background-color: #fff;
    padding-left: .16rem;
    height:100%;
    overflow: hidden;


  p:first-child {
    height: .48rem;
    font-size: .16rem;
    color: #0F092A;
    line-height: .48rem;
    font-weight: bold;
  }

  .cmt-list-no {
      text-align: center;
      height: .48rem;
      font-size:.14rem;
      color: #889AA4;

  }

  .cmt-list-display {
    /*margin-bottom:.74rem;*/
  }

  .cmt-list-display li {
    display: -webkit-box;
    display: flex;
    display: -webkit-flex;
    display: -ms-flexbox;
    margin-top:.08rem;
    position: relative;
    overflow: hidden;

    &:active {
          opacity: 0.5;
    }
  }

  li img {
    width: .36rem;
    height: .36rem;
    border-radius: 50%;
    margin-right: .12rem;
  }

  li p {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    padding-right:.16rem;
    overflow: hidden;
    &:after {
            content: "";
            position: absolute;
            /*left: 0;*/
            bottom: 0;
            right: 0;
            top: inherit;
            border-bottom: 1px solid #eaeff3;
            color: #eaeff3;
            height: 1px;
            -webkit-transform-origin: 100% 0;
            transform-origin: 100% 0;
            -webkit-transform: scaleY(.5);
            transform: scaleY(.5);
            width:3.2rem;
    }

  span {
    display: block
  }

  .cmt-name {
    color: #030303;
    font-size: .14rem;
    line-height: .36rem;
    .time {
        color: #768893;
        font-size: .11rem;
        float: right;
    }
  }

  .iconfont.icon-richengyijian, .iconfont.icon-huiyiyijian {
    color:#4598F0;
    vertical-align: middle;
    margin-left: .08rem;
  }

  .tag-name {
      display: inline-block;
      position: relative;
      height: .32rem;
      line-height: .27rem;
      border: none;
      border-radius: .03rem 0 0 .03rem;
      padding: .02rem .20rem .02rem .08rem;
      overflow: hidden;
      font-size: .18rem;
      transform: scale(.5);
      transform-origin: left center;
      color: #FFFFFF;
      vertical-align: middle;
      margin-left: .12rem;
  }
  .tag-name::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: calc(~'100% - 0.01rem');
      height: 100%;
      background-color: #4598F0;
      z-index: -1;
  }
  .tag-name::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      width: 0;
      height: 0;
      border-top: .16rem solid transparent;
      border-bottom: .16rem solid transparent;
      border-left: none;
      border-right: .10rem solid #fff;
  }

  .cmt-content {
    color: #292814;
    font-size: .14rem;
    /*padding-top: .16rem;*/
    width: 100%;
    /*word-wrap:break-word;*/
    /*word-break:break-all;*/
    word-wrap: break-word;
    word-break: break-word;
    white-space: pre-wrap;

    .cmt-replyName{
        color:#A4A8AB;
        display: inline-block;
    }

    .cmt-replyContent {
       display: inline;

       img {
          width: .16rem;
          height: .16rem;
          vertical-align: middle;
          /*margin-right: 0;*/
           margin: 0 .02rem;
       }
    }
  }

  .cmt-time {
    color: #768893;
    font-size: .11rem;
    padding: .08rem 0;
    overflow:hidden;

    .cmt-reply, .cmt-del, .cmt-re-send{
       display: inline-block;
       float: right;
       margin-bottom: .02rem;
       cursor: pointer;

       /*&:active {*/
          /*opacity: 0.5;*/
       /*}*/
    }
  }

  }

  li:last-child{
    p:after{
      border:0
    }
  }

  }

  .cmt-opt {
    position: fixed;
    bottom: 0;
    text-align: center;
    color: #6F8C9B;
    font-size: .14rem;
    width: 100%;
    height: .44rem;
    line-height: .44rem;
    background-color: #fff;
    /*border-top: solid 1px #E5E7ED;*/
    z-index:1;

  &:before {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    border-top: 1px solid #E5E7ED;
    color: #eaeff3;
    height: 1px;
    -webkit-transform-origin: 100% 0;
    transform-origin: 100% 0;
    -webkit-transform: scaleY(.5);
    transform: scaleY(.5);
    width: 100%
  }

  &:active {
    opacity: 0.5;
  }

  .iconfont {
    margin-right: .06rem;
    font-size: .16rem;
    vertical-align: middle;
  }

  }
  }
</style>
