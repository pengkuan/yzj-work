export * from '@/api/sendRequest'

// 通过时间桥从客户端获取时间
function getDate (selected, onselect) {
    selected = (selected === '请选择' || !selected)
        ? this.$moment(Date.now() + 5 * 60 * 1000).format('YYYY-MM-DD HH:mm')
        : this.$moment(selected).format('YYYY-MM-DD HH:mm')
    XuntongJSBridge.call('dateTimePicker', {
        yearRangeStart: 2017,          // 年开始
        yearRangeEnd: 2018,            // 年结束
        select: selected,              // 当前选中时间
        title: ' ',                    // title显示
        offset: 2,                     // 当前选中行上下显示多少可选行，取值范围（1-4）；1显示总共3行，2显示总共5，以此类推
        minuteStep: 5                  // 分钟步进数，如以15分钟累积。
    }, value => {
        if (value.success === 'true') {
            onselect.call(this, value)
        }
    })
}

// 格式化显示时间
function formatDate (val) {
    if (!val) return ''
    let date = this.$moment(val)
    let month = date.month() + 1
    let day = date.date()
    let week = date.day()
    let time = date.format('HH:mm')
    let dateStr = ''
    this.isOutdated = this.$moment().isAfter(date)
    switch (week) {
        case 1:
            week = '一'
            break
        case 2:
            week = '二'
            break
        case 3:
            week = '三'
            break
        case 4:
            week = '四'
            break
        case 5:
            week = '五'
            break
        case 6:
            week = '六'
            break
        case 0:
            week = '日'
            break
    }
    dateStr = `${month}月${day}日 周${week} ${time}`
    return dateStr
}

// 格式化月日
function formatMD (val) {
    if (!val) return ''
    let date = this.$moment(val)
    let month = date.month() + 1
    let day = date.date()
    return `${month}月${day}日`
}

export {getDate, formatDate, formatMD}
