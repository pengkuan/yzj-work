import * as types from './mutations-types'

export default {
    [types.GET_PLAN_LIST] (state, list) {
        state.planList = list
    },
    [types.GET_DONE_WORKS] (state, list) {
        state.doneWorks = list
    },
    [types.SET_CURRENT_WORK] (state, work) {
        state.curWork = work
    },
    [types.SET_PLAN_LIST] (state, list) {
        state.planList = list
    },
    [types.SET_DONE_LIST] (state, list) {
        state.doneWorks = list
    },
    [types.SET_CO_WORKERS] (state, workers) {
        state.coWorkers = workers
    },
    [types.SET_WORK_DATE] (state, workDate) {
        state.taskDate = workDate
    },
    [types.SET_CUR_WORK_STATUS] (state, obj) {
        state.curWork = Object.assign({}, state.curWork, obj)
    },
    [types.SET_UNDO_WORK_LEN] (state, len) {
        state.undoWorkLen = len
    },
    [types.SET_UNDO_MEETING_LEN] (state, len) {
        state.undoMeetingLen = len
    },
    [types.CANCEL_MEETING] (state) {
        let { currentWorkUser = {} } = state.curWork
        currentWorkUser.workStatus = 1
        state.curWork = Object.assign({}, state.curWork, {
            workStatus: 1,
            currentWorkUser: currentWorkUser,
            cancelTime: new Date().getTime()
        })
    },
    [types.DELETE_WORK] (state) {
        state.curWork = Object.assign({}, state.curWork, {
            workStatus: 1,
            actorPersons: [],
            currentWorkUser: {}
        })
    },
    [types.UPDATE_MEETING_JOIN_STATUS] (state, status) {
        let {currentWorkUser} = state.curWork
        currentWorkUser = Object.assign({}, currentWorkUser, {
            workStatus: (status === 1) ? 1 : 0,
            acceptStatus: status
        })
        state.curWork = Object.assign({}, state.curWork, {
            currentWorkUser: currentWorkUser
        })
    },
    [types.UPDATE_SCHEDULE_JOIN_STATUS] (state, status) {
        let {currentWorkUser} = state.curWork
        currentWorkUser = Object.assign({}, currentWorkUser, {
            acceptStatus: status
        })
        state.curWork = Object.assign({}, state.curWork, {
            currentWorkUser: currentWorkUser
        })
    },
    [types.UPDATE_PERSON_ANALYSIS] (state, {key, list}) {
        state[key] = list
    },
    [types.SET_DAY_WORKS_RECIEVED] (state, status) {
        state.dayWorksRecieved = status
    }
}
