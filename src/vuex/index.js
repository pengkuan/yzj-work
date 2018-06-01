import Vue from 'vue'
import Vuex from 'vuex'

import * as getters from './getters'
import * as actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

const state = {
    planList: [],
    doneWorks: [],
    curWork: {},
    coWorkers: {
        staffList: [],
        type: '',
        source: '',
        oldIds: []
    },
    taskDate: {},
    undoWorkLen: 0,
    undoMeetingLen: 0,
    medalNewsList: [],
    timeAnalysisList: [],
    // 用户点击切换日期后, 请求的 dayWorks 数据是否返回
    dayWorksRecieved: false
}

export default new Vuex.Store({
    state,
    actions,
    getters,
    mutations
})
