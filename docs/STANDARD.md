# 云之家产品部前端开发团队开发规范

## 代码结构

目前项目以[Vue.js](https://vuejs.org/)生态为核心，使用[Vue.js](https://vuejs.org/) 2.x + [vuex](https://vuex.vuejs.org/zh-cn/) +
 [vue-router](http://router.vuejs.org/) 构成单页面应用，
使用[vue-cli](https://github.com/vuejs/vue-cli)（推荐使用[yun-cli](https://github.com/yun-ui/yun-cli)）脚手架生成原始项目结构，
使用[yarn](https://yarnpkg.com/)作npm包管理工具。
整体代码结构如下：

``` javascript

root path/
    build/    ## 项目构建文件
    config/   ## 项目环境配置文件
    src/      ## 业务应用源代码
        api/      ## 请求相关的文件
        assets/   ## 图片等静态资源文件
        components/   ## 拆分的各个组件文件
        config/       ## 业务代码配置文件
        css/          ## 样式表
        filters/      ## vue模板filter文件
        lib/          ## 公共方法库
        pages/        ## 单页面中各个路由页面
        router/       ## 路由配置表
        utils/        ## 工具类方法库
        vuex/         ## vuex文件
        main.js         ## 工程入口文件
    static/
    test/     ## 测试文件
    .babelrc    ## babel配置
    .editorconfig       ## 编辑器规则配置
    .eslintignore       ## eslint忽略检查得配置
    .eslintrc.js        ## eslint规则配置
    .gitignore          ## git ignore
    index.html          ## 业务页面入口
    package.json
    README.md           ## 项目说明
    STANDARD.md         ## 规范readme
    yarn.lock           ## yarn版本包，勿手动修改

```

## 代码规范

以standard eslint规则为基准，更改了几项规则，适应团队的编程习惯。更改的几项主要为：

1. 四个空格缩进；
2. 箭头函数单个参数*允许*增加括号；
3. 允许直接使用`new Something()`；
4. 异步、同步方法使用async，await；

具体自定义规则请参考项目根目录下`.eslintrc.js`。

一般开发过程中需要注意的地方：
* 使用单引号，不用双引号
* 行末不加分号
* 文件结尾要有一个空行
* 四个空格缩进
* 函数方法括号前后都要有空格
* 注释// /* 后要有空格

## 分支管理

使用[git flow](https://www.git-tower.com/learn/git/ebook/cn/command-line/advanced-topics/git-flow)工作流，
具体分支功能如下：
``` bash

develop     ## 开发基准分支
master      ## 默认分支，dev环境
feature     ## 功能分支，开发新功能时创建
    init
    refactor
release     ## 发布分支,kdtest、正式环境分支
hotfix      ## 修复正式环境bug的分支
stable      ## 为正式环境的稳定代码，作为回滚分支
```

## commit规范

请写明每次提交具体做了哪些事情，基本提交信息如下：`type(类型)` + `:` + `content(做的事情)`。

类型分类主要有：
* feat：新功能（feature）
* fix：修补bug
* docs：文档（documentation）
* style： 格式（不影响代码运行的变动）
* refactor：重构（即不是新增功能，也不是修改bug的代码变动）
* test：增加测试
* chore：构建过程或辅助工具的变动

## vuex模块管理

对vue的状态管理，以页面为模块进行划分，对每个page的vuex状态进行单独管理，具体代码划分可参考`src/vuex`的写法，文档可参考[vuex modules](https://vuex.vuejs.org/zh-cn/modules.html)

``` javascript

vuex/
   modules/     ## 页面子模块
       index.js
       page1/       ## 页面1的状态相关
       page2/
   actions.js       ## 全局的状态action方法
   getters.js       ## 全局的状态get方法
   index.js
   mutation-type.js     ## 所有的模块mutation类型
   mutations.js     ## 全局的mutation控制
   state.js     ## 全局的状态存储

```
