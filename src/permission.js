import router from './router'
import {
  ElMessage
} from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {
  getToken
} from '@/utils/auth'
import {
  isHttp
} from '@/utils/validate'
import {
  isRelogin
} from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import zhMessages from '@/utils/i18n/zh'
import enMessages from '@/utils/i18n/en'

// 获取翻译文本的工具函数
function getI18nMessage(key) {
  const locale = localStorage.getItem('i18n') || 'en'
  const messages = locale === 'zh' ? zhMessages : enMessages
  const keys = key.split('.')
  let value = messages
  for (const k of keys) {
    value = value?.[k]
  }
  return value || key
}

NProgress.configure({
  showSpinner: false
});

const whiteList = ['/login', '/auth-redirect', '/bind', '/register'];

router.beforeEach((to, from, next) => {
  NProgress.start()
  console.log(to)
  if(to.meta.isDev){
    ElMessage.warning(getI18nMessage('permission.featureNotAvailable'))
    next('')
    return;
  }
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({path: '/'})
      NProgress.done()

    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route) // 动态添加可访问路由表
              }
            })
            next({
              path: to.path,
              replace: true
            }) // hack方法 确保addRoutes已完成
          })
          // }).catch(err => {
          //   useUserStore().logOut().then(() => {
          //     ElMessage.error(err)
          //     next({ path: '/' })
          //   })
        })
      } else {
        next()
      }
    }
  } else {
    if (to.path == '/16S' || to.path=='/KnowledgeGraph'){
      ElMessage.warning(getI18nMessage('permission.pleaseLogin'))
      next('')
    } else {
      usePermissionStore().generateRoutes().then(accessRoutes => {
        next()
      })
    }


    // // 没有token
    // if (whiteList.indexOf(to.path) !== -1) {
    //   // 在免登录白名单，直接进入
    //   next()
    // } else {
    //   next(`/login?redirect=/KnowledgeQuery`) // 否则全部重定向到登录页
    //   NProgress.done()
    // }
  }

})

router.afterEach(() => {
  NProgress.done()
})