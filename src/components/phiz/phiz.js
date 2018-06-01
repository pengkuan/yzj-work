/*
* 表情列表
* */
let phizOpera = {
    phizKey: ['微笑', '嘻嘻', '哈哈', '可爱', '爱你', '亲亲', '太开心',   // 第一屏 第一排
        '鼓掌', '笑哭了', '坏笑', '机智', '捂脸', '偷笑', '做鬼脸',       // 第一屏 第二排
        '害羞', '酷', '花心', '钱', '奋斗', '吃惊',       // 第一屏 第三排
        '翻白眼', '馋嘴', '懒得理你', '思考', '憋屈', '发愣', '渴望',      // 第二屏 第一排
        '兴奋', '嘘', '疑问', '汗', '困', '打哈气', '睡觉',        // 第二屏 第二排
        '哼', '闭嘴', '鄙视', '委屈', '挖鼻屎', '生病',        // 第二屏 第三排
        '晕', '吐', '失望', '可怜', '泪', '衰', '骷髅头',     // 第三屏 第一排
        '抓狂', '怒骂', '怒', '尴尬笑', '左哼哼', '右哼哼', 'doge',      // 第三屏 第二排
        '卖萌', '不开心', '大哭', '皱眉', '惊恐', '再见',    // 第三屏 第三排
        '撇嘴', '嘿哈', '吃瓜', '黑人问号', '顶', '666', 'good',     // 第三屏 第一排
        '弱', '拍手', '来', 'ok', 'no', '耶', '握手',      // 第三屏 第二排
        '爱你呦', '差劲', '抱拳', '拳头', '加油', '祈祷',    // 第三屏 第三排
        '玫瑰', '凋谢', '心', '心碎', '钟', '太阳', '月亮',   // 第四屏 第一排
        '蛋糕', '礼物', '干杯', '咖啡', '猪头', '话筒', '蜡烛',   // 第四屏 第二排
        '闪电', '拥抱', '吃饭', '足球', '雨伞', '棒棒糖',    // 第四屏 第三排
        '气球', '沙发', '飞机', '嘴唇', '炸弹', '便便', '庆祝'    // 第五屏 第一排
    ],
    phizArr: [
        // 第一屏 第一排
        ['微笑', 'hehe'],
        ['嘻嘻', 'xixi'],
        ['哈哈', 'haha'],
        ['可爱', 'keai'],
        ['爱你', 'aini'],
        ['亲亲', 'qinqin'],
        ['太开心', 'taikaixin'],

        // 第一屏 第二排
        ['鼓掌', 'guzhang'],
        ['笑哭了', 'xiaokule'],
        ['坏笑', 'huaixiao'],
        ['机智', 'jizhi'],
        ['捂脸', 'wulian'],
        ['偷笑', 'touxiao'],
        ['做鬼脸', 'zuoguilian'],

        // 第一屏 第三排
        ['害羞', 'haixiu'],
        ['酷', 'ku'],
        ['花心', 'huaxin'],
        ['钱', 'qian'],
        ['奋斗', 'fendou'],
        ['吃惊', 'chijing'],

        // 第二屏 第一排
        ['翻白眼', 'fanbaiyan'],
        ['馋嘴', 'chanzui'],
        ['懒得理你', 'landelini'],
        ['思考', 'sikao'],
        ['憋屈', 'biequ'],
        ['发愣', 'faleng'],
        ['渴望', 'kewang'],

        // 第二屏 第二排
        ['兴奋', 'xingfen'],
        ['嘘', 'xu'],
        ['疑问', 'yiwen'],
        ['汗', 'han'],
        ['困', 'kun'],
        ['打哈气', 'dahaqi'],
        ['睡觉', 'shuijiao'],

        // 第二屏 第三排
        ['哼', 'heng'],
        ['闭嘴', 'bizui'],
        ['鄙视', 'bishi'],
        ['委屈', 'weiqu'],
        ['挖鼻屎', 'wabishi'],
        ['生病', 'shengbing'],

        // 第三屏 第一排
        ['晕', 'yun'],
        ['吐', 'tu'],
        ['失望', 'shiwang'],
        ['可怜', 'kelian'],
        ['泪', 'lei'],
        ['衰', 'shuai'],
        ['骷髅头', 'kuloutou'],

        // 第三屏 第二排
        ['抓狂', 'zhuakuang'],
        ['怒骂', 'numa'],
        ['怒', 'nu'],
        ['尴尬笑', 'gangaxiao'],
        ['左哼哼', 'zuohengheng'],
        ['右哼哼', 'youhengheng'],
        ['doge', 'doge'],

        // 第三屏 第三排
        ['卖萌', 'maimeng'],
        ['不开心', 'bukaixin'],
        ['大哭', 'daku'],
        ['皱眉', 'zhoumei'],
        ['惊恐', 'jingkong'],
        ['再见', 'zaijian'],

        // 第三屏 第一排
        ['撇嘴', 'piezui'],
        ['嘿哈', 'heiha'],
        ['吃瓜', 'chigua'],
        ['黑人问号', 'heirenwenhao'],
        ['顶', 'ding'],
        ['666', '666'],
        ['good', 'good'],

        // 第三屏 第二排
        ['弱', 'ruo'],
        ['拍手', 'paishou'],
        ['来', 'lai'],
        ['ok', 'ok'],
        ['no', 'no'],
        ['耶', 'ye'],
        ['握手', 'woshou'],

        // 第三屏 第三排
        ['爱你呦', 'ainiyo'],
        ['差劲', 'chajin'],
        ['抱拳', 'baoquan'],
        ['拳头', 'quantou'],
        ['加油', 'jiayou'],
        ['祈祷', 'qidao'],

        // 第四屏 第一排
        ['玫瑰', 'rose'],
        ['凋谢', 'diaoxie'],
        ['心', 'xin'],
        ['心碎', 'xinsui'],
        ['钟', 'zhong'],
        ['太阳', 'taiyang'],
        ['月亮', 'yueliang'],

        // 第四屏 第二排
        ['蛋糕', 'dangao'],
        ['礼物', 'liwu'],
        ['干杯', 'ganbei'],
        ['咖啡', 'kafei'],
        ['猪头', 'zhutou'],
        ['话筒', 'huatong'],
        ['蜡烛', 'lazhu'],
        // 第四屏 第三排
        ['闪电', 'shandian'],
        ['拥抱', 'yongbao'],
        ['吃饭', 'chifan'],
        ['足球', 'zuqiu'],
        ['雨伞', 'yusan'],
        ['棒棒糖', 'bangbangtang'],

        // 第五屏 第一排
        ['气球', 'qiqiu'],
        ['沙发', 'shafa'],
        ['飞机', 'feiji'],
        ['嘴唇', 'zuichun'],
        ['炸弹', 'zhadan'],
        ['便便', 'bianbian'],
        ['庆祝', 'qingzhu']
    ],
    translatePhizIcon (txt) {
        let reg = /(\[([\u4e00-\u9fa5]|[a-z]|[A-Z]|[1-9]\d*)+\])/g
        let arr = txt.match(reg) || []

        for (let i = 0; i < arr.length; i++) {
            let phiz
            let index
            let img = ''
            let src = ''
            phiz = arr[i].slice(1, arr[i].length - 1)
            index = this.phizKey.indexOf(phiz)
            index !== -1 && (img = this.phizArr[`${index}`][1])
            img && (src = require(`../../assets/phiz/single/${img}.png`))
            src && (txt = txt.replace(arr[i], `<img src=${src} />`))
        }
        return txt
    }
}

export default phizOpera
