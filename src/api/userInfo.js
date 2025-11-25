import request from '@/utils/request'

// 获取用户信息
export function getUserInfo() {
    return request({
        url: '/regCentre/getUserInfo',
        method: 'get'
    })
}

// 获取历史记录
export function searchHistory(params) {
    return request({
        url: `/regCentre/searchHistory`,
        method: 'get',
        params
    })
}

// 获取用户登录记录
export function sysLogininforList(params) {
    return request({
        url: '/regCentre/sysLogininforList',
        method: 'get',
        params
    })
}

// 用户密码重置
export function updateUserPwd(params) {
    return request({
        url: '/system/user/profile/updatePwd',
        method: 'put',
        params
    })
}


//更新用户个人信息
export function updateUserInfo(params) {
    return request({
        url: '/regCentre/updateUserInfo',
        method: 'post',
        data:params
    })
}
  

// 用户头像上传
export function uploadAvatar(data) {
    return request({
      url: '/system/user/profile/avatar',
      method: 'post',
      data: data
    })
  }