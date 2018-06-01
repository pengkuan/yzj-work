import Vue from 'vue'
import {
    Index,
    Detail,
    Editor,
    Event,
    EventInfo,
    TaskView,
    Export,
    Creator,
    CoworkersList,
    ConInfo,
    CoForMeeting,
    Cmt,
    keyWord,
    DepartmentAnalysis,
    TimeConflict
} from '@/pages'
import Store from '@/vuex'

const proto = Vue.prototype
proto.isFirst = true
const routes = [
    {
        path: '/',
        name: 'Index',
        component: Index,
        title: '我的日程',
        beforeEnter: (to, from, next) => {
            let urlParams = proto.$common.urlParams
            if (!proto.isFirst) {
                next()
                return
            }
            if (urlParams.type === 'keyword') {
                next({
                    path: '/keyword/' + urlParams.time
                })
                return
            } else if (urlParams.type === 'staffanalyze') {
                next({
                    path: '/staffanalyze/' + urlParams.time
                })
                return
            }

            if (proto.$proms.isOldDesk) {
                next({ path: '/taskView' })
                return
            }

            // 点击全部，进入taskview
            if (urlParams.enter === 'taskview') {
                next({ path: '/taskView' })
                return
            }

            // 如果是语音助手传过来的
            if (urlParams.voiceContent) {
                Object.assign(proto.$mywork, urlParams)
                next({ path: '/editor' })
                return
            }

            if (urlParams.from) {
                let type = urlParams.type
                proto.$proms.ready.then(resp => {
                    switch (type) {
                        case 'meeting':
                            next({ path: '/creator' })
                            break
                        case 'event':
                            next({ path: '/event' })
                            break
                        default:
                            next({ path: '/editor' })
                    }
                })
                return
            }

            // 如果url中有传 workid，则创建一条相关的work，并跳到详情页面
            // 通过id值，获取work的详情
            if (!urlParams.workid) {
                proto.isFirst = false
                next()
            } else {
                proto.isFirst = false
                let type = urlParams.workType
                let work = {
                    id: urlParams.workid,
                    isOld: true,
                    type: type === 'meeting' ? 'meeting' : '',
                    isPlan: urlParams.workStatus !== '1',
                    currentWorkUser: {
                        workStatus: 0
                    },
                    clientOid: urlParams.clientOid
                }

                Store.dispatch('setCurrentWork', work)
                switch (type) {
                    case 'meeting':
                        next({ path: '/coninfo' })
                        break
                    case 'event':
                        next({ path: '/eventinfo' })
                        break
                    default:
                        next({ path: '/detail' })
                }
                // proto.$proms.ready.then(resp => {
                // })
                return
            }

            if (urlParams.msgId) {
                proto.isFirst = false
                Object.assign(proto.$mywork, urlParams)
                proto.$mywork.msgId = urlParams.msgId
                proto.$mywork.groupId = urlParams.groupId
                proto.$proms.ready.then(resp => {
                    next({path: '/editor'})
                })
                // next({path: '/editor'})
                return
            }

            if (urlParams.page === 'conflict') {
                proto.$proms.ready.then(resp => {
                    next({ path: '/conflict' })
                })
            }
        }
    },
    {
        path: '/detail',
        name: 'Detail',
        component: Detail,
        title: '日程详情'
    },
    {
        path: '/editor',
        name: 'Editor',
        component: Editor,
        title: '编辑日程'
    },
    {
        path: '/taskView',
        name: 'TaskView',
        component: TaskView,
        title: '任务视图'
    },
    {
        path: '/export',
        name: 'Export',
        component: Export,
        title: '导出日程'
    },
    {
        path: '/creator',
        name: 'Creator',
        component: Creator,
        title: '创建会议'
    },
    {
        path: '/coninfo',
        name: 'ConInfo',
        component: ConInfo,
        title: '会议详情'
    },
    {
        path: '/workersList',
        name: 'CoworkersList',
        component: CoworkersList,
        title: '协作人'
    },
    {
        path: '/coForMeeting',
        name: 'CoForMeeting',
        component: CoForMeeting,
        title: '与会人'
    },
    {
        path: '/cmt/:replyid',
        name: 'Cmt',
        component: Cmt,
        title: '回复'
    },
    {
        path: '/:tag/cmt',
        name: 'MeetingRecord',
        component: Cmt,
        title: '会议纪要'
    },
    {
        path: '/conflict',
        name: 'TimeConflict',
        component: TimeConflict,
        title: '时间冲突'
    },
    {
        path: '/event',
        name: 'Event',
        component: Event,
        title: '记事日程'
    },
    {
        path: '/eventinfo',
        name: 'EventInfo',
        component: EventInfo,
        title: '记事详情'
    },
    {
        path: '/keyword/:time',
        name: 'keyWord',
        component: keyWord,
        title: '个人时间关键字'
    },
    {
        path: '/staffanalyze/:time',
        name: 'staffanalyze',
        component: DepartmentAnalysis,
        title: '部门动态'
    }
]

export {
    routes
}
