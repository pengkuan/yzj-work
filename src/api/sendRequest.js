import http from './http'

// 改变工作的完成状态
export async function checkWork (work, type, source) {
    if (type === -1) {
        return await http.post('/cloudwork/work/finishwork.json',
            {
                id: work.id,
                channel: source || 1
            })
    } else {
        // return await http.post('/cloudwork/work/unfinishwork.json',
        //     {
        //         id: work.id,
        //         channel: source || 1
        //     })
    }
}

// 标记重要
export async function markWork (work) {
    if (work.workType === '1') {
        return await http.post('/cloudwork/work/markwork.json',
            { id: work.id, type: '0' })
    } else {
        return await http.post('/cloudwork/work/markwork.json',
            { id: work.id, type: '1' })
    }
}

// 获取单条工作的详情
export async function getWorkDetail (work) {
    return await http.post('/cloudwork/work/getworkbyid',
        {
            id: work.id
        })
}

// 获取单条会议的详情
export async function getConferenceDetail (work) {
    return await http.post('/cloudwork/meeting/queryMeetingById',
        {
            meetingId: work.id
        })
}
// 会议详情发起群聊
export async function groupChatByMeeting (data) {
    return await http.post('/cloudwork/meeting/createGroup',
        {
            id: data.id,
            openIds: data.openIds,
            groupName: data.groupName
        })
}

// 获取已完成列表
export async function queryDoneList () {
    return await http.post('/cloudwork/donework/doneworklist.json',
        {
            doneTime: 'all'
        })
}

// 获取未完成列表
export async function queryPlanList () {
    return await http.post('/cloudwork/work/undoneworklist.json')
}

// 增加工作
export async function addWork (data) {
    return await http.post('/cloudwork/work/addwork.json', data)
}

// 增加会议
export async function createConference (data) {
    return await http.post('/cloudwork/meeting/addMeeting', data)
}
export async function createConference2 (data) {
    return await http.post('/cloudwork/meeting/addMeeting2', data)
}
// 修改工作
export async function updateWork (data) {
    return await http.post('/cloudwork/work/updatework.json', data)
}

// 更新会议
export async function updateConference (data) {
    return await http.post('/cloudwork/meeting/updateMeeting', data)
}

// 删除工作
export async function delWork (work) {
    return await http.post('/cloudwork/work/delwork.json',
        { id: work.id })
}

// 取消会议
export async function cancelConference (work) {
    return await http.post('/cloudwork/meeting/cancleMeeting',
        {meetingId: work.id || work.meetingId})
}

/**
 * @method queryDayWorks 获取指定日期的工作
 * @param {Date} dayTime 指定某一天的时间戳
*/
export async function queryDayWorks (dayTime) {
    // old api /cloudwork/work/queryCurDayWorklist
    return await http.post('/cloudwork/newwork/dayWorks', {
        date: dayTime
    })
}

// 更新提醒时间
export async function updateNoticeTime (type, data) {
    let url = type === 1 ? '/cloudwork/work/updateNoticeTime' : '/cloudwork/meeting/updateNoticeTime'
    return await http.post(url, data)
}

// 会议接受不接受
export async function acceptwork (type, data) {
    let url = type === 1 ? '/cloudwork/work/acceptwork' : '/cloudwork/meeting/updateJoinStatus'
    return await http.post(url, data)
}

// 获取会议中协作人列表详情
export async function getCoWorkerList (data) {
    return await http.post('/cloudwork/meeting/responseDetail', data)
}

// 增减日程协作人接口
export async function updateActorsForS (data) {
    return await http.post('/cloudwork/work/updateActors', data)
}

// 增减会议参与人员接口
export async function updateActorsForM (data) {
    return await http.post('/cloudwork/meeting/updateActors', data)
}

// 获取任务试图的日程和会议列表
export async function getWorkList ({type = 'task', pageNo = 1, limit = 20} = {}) {
    return await http.post('/cloudwork/work/getWorkList', {
        type,
        pageNo,
        limit
    })
}

/**
 * 删除回复
 * @param {FormData}{id: 评论id}
 */
export async function deleteComment (data) {
    return await http.post('/cloudwork/comment/del', data)
}

/**
 * 查询会议冲突人
 */
export async function queryConflictCoworker (data) {
    return await http.post('/cloudwork/meeting/queryConflictPerson', data)
}

// 查询冲突人日程列表
export async function fetchConflictList (params) {
    return await http.post('/cloudwork/meeting/queryConflictList', params)
}

/**
* 委托参加会议
* */
export async function entrustJoinMeeting (data) {
    return await http.post('/cloudwork/meeting/entrustJoinMeeting', data)
}

/**
* 同意委托参加会议
* */
export async function agreeBeEntrusted (data) {
    return await http.post('/cloudwork/meeting/agreeBeEntrusted', data)
}

/**
* 委托会议详情
* */
export async function entrustedDetail (data) {
    return await http.post('/cloudwork/meeting/queryEntrustedMeeting', data)
}

/**
* 发送im消息
* */
export async function xtsend (data) {
    return await http.post('/cloudwork/newwork/xtsend', data)
}

/**
 * 下属关键词信息
 */
export async function analyzePersonKeywords (time) {
    return await http.post('/cloudwork/newwork/personKeywords', time)
}

/**
 * 获取下属上周勋章动态
 */
export async function fetchPersonAwards (time) {
    return await http.post('/cloudwork/newwork/personAwards', time)
}

/**
 * 关键字点赞
 * @data {FormData}
 */
export async function likeKeyword (data) {
    return await http.post('/cloudwork/newwork/keywordUp', data)
}

/**
 * 勋章点赞
 */
export async function likeMedal (data) {
    return await http.post('/cloudwork/newwork/awardUp', data)
}

/**
* 个人关键字
* */
export async function ownKeyword (data) {
    return await http.post('/cloudwork/newwork/ownKeyword', data)
}

/**
* 获取用户信息
* */
export async function getUserInfo (data) {
    return await http.post('/cloudwork/work/infobyid', data)
}

/**
* 查询分页回复列表
* */
export async function getCmtListPaging (data) {
    return await http.post('/cloudwork/comment/queryByPageNo', data)
}
