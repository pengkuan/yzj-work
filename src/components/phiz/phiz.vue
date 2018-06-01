<template lang="pug">
  .phizWrap
      .mask(@touchstart="closePhiz")
      .phiz-wrap(:style="phizWidthStyle")
          span
          ul.phiz-list(:style="phizListStyle")
              li(v-for="(item, index) in phizItem" :class="item"  :style="phizItemStyle"
                  @touchstart="touchStart"
                  @touchmove="touchMove"
                  @touchend="touchEnd")
                  span(v-for="(phiz, phizIndex) in 21"
                        :class="{'first-line': phizIndex < 8,'non-phiz': index === 5 && phizIndex > 7 && phizIndex !== 20}"
                        @click="selectPhiz(index,phizIndex)")
                  <!--span 删除-->

          .round-list
              span.round-item(:class="{curr: num === (curPage + 1)}" v-for="num in screenNum")
      </div>
  </div>
</template>

<script>
  import phizOpera from '../phiz/phiz'
  export default {
      data () {
          return {
              phizItem: ['phiz-emoji1', 'phiz-emoji2', 'phiz-emoji3', 'phiz-emoji4', 'phiz-emoji5', 'phiz-emoji6'],
              startX: 0, // 触摸位置
              moveX: 0, // 滑动位置
              disX: 0, // 滑动距离
              endX: 0, // 结束位置
              styleX: 0, // 如果disX
              phizListStyle: {  // 整个表情屏幕的样式
                  transform: 'translate3d(0px, 0, 0)',
                  transition: 'none'
              },
              phizItemStyle: {}, // 每屏表情的宽度
              curPage: 0, // 当前滑动的是第几屏
              screenNum: 0 // 共有多少屏
          }
      },
      created () {
          this.screenNum = this.phizItem.length
          this.calcPhizListStyle()
          this.calcPhizItemStyle()
      },
      computed: {
          phizArr () {
              let arr = []
              for (let i = 0; i < this.phizItem.length; i++) {
                  arr.push(phizOpera.phizArr.slice(i * 21, (i + 1) * 21))
              }
              return arr
          },
          phizWidthStyle () {
              let fs = document.getElementsByTagName('html')[0].style['font-size'].replace(/\px/g, '')
              let bodyWidth = document.body.clientWidth - fs * 0.12 * 2
              return {width: bodyWidth + 'px'}
          }
      },
      methods: {
          selectPhiz (index, phizIndex) {
              // 选择表情
              if (!((phizIndex + 1) % 21)) {
                  this.delPhizItem()
              } else {
                  let item = phizOpera.phizArr[index * 20 + phizIndex]
                  let phizItem
                  item && (phizItem = phizOpera.phizArr[index * 20 + phizIndex][0])
                  item && this.$emit('getphiz', `[${phizItem}]`)
              }
          },
          delPhizItem () {
              event.stopPropagation()
              this.$emit('delphiz')
          },
          closePhiz () {
              event.stopPropagation()
              this.$emit('closephiz')
          },
          touchStart (ev) {
              ev = ev || event
              if (ev.touches.length === 1) {
                  this.startX = ev.touches[0].clientX
                  this.styleX = parseFloat(this.phizListStyle.transform.replace(/translate3d\(/g, '').replace(/px, 0, 0\)/g, ''))
                  this.phizListStyle.transition = 'none'
              }
          },
          touchMove (ev) {
              ev = ev || event
              ev.preventDefault()
              // 获取屏幕宽度，此宽度为滑块左滑的最大距离
              let bodyWidth = document.body.clientWidth
              let screenNum = this.screenNum // 共多少屏
              if (ev.touches.length === 1) {
                  this.moveX = ev.touches[0].clientX
                  this.disX = this.startX - this.moveX // 起始位置减去 实时的滑动的距离，得到手指实时偏移距离
                  let _moveX = Math.abs(this.disX)
                  let translateX = 0
                  if (this.disX >= 0) { // 向左滑动
                      if (_moveX > bodyWidth) {
                          _moveX = bodyWidth
                      }

                      translateX = this.styleX - _moveX
                      if (Math.abs(translateX) >= (screenNum - 1) * bodyWidth) { // 滑动到最后一屏，则无法向左滑动
                          translateX = (screenNum - 1) * bodyWidth * -1
                      }
                  } else {  // 向右滑动
                      translateX = this.styleX + _moveX
                      if (translateX >= 0) {
                          translateX = 0
                      }
                  }
                  this.phizListStyle.transform = `translate3d(${translateX}px, 0, 0)`
              }
          },
          touchEnd (ev) {
              ev = ev || event
              let bodyWidth = document.body.clientWidth
              let screenNum = this.screenNum  // 共多少屏
              let minDis = bodyWidth / 4  // 最小滑动
              if (ev.changedTouches.length === 1) {
                  let endX = ev.changedTouches[0].clientX // 结束滑动时的位置
                  this.disX = this.startX - endX // 手指滑动的位置

                  if (Math.abs(this.disX) < minDis) { // 滑动距离要超过最小滑动距离，才能进行惯性滑动
                      this.phizListStyle.transform = `translate3d(${this.styleX}px, 0, 0)`
                      this.phizListStyle.transition = 'transform 0.3s linear'
                      return false
                  }
                  if (this.disX >= 0) { // 向左滑动
                      this.styleX = bodyWidth * -1 + this.styleX
                      this.curPage++
                      if (Math.abs(this.styleX) >= (screenNum - 1) * bodyWidth) { // 滑动到最后一屏，则无法向左滑动
                          this.styleX = (screenNum - 1) * bodyWidth * -1
                          this.curPage = screenNum - 1
                      }
                  } else { // 向右滑动
                      this.styleX = bodyWidth + this.styleX
                      this.curPage--
                      if (this.styleX >= 0) { // 滑动到第一屏，则无法向右滑动
                          this.styleX = 0
                          this.curPage = 0
                      }
                  }
                  this.phizListStyle.transform = `translate3d(${this.styleX}px, 0, 0)`
                  this.phizListStyle.transition = 'transform 0.3s linear'
              }
          },
          calcPhizListStyle () { // 计算整个表情屏幕的样式
              let screenNum = this.screenNum
              let bodyWidth = document.body.clientWidth
              this.phizListStyle = {
                  width: bodyWidth * screenNum + 'px',
                  transform: 'translate3d(0px, 0, 0)',
                  transition: 'none'
              }
              if (bodyWidth < 375 || bodyWidth > 562.5) {
                  this.phizListStyle.height = bodyWidth / 375 * 100 * 1.4 + 'px'
              }
          },
          calcPhizItemStyle () { // 计算每屏表情的宽度
              let fs = document.getElementsByTagName('html')[0].style['font-size'].replace(/\px/g, '')
//              console.log(fs)
              let bodyWidth = document.body.clientWidth - fs * 0.12 * 2
              this.phizItemStyle = {
                  width: bodyWidth + 'px',
                  marginRight: `${document.body.clientWidth - bodyWidth}px`
              }
          }
      }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  .phizWrap{
    position: relative;
  }
  .mask{
    background: rgba(255,255,255,.5);
    min-height: 3rem;
    position: fixed;
    bottom:0;
    width: 100%;
  }
  .phiz-wrap{
    margin:.12rem .12rem .04rem;
    overflow:hidden;
    background: #F8F9FB;
    z-index:1;
    &:before {
        content: "";
        position: absolute;
        top: .08rem;
        left: .38rem;
        display: block;
        height: .12rem;
        width: .12rem;
        background: #F8F9FB;
        transform: rotateZ(45deg);
    }
    .phiz-list{
      border-radius: 4px;
      height: 1.4rem;
      margin:.12rem auto;
      overflow:hidden;

      .phiz-emoji1{
        background: url('../../assets/phiz/emoji1.png') no-repeat;
        background-size: contain;
      }
      .phiz-emoji2{
        background: url('../../assets/phiz/emoji2.png')  no-repeat;
        background-size: contain;
      }
      .phiz-emoji3{
         background: url('../../assets/phiz/emoji3.png')  no-repeat;
         background-size: contain;
      }
      .phiz-emoji4{
         background: url('../../assets/phiz/emoji4.png')  no-repeat;
         background-size: contain;
      }
      .phiz-emoji5{
         background: url('../../assets/phiz/emoji5.png')  no-repeat;
         background-size: contain;
      }
      .phiz-emoji6{
         background: url('../../assets/phiz/emoji6.png')  no-repeat;
         background-size: contain;
      }
      li{
        height: 100%;
        border-radius:.04rem;
        /*margin: auto .06rem;*/
        float: left;
        font-size: 0;
        div{
          padding: .04rem 0 .04rem .06rem;
        }
        span {
          /*width: .42rem;*/
          width: 11.966%;
          /*height: .38rem;*/
          height: 27.142%;
          display: inline-block;
          /*background: rgba(0, 0, 0, .5);*/
          margin: 3.418% 2.279% 0 0;
          border-radius:.02rem;
          /*margin-top: 0.12rem;*/
          &:nth-child(7n){
            margin-right: 0;
           }
        }
        span:active{
            background:rgba(194,203,208,.4)
        }
        .first-line{
          margin-top: 0;
        }
        .non-phiz:active{
            background:rgba(194,203,208,0);
        }
      }
    }

    .round-list{
      margin: 0 auto .12rem;
      text-align:center;
      span{
        display: inline-block;
        width: .05rem;
        height: .05rem;
        border-radius:100%;
        background:#C2CCD0;
        margin:auto .09rem;
      }
      .curr{
        background: #4598F0;
      }
    }
  }

</style>

