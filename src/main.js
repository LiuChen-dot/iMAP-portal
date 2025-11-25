import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'

import '@/assets/styles/index.scss' // global css
import "@/assets/styles/public.scss";
import "@/assets/styles/box.scss";
import "@/assets/styles/font.scss";
import "@/assets/styles/height.scss";
import "@/assets/styles/width.scss";
import "@/assets/styles/position.scss";
import "@/assets/styles/root.scss";

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive
import settings from './settings'
if(!localStorage.getItem("layout-setting")){
  localStorage.setItem("layout-setting", JSON.stringify({
    "topNav": settings.topNav,
    "tagsView": settings.tagsView,
    "fixedHeader": settings.fixedHeader,
    "sidebarLogo": settings.sidebarLogo,
    "dynamicTitle": settings.dynamicTitle,
    "sideTheme": settings.sideTheme,
    "theme": '#409EFF'
  }));
}
// import DataV, { setClassNamePrefix } from "@dataview/datav-vue3";
// 注册指令
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { parseTime, resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi'

// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 自定义树选择组件
import TreeSelect from '@/components/TreeSelect'
// 字典标签组件
import DictTag from '@/components/DictTag'

const app = createApp(App)

// 全局方法挂载
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels

// 全局组件挂载
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('TreeSelect', TreeSelect)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)

app.use(router)
app.use(store)
app.use(plugins)
// app.use(DataV, { classNamePrefix: "dv-" });
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

directive(app)
import i18n from '@/utils/i18n/i18n.js'
app.use(i18n)
// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  // 支持 large、default、small
  size: Cookies.get('size') || 'default'
})

app.mount('#app')
