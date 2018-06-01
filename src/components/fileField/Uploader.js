
import Vue from 'vue'

export default Vue.extend({
    data () {
        return {
            // fileList: [
            //     {fileId: '5ad94e9cb6238e5798d64416', fileName: '【例】陆凌锋 7-12月报销(餐补).xlsx', fileExt: 'xlsx', fileTime: '2018-04-20 10:21', fileSize: '53348'},
            //     {fileId: '5ad94ed5b6238e5798d64418', fileName: '根据部门负责人获取当前部门直属下属接口.txt', fileExt: 'txt', fileTime: '2018-04-20 10:22', fileSize: '3424'},
            //     {fileId: '5ad80d68b6238e5798d630dc', fileName: '工作汇报交接文档.docx', fileExt: 'docx', fileTime: '2018-04-19 11:31', fileSize: '4567328'}
            // ]
            fileList: [...this.value]
        }
    },
    props: {
        value: {
            type: Array,
            default: []
        }
    },

    watch: {
        value () {
            this.fileList = [...this.value]
        }
    },

    methods: {
        selectFile (event) {
            if (!this.$proms.isMobile) return

            event.preventDefault()

            XuntongJSBridge.call('selectFile', {}, (result) => {
                if (result.success === 'true') {
                    console.log(result.data.files)
                    this.fileChange(result.data.files)
                } else {
                    // alert('上传附件失败')
                }
            })
        },
        removeFile (id) {
            this.fileList = this.fileList.filter(item => item.fileId !== id)
            this.$emit('input', [...this.fileList])
        },
        fileChange (data) {
            if (!data.length) return

            if (this.fileList.length + data.length > 10) {
                this.$tip.show({
                    message: '最多仅支持上传10个文件'
                })
                return
            }

            data.forEach(item => {
                let flag = this.fileList.some(el => {
                    return item.fileId === el.fileId
                })
                if (!flag) {
                    this.fileList.push(item)
                }
            })
            // this.fileList = [...data, ...this.fileList]
            this.$emit('input', [...this.fileList])
        }
    }
})
