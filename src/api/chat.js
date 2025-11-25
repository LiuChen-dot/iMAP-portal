import request from '@/utils/request'

// 用户会话列表
export function userList(params) {
    return request({
        url: '/conversation/userList',
        method: 'get',
    })
}
// 会话内容
export function infoList(params) {
    return request({
        url: '/conversation/infoList',
        method: 'get',
        params: params
    })
}
// 删除会话
export function delconversation(params) {
    return request({
        url: '/conversation/del',
        method: 'post',
        data: params
    })
}



