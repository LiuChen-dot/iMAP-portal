import {
  login,
  logout,
  getInfo
} from '@/api/login'

import api from '@/utils/api/index'
import {
  getToken,
  setToken,
  removeToken,
  setnickName,
  removenickName
} from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'
const useUserStore = defineStore(
  'user', {
    state: () => ({
      token: getToken(),
      name: '',
      nickName:'',
      avatar: '',
      roles: [],
      permissions: []
    }),
    actions: {
      // 登录
      login(userInfo) {
        return new Promise((resolve, reject) => {
          api.login(userInfo).then(res => {
            setToken(res.token)
            this.token = res.token
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            setnickName(res.user.nickName)
            const user = res.user
            const avatar = (user.avatar == "" || user.avatar == null) ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar;
            localStorage.setItem('userinfo',JSON.stringify(res.user))
            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.name = user.userName
            this.nickName = user.nickName
            this.avatar = avatar;
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          // logout(this.token).then(() => {
          this.token = ''
          this.roles = []
          this.permissions = []
          removeToken()
          removenickName()
          resolve()
          // }).catch(error => {
          //   reject(error)
          // })
        })
      }
    }
  })

export default useUserStore