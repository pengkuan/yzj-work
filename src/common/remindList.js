
export const meetingMap = [
    { 'minute': -1, 'value': '不提醒' },
    { 'minute': 0, 'value': '会议开始时' },
    { 'minute': 5, 'value': '提前5分钟' },
    { 'minute': 15, 'value': '提前15分钟' },
    { 'minute': 30, 'value': '提前30分钟' },
    { 'minute': 60, 'value': '提前1小时' },
    { 'minute': 1440, 'value': '提前1天' }
]

export const scheduleMap = [
    { 'minute': -1, 'value': '不提醒' },
    { 'minute': 0, 'value': '日程开始时' },
    { 'minute': 5, 'value': '提前5分钟' },
    { 'minute': 15, 'value': '提前15分钟' },
    { 'minute': 30, 'value': '提前30分钟' },
    { 'minute': 60, 'value': '提前1小时' },
    { 'minute': 1440, 'value': '提前1天' }
]

export const WORK_STATUS = {
    NOTSTART: {
        id: 0,
        text: '未开始'
    },
    PROCESSING: {
        id: 1,
        text: '进行中'
    },
    MEETING_DONE: {
        id: 2,
        text: '已结束'
    },
    CANCEL: {
        id: 3,
        text: '已取消'
    },
    SCHEDULE_DONE: {
        id: 4,
        text: '已完成'
    },
    OVERDUE: {
        id: 5,
        text: '已逾期'
    }
}
