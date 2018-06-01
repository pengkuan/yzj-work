import appRoot from './Root'

export const Root = appRoot

export const Index = resolve => require(['./Index.vue'], resolve)

// 详情页
export const Detail = resolve => require(['./Detail.vue'], resolve)

// 日程编辑页
export const Editor = resolve => require(['./Editor.vue'], resolve)

// 记事日程
export const Event = resolve => require(['./event/Event.vue'], resolve)

export const EventInfo = resolve => require(['./event/EventInfo.vue'], resolve)

// 全部任务
export const TaskView = resolve => require(['./works/TaskView.vue'], resolve)

// 导出
export const Export = resolve => require(['./Export'], resolve)

export const Creator = resolve => require(['./conference/Creator'], resolve)

// 会议详情
export const ConInfo = resolve => require(['./conference/ConInfo'], resolve)

export const CoworkersList = resolve => require(['./coworkers/co-schedule'], resolve)

export const CoForMeeting = resolve => require(['./coworkers/co-meeting'], resolve)

// 回复
export const Cmt = resolve => require(['./cmt/cmt'], resolve)

export const keyWord = resolve => require(['./analyze/keyWord'], resolve)

// export const staffAnalyze = resolve => require(['./analyze/staffAnalyze'], resolve)
export const DepartmentAnalysis = resolve => require(['./analyze/DepartmentAnalysis'], resolve)

export const TimeConflict = resolve => require(['./conflict/TimeConflict'], resolve)
