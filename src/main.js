// http://babeljs.io/docs/usage/polyfill/
import 'babel-polyfill'

import Vue from 'vue'

// 添加“按钮反馈”功能
import feedback from '@/common/feedback-directive'
Vue.use(feedback)

// 全局添加“勋章”弹窗
import Madel from '@/components/madel/Madel.vue'
Vue.component('madel-honor', Madel)

// 对Vue原型的扩展
import '@/config/extend.config'

// 鉴权
import '@/config/auth.config'

import Root from '@/pages/Root.vue'

import globalMixin from '@/mixins/globalMixin'

Vue.config.productionTip = false

let bus = new Vue()
Vue.prototype.$bus = bus

Vue.mixin(globalMixin)

new Vue(Root).$mount('#app')
