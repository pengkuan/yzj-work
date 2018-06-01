import http from '@/api/http'
import * as types from './mutations-types'

// 获取所有未完成的工作列表
export async function getPlanList ({ commit }) {
    const resp = await http.post('/cloudwork/work/undoneworklist.json',
        {})
    commit(types.GET_PLAN_LIST, resp.data.list)
    return resp
}

// 获取所有已完成的工作列表
export async function getDoneWorks ({ commit }) {
    const resp = await http.post('/cloudwork/donework/doneworklist.json',
        {
            doneTime: 'all'
        })
    commit(types.GET_DONE_WORKS, resp.data)
    return resp
}

// 设置当前操作的工作
export function setCurrentWork ({ commit }, work) {
    commit(types.SET_CURRENT_WORK, work)
}

// 设置已完成列表
export function setDoneList ({ commit }, list) {
    commit(types.SET_DONE_LIST, list)
}
// 设置未完成列表
export function setPlanList ({ commit }, list) {
    commit(types.SET_PLAN_LIST, list)
}

/**
 * 设置当前协作人列表
 * @param {Object} workers
 *   {
 *      type: {String} [schedule/meeting] 日程/会议
 *      source: {String} [editor/detail] 来自编辑页/详情页
 *      staffList: {Array} 协作人数组
 *      oldIds: {Array} 本条日程原有的协作人oid数组
 *   }
 */
export function setCoWorkers ({ commit }, workers) {
    commit(types.SET_CO_WORKERS, workers)
}

export function setWorkDate ({ commit }, workDate) {
    commit(types.SET_WORK_DATE, workDate)
}

/**
 * 更新当前日程的某个或某些字段
 * @param {function} setCurWorkStatus
 * @param {Object} obj
 */
export function setCurWorkStatus ({ commit }, obj) {
    commit(types.SET_CUR_WORK_STATUS, obj)
}

// 设置未完成的日程个数
export function setUndoWorkLen ({ commit }, len) {
    commit(types.SET_UNDO_WORK_LEN, len)
}

// 设置未完成的会议个数
export function setUndoMeetingLen ({ commit }, len) {
    commit(types.SET_UNDO_MEETING_LEN, len)
}

// 取消会议
export async function cancelMeeting ({ commit }, meetingId) {
    const result = await http.post('/cloudwork/meeting/cancleMeeting', {
        meetingId: meetingId
    })
    if (`${result.success}` === 'true') {
        commit(types.CANCEL_MEETING)
    }
    return result
}
// 删除日程
// TODO: 此处有问题 需要和产品确定具体实现
export async function cancelWork ({commit}, workId) {
    const result = await http.post('/cloudwork/newwork/delete', {
        id: workId
    })
    if (`${result.success}` === 'true') {
        commit(types.DELETE_WORK)
    }
    return result
}
// 协作人更新会议相应状态： 1 不参加 2 参加
export async function updateMeetingAcceptStatus ({commit}, {meetingId, status, reason}) {
    const result = await http.post('/cloudwork/meeting/updateJoinStatus', {
        meetingId: meetingId,
        joinStatus: status,
        reason: reason
    })
    if (`${result.success}` === 'true') {
        commit(types.UPDATE_MEETING_JOIN_STATUS, status)
    }
    return result
}
// 协作人更新日程接受情况  1 不接受 2 接受
export async function updateScheduleAcceptStatus ({commit}, {workId, status, reason}) {
    const result = await http.post('/cloudwork/work/acceptwork', {
        workId: workId,
        acceptStatus: status,
        reason: reason
    })
    if (`${result.success}` === 'true') {
        commit(types.UPDATE_SCHEDULE_JOIN_STATUS, status)
    }
    return result
}

/**
 * 大数据下属关键词分析及勋章列表状态
 * @param {object}payload {key, list} - key标识需要更新的状态字段
 */
export async function updatePersonAnalysis ({commit}, payload) {
    commit(types.UPDATE_PERSON_ANALYSIS, payload)
}

export function setDayWorksRecieved ({ commit }, status) {
    commit(types.SET_DAY_WORKS_RECIEVED, status)
}
