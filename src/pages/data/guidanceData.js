export default {
    // 创建日程页面的引导弹窗数据
    editor: {
        remind: {
            text: '可以设置时间提醒大家哦',
            direction: 'top',
            top: '0.63',
            right: '0.4'
        },
        coworker: {
            text: '来添加你的协作伙伴吧',
            direction: 'left',
            top: '0.53',
            left: '1.08'
        }
    },
    // 创建会议页面的引导弹窗数据
    creator: {
        remind: {
            text: '可以设置时间提醒大家哦',
            direction: 'top',
            top: '0.63',
            right: '0.4'
        },
        coworker: {
            text: '来添加你的参会伙伴吧',
            direction: 'left',
            top: '0.53',
            left: '1.08'
        }
    },
    // 日程详情页面的引导弹窗数据
    detail: {
        creator: {
            accept: {
                text: '看看有谁接受了你的日程吧',
                direction: 'top',
                top: '1',
                right: '0.2'
            },
            finish: {
                text: '完成后, 记得提交一下心得哦',
                direction: 'top',
                top: '0.7',
                right: '0.3'
            }
        },
        coworker: {
            accept: {
                text: '发起人正在焦急等待你的反馈哦',
                direction: 'bottom',
                bottom: '0.75',
                left: '0.42'
            },
            finish: {
                text: '记得让大家知道你完成了哦',
                direction: 'top',
                top: '0.7',
                right: '0.3'
            }
        },
        private: {
            text: '这里可以将日程转发或删除哦',
            direction: 'top',
            top: '0.28',
            right: '0.05'
        }
    },
    // 会议详情页面的引导弹窗数据
    conInfo: {
        creator: {
            accept: {
                text: '看看有谁响应了你的会议吧',
                direction: 'top',
                top: '1',
                right: '0.2'
            },
            finish: {
                text: '会议结束记得提交一下会议纪要哦',
                direction: 'top',
                top: '0.7',
                right: '0.3'
            }
        },
        coworker: {
            accept: {
                text: '发起人正在焦急等待你的反馈哦',
                direction: 'bottom',
                bottom: '0.75',
                left: '0.42'
            },
            finish: {
                text: '会议结束别忘了提些会议意见哦',
                direction: 'top',
                top: '0.7',
                right: '0.3'
            }
        },
        private: {
            text: '这里可以将会议转发或取消哦',
            direction: 'top',
            top: '0.28',
            right: '0.05'
        }
    }
}
