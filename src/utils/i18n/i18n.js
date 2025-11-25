import {
  createI18n
} from 'vue-i18n'
import zh from './zh'
import en from './en'
import Zh from 'element-plus/es/locale/lang/zh-cn'

import En from 'element-plus/dist/locale/en.mjs'

const i18n = createI18n({
  locale: localStorage.getItem('i18n') || 'en', // 设置当前语言类型
  legacy: false, // 如果要支持compositionAPI，此项必须设置为false;
  globalInjection: true, // 全局注册$t方法
  messages: {
    zh: {
      ...zh,
      ...Zh
    },
    en: {
      ...en,
      ...En
    }
  },
})

export default i18n