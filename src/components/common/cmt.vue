<!--已作废-->
<template lang="pug">
  .cmt-wrap
    .cmt(v-cloak="" :style="cmtStyle" )
          .mask(@touchstart="cancelEvent" :style="_height" )
          .cmt-box
            p.cmt-box-title {{params.title}}
            textarea.cmt-box-content(v-cloak=""  v-model="content" ref="cmtArea"  :placeHolder="params.placeholder" )
            .cmt-box-opt
                a(@click="cancelEvent") {{params.cancelTxt}}
                a.confirm-btn(@click="confirmEvent") {{params.confirmTxt}}

</template>

<script>
  import {mapGetters} from 'vuex'
  export default {
      props: {
          params: {
              type: Object,
              default: () => {
                  return {
                      title: '请输入回复内容',
                      placeholder: '请输入回复内容',
                      cancelTxt: '取消',
                      confirmTxt: '确认'
                  }
              }
          },
          replyinfo: {
              type: Object,
              default: () => {
                  return {
                      openId: '',
                      name: ''
                  }
              }
          }
      },
      data () {
          return {
              content: '',
              tips: {
                  isShowTips: false,
                  tipTxt: ''
              },
              showCmt: false,
              cmtStyle: 'z-index:-1;opacity:0'
          }
      },
      computed: {
          ...mapGetters({
              curWork: 'curWork'
          }),
          _height () {
              return `height:${window.innerHeight}px`
          }
      },
      watch: {
          showCmt () {
              if (this.showCmt) {
//                  document.body.style.position = 'fixed'
//                  document.body.style.width = '100%'
                  this.cmtStyle = 'z-index:2;opacity:1'
                  document.getElementsByClassName('cmt')[0].scrollIntoView()
//                  window.scrollTo(0, 0)   // 有bug,键盘问题
              } else {
//                  document.body.style.position = 'static'
//                  document.body.style.width = 'auto'
                  this.cmtStyle = 'z-index:-1;opacity:0'
              }
          }
      },
      methods: {
          textAreaFocus () {
              // 键盘弹起
              this.$refs.cmtArea.focus()
          },
          cancelEvent () {
              this.content = ''
              this.showCmt = false
          },
          confirmEvent () {
              if (!this.content.trim()) {
                  this.tipsBox('回复内容不能为空')
                  return
              }
              if (typeof this.params.confirmEvent === 'function') {
                  this.params.confirmEvent()
                  return
              }
              let _fd = new FormData()
              _fd.append('workId', this.curWork.id)
              _fd.append('beReplyOpenId', this.replyinfo.openId)
              _fd.append('content', this.content)
              _fd.append('commentType', `${this.curWork.type === 'schedule' ? 'task' : 'meeting'}`)
              this.$http.post('/cloudwork/add/comment', _fd).then((resp) => {
                  if (resp.success) {
                      let obj = {
                          photoUrl: this.$userInfo.photoUrl,
                          nickName: this.$userInfo.username,
                          openId: this.$userInfo.openid,
                          content: `${this.content}`,
                          createDate: new Date().getTime()
                      }
                      // 是否是回复他人
                      if (this.replyinfo.openId) {
                          obj.beReplyOpenId = this.replyinfo.openId
                          obj.beReplyNickName = this.replyinfo.name
                      }

                      this.content = ''
                      this.showCmt = false
                      this.$emit('changelist', obj)
                      this.tipsBox('回复成功')
                  } else {
                      this.tipsBox('回复失败')
                  }
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
          }
      }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .cmt{
    position: fixed;
    width:100%;
    top:0;
    height:100%;
    left:0;
    z-index:1;

    .mask{
      background-color: #0E2E46;
      opacity: .33;
      /*position: absolute;*/
      /*top:0;*/
      position: relative;
      width: 100%;
    }
    .cmt-box{
      height: 2rem;
      width: 2.67rem;
      background-color: #F8F9FB;
      border-radius:.06rem;
      /*margin: 28% auto 0;*/
      overflow:hidden;
      /*position: relative;*/
      z-index: 1;
      position:absolute;
      top:15%;
      left:50%;
      transform:translateX(-50%);

      .cmt-box-title{
        height: .44rem;
        line-height: .44rem;
        font-size:.16rem;
        text-align: center;
        color:#272727;
        background-color: #fff;
      }

      textarea{
        background-color:  #F8F9FB;
        width: 100%;
        height: 1.11rem;
        resize: none;
        font-size:.14rem;
        padding: .08rem .12rem;
      }

      .cmt-box-opt{
        height: .45rem;
        line-height: .45rem;
        background-color: #fff;
        text-align: center;
        position: absolute;
        bottom: 0;
        display: -webkit-box;
        display: flex;
        display: -webkit-flex;
        display: -ms-flexbox;
        -webkit-box-align: center;
        -webkit-align-items: center;
        align-items: center;
        color:#1D1D1D;
        width:100%;
        -webkit-touch-callout:none;
        -webkit-user-select:none;
        -khtml-user-select:none;
        -moz-user-select:none;
        -ms-user-select:none;
        user-select:none;
        -o-user-select:none;
        position:relative;

        &:before{
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
           width:100%
         }

        a:first-child:after{
           content: "";
           position: absolute;
           right: 0;
           top: 25%;
           border-right: 1px solid #eaeff3;
           color: #eaeff3;
           height: .4rem;
           -webkit-transform-origin: 100% 0;
           transform-origin: 100% 0;
           -webkit-transform: scaleY(.5);
           transform: scaleY(.5);
           width: .01rem;
         }

        a{
          -webkit-box-flex: 1;
          -webkit-flex: 1;
          -ms-flex: 1;
          flex: 1;
          position: relative;

        }
        .confirm-btn{
          color:#3BBAFF;
        }
        a:active{
          color:rgba(29,29,29,0.5);
        }
        .confirm-btn:active{
          color:rgba(59,186,255,0.5);
        }
      }

    }
    .cmt-box-scroll{
      top:55%;
    }

    .cmt-tips{
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      height: .6rem;
      width: .8rem;
      font-size: .14rem;
      background: #000;
      opacity: .6;
      color: #fff;;
      line-height: .6rem;
      text-align: center
    }
  }
</style>
