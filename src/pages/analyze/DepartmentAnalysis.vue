/**
 * tabSwitch - timeAnalysis - medalLine 
 */

<template lang="pug">
    .departmentAnalysis
        TabSwitch(
            :tablist="tablist"
            @tabclicked="switchPanelByTab"
            :currentTab="currentTab")
        keep-alive
            component(
                :is="currentTab"
                :analysisList="timeAnalysisList"
                :medalNewsList="medalNewsList"
                :doLike="doLike"
            )
</template>

<script>
    import {analyzePersonKeywords, fetchPersonAwards, likeKeyword, likeMedal} from '@/api/sendRequest'
    import {mapGetters, mapActions} from 'vuex'
    import {screeningKW} from './getKW'
    import TabSwitch from '../../components/analyze/TabSwitch'
    import TimeAnalysis from '../../components/analyze/TimeAnalysis'
    import MedalLine from '../../components/analyze/MedalLine'

    export default {
        name: 'DepartmentAnalysis',
        data () {
            return {
                currentTab: 'TimeAnalysis',
                tablist: [{
                    value: 'TimeAnalysis',
                    text: '时间使用分析'
                }, {
                    value: 'MedalLine',
                    text: '勋章动态'
                }],
                defaultTimeAnalysis: true,
                defaultMedalLine: true
            }
        },
        computed: {
            ...mapGetters(['medalNewsList', 'timeAnalysisList'])
        },
        watch: {
            'currentTab': function (val, oldVal) {
                if (val === 'TimeAnalysis') {
                    this.defaultTimeAnalysis && this.getDepartmentTimeAnalysis()
                } else {
                    this.defaultMedalLine && this.getDepartmentMedalNews()
                }
            }
        },
        created () {
            this.getDepartmentTimeAnalysis()
        },
        methods: {
            ...mapActions(['updatePersonAnalysis']),

            /**
             * @method 根据数据分析结果组织不同显示文字 ATTEND_WORK_LONG_WEEK(内勤时长) ATTEND_EXTRA_WORK_LONG_WEEK(外勤时长)
             * @personKeywordData {object}大数据接口返回结果个人data数据
             * @text {string}
             */
            buildKeywordText (personKeywordData) {
                let text = ''

                if (!personKeywordData) {
                    text = '暂无数据'
                } else {
                    // 除签到其他都属于关键字
                    const keyword = screeningKW({data: personKeywordData})
                    if (keyword.kw !== 'SING_LONG_WEEK') {
                        text = `上周花了最多时间在：${keyword.name}`
                    } else {
                        const {ATTEND_WORK_LONG_WEEK, ATTEND_EXTRA_WORK_LONG_WEEK} = personKeywordData
                        const innerWorkLong = Number(ATTEND_WORK_LONG_WEEK) || 0
                        const extraWorkLong = Number(ATTEND_EXTRA_WORK_LONG_WEEK) || 0
                        const workLong = innerWorkLong + extraWorkLong

                        text = workLong ? `上周使用云之家的时长为：${workLong}小时` : '暂无数据'
                    }
                }
                return text
            },

            /**
             * @method 获取部门时间分析。分析返回结果显示不同文案
             */
            getDepartmentTimeAnalysis () {
                let fd = new FormData()
                fd.append('time', this.$route.params.time)
                analyzePersonKeywords(fd).then(resp => {
                    if (resp.success === true) {
                        const list = resp.data.keywords.map(personKeyword => {
                            personKeyword.text = this.buildKeywordText(personKeyword.data)
                            return personKeyword
                        })
                        this.updatePersonAnalysis({key: 'timeAnalysisList', list})
                        this.defaultTimeAnalysis = false
                        return
                    }
                    throw new Error(resp.errorCode)
                }).catch(e => {
                    console.log(e)
                })
            },
            getDepartmentMedalNews () {
                // 获取部门勋章动态
                let fd = new FormData()
                fd.append('time', this.$route.params.time)
                fetchPersonAwards(fd).then(resp => {
                    if (resp.success === true) {
                        this.updatePersonAnalysis({key: 'medalNewsList', list: resp.data.awards || []})
                        this.defaultMedalLine = false
                        return
                    }
                    throw new Error(resp.errorCode)
                }).catch(e => {
                    console.log(e)
                })
            },
            switchPanelByTab (tab) {
                this.currentTab = tab
            },

            /**
             * @method 点赞，若渲染结果索引与原数据索引对应同一条数据，则直接更改，否则遍历整个列表
             * @param {object}{type: medal|timeAnalysis, id: 当前信息id, index: 当前数据项索引}
             */
            doLike ({type, id, index}) {
                const isMedal = type === 'medal'
                let list = isMedal ? this.medalNewsList : this.timeAnalysisList
                const likeFn = isMedal ? likeMedal : likeKeyword

                let fd = new FormData()
                fd.append('upId', id)
                likeFn(fd).then(resp => {
                    if (resp.success === true) {
                        if (list[index].id === id) {
                            list[index].up = true
                        } else {
                            list.some(item => {
                                if (item.id === id) {
                                    item.up = true
                                }
                            })
                        }

                        this.updatePersonAnalysis({key: isMedal ? 'medalNewsList' : 'timeAnalysisList', list})
                    } else {
                        throw new Error(resp.errorCode)
                    }
                }).catch(e => {
                    console.log(e)
                })
            }
        },
        components: {
            TabSwitch,
            TimeAnalysis,
            MedalLine
        }
    }
</script>

<style lang="less" rel="stylesheet/less">
@import '../../css/analysis/departmentAnalysis';
</style>
