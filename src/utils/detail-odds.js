// import * as Operate from '@/pages/works/operate'
/**
 * 协作人数组的协作人id和name值提取
 * @method getStaffArr
 * @return {Object} 解析出的id 和 name 数组
*/
export function getStaffArr (staffList) {
    let staffIds = []
    let staffNames = []

    staffList.forEach(staff => {
        staffIds.push(staff.id)
        staffNames.push(staff.name)
    })

    return {
        staffIds,
        staffNames
    }
}

/**
 * 分析出变化的协作人
 * @method {getdiff}
 * @return {Object} 解析出的数据
*/
export function getdiff (staffList, oldIds) {
    let pids = getStaffArr(staffList).staffIds
    let names = getStaffArr(staffList).staffNames

    let oldSet = new Set(oldIds)
    let newSet = new Set(pids)
    let interSet = new Set([...oldSet].filter(item => newSet.has(item)))

    let addIds = [...newSet].filter(item => !interSet.has(item))
    let delIds = [...oldSet].filter(item => !interSet.has(item))

    let addNames = []

    staffList.forEach(staff => {
        if (addIds.indexOf(staff.id) > -1) {
            addNames.push(staff.name)
        }
    })

    return {
        pids,
        names,
        addIds,
        delIds,
        addNames
    }
}

export function getWork (getWorkDetail) {
    return new Promise((resolve, reject) => {
        getWorkDetail(this.curWork).then(resp => {
            let work = resp.data
            const { currentWorkUser = {workStatus: 0} } = work
            // 0 未完成， 1 完成
            const isPlan = this.curWork.isPlan && (work.workStatus !== 0 || currentWorkUser.workStatus !== 0)
            work = Object.assign({}, this.curWork, work)
            work.isPlan = isPlan
            work.isOld = true
            work.type = 'schedule'
            // 当currentWorkUser不存在的时候，使用“日程发起人”的workStatus做初始化
            work.currentWorkUser = Object.assign({
                workStatus: work.workStatus
            }, work.currentWorkUser)
            this.setCurrentWork(work)
            resolve()
        })
    })
}

/**
 * @method {selectDepart} 选部门桥
 * @param {Function} cb 选择部门后的回调函数
 */
export function selectDepart (cb) {
    this.$proms.compEnd.call(this, {
        mobileCb: () => {
            XuntongJSBridge.call('selectOrgs', {
                isMulti: true
            }, result => {
                cb.call(this, result)
            })
        }
    })
}

/**
 * @method {selectDepart} 选择关注人员
 * @param {Function} cb 选择人后的回调函数
 */
export function selectConcernPersons (cb) {
    this.$proms.compEnd.call(this, {
        mobileCb: () => {
            XuntongJSBridge.call('selectConcernPersons', {
                isMulti: true,
                concernType: 10 // 轻应用当前需要的关注模型，默认传0表明获取所有的人。工作汇报汇报关系传10
            }, result => {
                cb.call(this, result)
            })
        }
    })
}

// 选人桥选人
export function selectStaff (type) {
    if (this.preventEdit) return
    let staffIds = getStaffArr(this.staffList).staffIds
    this.$proms.compEnd.apply(this, [{
        mobileCb: () => {
            XuntongJSBridge.call('selectPersons',
                {
                    isMulti: true,
                    selected: staffIds,
                    isShowMe: false         // 选人组件是否显示自己
                }, result => {
                    console.log(result)
                    const staffs = (result.data && result.data.persons) || result.persons
                    // alert(JSON.stringify(staffs))
                    removeOriginalStaff.call(this, staffs)
                    handleStaffs.call(this, staffs, type)
                })
        },
        webCb: () => {
            this.$proms.selectPersons({
                multi: true,
                // needContract: true,
                success: data => {
                    setTimeout(() => {
                        handleStaffs.call(this, data)
                    }, 100)
                }
            })
        }
    }])
}
/**
 * @method {handleStaffs} 选完人后对已选人列表进行处理
 * @param {Array} persons 一选人列表
 * @return {undefined} default
 */
function handleStaffs (persons, type) {
    persons.forEach(item => {
        let isNotIn = this.staffList.every(staff => {
            return staff.id !== item.openId
        })
        if (isNotIn) {
            if (item.openId === this.$userInfo.openid && type === 'work') {
                this.$tip.show({
                    message: '已过滤掉创建人自己'
                })
            } else {
                this.staffList.push({
                    id: item.openId,
                    name: item.name,
                    img: item.avatarUrl || item.photoUrl,
                    readStatus: 0,
                    workStatus: 0
                })
            }
        }
    })
}

/*
* @method {removeOriginalStaff} 选完人后是否移除了原有的成员
* @param {Array} persons 一选人列表
* */
function removeOriginalStaff (persons) {
    // 是否移除掉原有的成员
    let arr = []
    persons.filter((item) => arr.push(item.openId))

    let isRemove = this.staffList.every(staff => {
        return !(arr.indexOf(staff.id) === -1)
    })

    let isSchedule = this.curWork.type === 'schedule' || this.type === 'schedule'
    !isRemove && this.$tip.show({
        message: `${isSchedule ? '暂不支持移除协作人' : '暂不支持移除与会人'}`,
        duration: 1.5
    })
}

export function confirmNotify () {
    this.notifyPop.show = false
    // 参数设置
    let url = '/cloudwork/work/unfinishnotice'  // 日程
    let params = {
        workId: this.curWork.id
    }
    // 会议
    if (this.curWork.type === 'meeting') {
        url = '/cloudwork/meeting/unfinishnotice'
        params = {
            meetingId: this.curWork.id
        }
    }

    let dataStr = this.$qs.stringify(params)
    this.$http.post(url, dataStr).then(resp => {
        this.isNotified = true
        let unfinishMembers = this.staffList.filter(item => item.workStatus === 0) || []
        let infoStr = '已发送短信提醒'
        if (!unfinishMembers.length) return
        if (unfinishMembers.length === 1) {
            infoStr = `${infoStr} ${unfinishMembers[0].name}`
        } else {
            infoStr = `${infoStr} ${unfinishMembers[0].name} 等${unfinishMembers.length}人`
        }
        this.$tip.show({
            message: infoStr
        })
    })
}

