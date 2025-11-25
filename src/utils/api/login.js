import request from '@/utils/request.js'
const api = {}
//登录
api.login = (data) => request({
    url: '/login',
    method: 'post',
    data
})
//图形验证码
api.captchaImage = () => request({
    url: '/registered/user/captchaImage',
    method: 'get'
})
//判断手机号是否重复
api.phoneVerification = (data) => request({
    url: '/registered/user/phoneVerification',
    method: 'post',
    data
})
//获取手机号验证码
api.sendPhoneVerificationCode = (data) => request({
    url: '/registered/user/sendPhoneVerificationCode',
    method: 'post',
    data
})
//工作类型
api.gettype_simp = () => request({
    url: 'system/dict/data/type_simp/type_of_work_unit',
    method: 'get',
})
//注册
api.registered = (data) => request({
    url: '/registered/user/registered',
    method: 'post',
    data
})
//忘记密码第一步
api.forgottenPassword = (data) => request({
    url: '/registered/user/forgottenPassword',
    method: 'post',
    data
})
//忘记密码第二步
api.doForgottenPassword = (data) => request({
    url: '/registered/user/doForgottenPassword',
    method: 'post',
    data
})
//验证当前用户是否需要重新查看用户协议
api.validateUserAgreement = (params) => request({
    url: '/registered/user/validateUserAgreement',
    method: 'get',
    params
})
//获取用户协议
api.getAgreement = () => request({
    url: '/sys/agreement/getAgreement',
    method: 'get',
})
export default api