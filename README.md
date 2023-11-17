<h1>vue-pure-admin精简版（非国际化版本）</h1>

[![license](https://img.shields.io/github/license/pure-admin/vue-pure-admin.svg)](LICENSE)

**中文** | [English](./README.en-US.md)

## 介绍

精简版是基于 [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) 提炼出的架子，包含主体功能，更适合实际项目开发，打包后的大小在全局引入 [element-plus](https://element-plus.org) 的情况下仍然低于 `2.3MB`，并且会永久同步完整版的代码。开启 `brotli` 压缩和 `cdn` 替换本地库模式后，打包大小低于 `350kb`

## 版本选择

当前是非国际化版本，如果您需要国际化版本 [请点击](https://github.com/pure-admin/pure-admin-thin/tree/i18n)

## 配套视频

- [点我查看教程](https://www.bilibili.com/video/BV1kg411v7QT)
- [点我查看 UI 设计](https://www.bilibili.com/video/BV17g411T7rq)

## 配套保姆级文档

- [查看文档](https://yiming_chang.gitee.io/pure-admin-doc)

## 预览

- [查看预览](https://pure-admin-thin.netlify.app/#/login)

# ⚠️ 广东航天宏图后台通用管理系统部分

## 内网预览地址

地址：http://192.168.8.24:8999/ht-admin/  
账号：admin  
密码：admin123

## git 使用规范

用于说明 commit 的类别，提交说明需添加前缀例如（feat: ）:后面加空格  
常见类别如下：

feat: 新增功能（feature）  
fix: 修复补丁（bug）  
docs: 修订文档，如 Readme, Change Log, Contribute 等  
refactor: 代码重构，未新增任何功能和修复任何 bug  
style: 仅调整空格、格式缩进等（不改变代码逻辑的变动）  
perf: 优化相关，改善性能和体验的修改  
test: 测试用例的增加/修改  
chore: 非 src 和 test 的修改  
merge: 合并分支或冲突等  
revert: 回滚到上一个版本  
build: 改变构建流程，新增依赖库、工具等（例如 webpack、maven 修改）  
ci: 自动化流程配置修改

提交前先 lint，修复完才可以提交 git，然后 preview:build 预览打包效果

## 函数组件工具库，推荐使用，包含（判断，格式化，数字处理，经纬度转换等）

https://pure-admin-utils.netlify.app/

https://yiming_chang.gitee.io/pure-admin-doc/pages/components/#pure-admin-table

## 命名规范

禁止使用拼音缩写

页面名称首字母大写，与路径一致，否则缓存会不生效
`defineOptions({
name: "Menu"
})`

## 提倡 CSS 写法

https://yiming_chang.gitee.io/pure-admin-doc/pages/tailwindcss/

## 字典引用

### 获取

`const { sys_show_hide, sys_normal_disable } = useDict(
"sys_show_hide",
"sys_normal_disable"
);`

### 状态组件

`<DictTag :options="sys_normal_disable" :value="row.status" />`

## 数据流下载

`import { downloadFile } from "@/utils/downloadFile";`  
下载文件 name 为空，则从从响应头中获取文件名称  
`downloadFile(res,name)`

## 图标使用

UI 设计师提供 icon 目录：src/assets/iconfont

iconify 使用离线图标，目前只引入 ep 和 ri  
https://icon-sets.iconify.design/ep/  
https://icon-sets.iconify.design/ri/

### 全局离线图标添加

`src/components/ReIcon/src/offlineIcon.ts`

### 图标选择组件

`import IconSelect from "@/components/ReIcon/src/iconSelect.vue";`  
`<IconSelect v-model="icon" />`

### 图标显示

页面单独引用或使用全局图标

#### 组件

`<IconifyIconOffline :icon="icon" width="19" />`

#### 函数

`useRenderIcon(Icon)`
