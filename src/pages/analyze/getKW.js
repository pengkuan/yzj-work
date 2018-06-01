/*
* 查找关键字
* */

/*
* ID                              //OID + "-" + "周一日期"        格式如:'76d72c38-b8c3-11e3-8d13-e41f137ad9f4-20180507'
ATTEND_WORK_LONG_WEEK           //内勤工作时长(周)
ATTEND_EXTRA_WORK_LONG_WEEK     //外勤工作时长(周)
MCLD_TAKL_LONG_WEEK             //免费电话分钟数(周)
WF_DEAL_AVG_TIME_WEEK           //审批平均时长(周)
WF_DEAL_TIMES_WEEK              //审批总次数(周)
MEDIA_BILL_LONG_WEEK            //语音会议分钟数(周)
LSR_LONG_WEEK                   //视频会议分钟数(周)
MSG_CONTACT_MOST_WEEK           //跟谁发消息最多(周)
MSG_CONTACT_MOST_SIZE_WEEK      //最多条数(周)
MSG_CONTACT_LEAST_WEEK          //跟谁发消息最少(周)
MSG_CONTACT_LEAST_SIZE_WEEK     //最少条数(周)
CLW_NEWWORK_TIMES_WEEK          //普通日程创建次数
CLW_MEET_TIMES_WEEK             //会议日程创建次数
CLW_FINISH_WORK_TIMES_WEEK      //普通日程完成次数
CLW_FINISH_MEET_TIMES_WEEK      //会议日程完成次数
MICRO_BLOG_SENDS_WEEK           //同事圈动态发送次数
MICRO_BLOG_LIKES_WEEK           //同事圈点赞次数
MICRO_BLOG_COMMENTS_WEEK        //同事圈评论次数
* */
let kwKey = [
    'MCLD_TAKL_LONG_WEEK',
    'WF_DEAL_AVG_TIME_WEEK', 'MEDIA_BILL_LONG_WEEK', 'LSR_LONG_WEEK',
    'MSG_CONTACT_MOST_SIZE_WEEK', 'CLW_NEWWORK_TIMES_WEEK', 'CLW_MEET_TIMES_WEEK',
    'CLW_FINISH_WORK_TIMES_WEEK', 'CLW_FINISH_MEET_TIMES_WEEK',
    'MICRO_BLOG_SENDS_WEEK', 'MICRO_BLOG_LIKES_WEEK', 'MICRO_BLOG_COMMENTS_WEEK'
]

let kwValue = {
    // 'ATTEND_WORK_LONG_WEEK': { kw: '', desc: '' },
    // 'ATTEND_EXTRA_WORK_LONG_WEEK': { kw: '', desc: '' },
    'SING_LONG_WEEK': {kw: '签到', desc: '你上周一共上班了XXX，除了签到，云之家还有很多超级厉害的功能可以帮你提高工作效率喔'}, // 自命名，签到文案(内勤+外勤)
    'MCLD_TAKL_LONG_WEEK': {kw: '打电话', desc: '你上周打了XXX免费电话，记得把沟通过的事情用日程记录下来喔。'},
    'WF_DEAL_AVG_TIME_WEEK': {kw: '审批', desc: '你上周花了XXX在审批上，善用工作台的审批助手卡片，可以有效提高你的工作效率喔。'},
    // 'WF_DEAL_TIMES_WEEK': { kw: '', desc: '' },
    'MEDIA_BILL_LONG_WEEK': {kw: '语音会议', desc: '你上周开了XXX语音会议，记得把沟通过的事情用日程记录下来，做到凡事必有结果喔'},
    'LSR_LONG_WEEK': {kw: '视频会议', desc: '你上周开了XXX视频会议，记得把沟通过的事情用日程记录下来，做到凡事必有结果喔'},
    // 'MSG_CONTACT_MOST_WEEK': { kw: '发消息', desc: 'XXX是你上周的高频协作者，你用了最多时间和TA进行消息沟通，做完的工作也都要记录下来了，以便后续回顾喔。' },
    'MSG_CONTACT_MOST_SIZE_WEEK': {kw: '发消息', desc: 'XXX是你上周的高频协作者，你用了最多时间和TA进行消息沟通，做完的工作也都要记录下来了，以便后续回顾喔。'},
    // 'MSG_CONTACT_LEAST_WEEK': { kw: '', desc: '' },
    // 'MSG_CONTACT_LEAST_SIZE_WEEK': { kw: '', desc: '' },
    'CLW_NEWWORK_TIMES_WEEK': {kw: '跟进工作', desc: '上周你用日程跟进了XXX项工作，做完的日程都有去结束掉，确保日清日结吗？'},
    'CLW_MEET_TIMES_WEEK': {kw: '组织会议', desc: '上周你组织了 XXX 次会议，作为开会达人，记得提交会议纪要喔，会议有结论并告知所有与会人，才算是有效会议啊。'},
    'CLW_FINISH_WORK_TIMES_WEEK': {kw: '推进工作', desc: '很棒！上周用日程推进了XXX项工作，事情做完以后，记得写好总结，确保凡事必有结果哦，你距离优秀已经不远了！'},
    'CLW_FINISH_MEET_TIMES_WEEK': {kw: '开会', desc: '上周你开了XXX次会议，开会占用了你的大部分时间，会上的决策是否都有跟进落实呢？没有的话，现在就用日程推进工作吧！'},
    'MICRO_BLOG_SENDS_WEEK': {kw: '发动态', desc: '上周你发了XXX条同事圈动态，跟同事互动拉近关系的同时，也要记得好好工作喔'},
    'MICRO_BLOG_LIKES_WEEK': {kw: '点赞', desc: '上周你花了比较多时间表达了对同事的认可，在同事圈点了 XXX个赞，跟同事互动拉近关系的同时，也要记得好好工作喔'},
    'MICRO_BLOG_COMMENTS_WEEK': {kw: '互动', desc: '上周你回复了XXX条同事圈动态，跟同事互动拉近关系的同时，也要记得好好工作喔'}
}

// 获取关键字
export const screeningKW = (resp) => {
    let _kw = ''
    let _val = 0
    resp && resp.data &&
    kwKey.forEach((item, index) => {
        if (resp.data[item] && parseFloat(resp.data[item]) > _val) {
            _val = resp.data[item]
            _kw = item
        }
    })
    // 当无其他数据时，则算签到的时间
    !_kw && (_kw = 'SING_LONG_WEEK') && (resp.data && (_val = resp.data['ATTEND_WORK_LONG_WEEK'] + resp.data['ATTEND_EXTRA_WORK_LONG_WEEK']))
    return { kw: _kw, name: kwValue[_kw].kw, val: _val || 0 }
}

// 获取关键字文案
export const kwDesc = ({ kw, val, resp }) => {
    if (kw !== 'MSG_CONTACT_MOST_SIZE_WEEK') {
        val = translateTime(val)
    }
    return kwValue[kw].desc.replace('XXX', val)
}

// 时间转换为时分
function translateTime (time = 0) {
    let date = time || 0
    let [hour, min] = String(date).split('.')
    min && (min = parseFloat(date) * 60 % 60)
    date = `${hour > 0 ? hour + '小时' : ''}${min ? parseInt(min) + '分' : ''}`
    return date || '0小时'
}
