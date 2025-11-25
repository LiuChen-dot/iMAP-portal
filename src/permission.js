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

NProgress.configure({
  showSpinner: false
});

const whiteList = ['/login', '/auth-redirect', '/bind', '/register'];

router.beforeEach((to, from, next) => {
  NProgress.start()
  console.log(to)
  if(to.meta.isDev){
    ElMessage.warning('该功能暂未开放，敬请期待. . .')
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
    if (to.path == '/Search'||to.path == '/16S' || to.path=='/KnowledgeGraph'|| to.path=='/GenomeBrowser'|| to.path=='/MetagenomicAnalysis'|| to.path=='/Stastics'|| to.path=='/IntelligentQ&A') {
      ElMessage.warning('请先进行登录!')
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