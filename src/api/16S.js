import request from '@/utils/request'

// 查询字典数据列表
export function listData(query) {
    return request({
        url: '/system/dict/data/list',
        method: 'get',
        params: query
    })
}
//工具列表查询接口
export function list(query) {
    return request({
        url: '/atlas/scripts/list',
        method: 'get',
        params: query
    })
}
//工具详情查询接口
export function scripts(query) {
    return request({
        url: `/atlas/scripts/${query.scriptsId}`,
        method: 'get',
    })
}
//数据文件上传接口
export function uploadDataFile(data) {
    return request({
        url: '/atlas/task/uploadDataFile',
        method: 'post',
        data
    })
}
//数据文件删除接口
export function deleteFile(params) {
    return request({
        url: '/atlas/task/deleteFile', 
        method: 'get',
        params
    })
}
//任务提交操作
export function start(data) {
    return request({
        url: '/atlas/task/start',
        method: 'post',
        data
    })
}
//任务列表接口
export function tasklist(query) {
    return request({
        url: '/atlas/task/list',
        method: 'get',
        params: query
    })
}
//任务详情接口
export function getInfo(query) {
    return request({
        url: '/atlas/task/getInfo',
        method: 'get',
        params: query
    })
}

//任务详情接口
export function getDownload(params) {
    return request({
        url: '/atlas/task/download',
        method: 'get',
        params,
        responseType: 'blob',
        headers: {
            'Content-Disposition': 'attachment'
        }
    })
}

//启动应用配置接口
export function start2(data) {
    return request({
        url: '/atlas/task/start2',
        method: 'post',
        data
    })
}

//请求图片列表接口
export function queryImages(params) {
    return request({
        url: 'atlas/task/queryImages',
        method: 'get',
        params
    })
}

//统计任务接口
export function count(params) {
    return request({
        url: 'atlas/task/count',
        method: 'get',
        params
    })
}

//任务列表接口
export function listByStatus(params) {
    return request({
        url: 'atlas/task/listByStatus',
        method: 'get',
        params
    })
}

//历史记录详情接口
export function getInfoByName(params) {
    return request({
        url: 'atlas/task/getInfoByName',
        method: 'get',
        params
    })
}


export function simpleLog(params) {
    return request({
        url: '/atlas/taskLog/simpleLog?taskName='+params,
        method: 'get',
    })
}

export function getStatus(params) {
    return request({
        url: '/atlas/task/getStatus',
        method: 'get',
        params:params
    })
}


export function listByScriptId(params) {
    return request({
        url: '/atlas/taskAttachment/listByScriptId',
        method: 'get',
        params:params
    })
}

export function taskAttachmentdownload(params) {
    return request({
        url: '/atlas/taskAttachment/download',
        method: 'get',
        params:params,
        headers: {
            'content-type': 'application/octet-stream'
        }
    })
}


export function taskAttachmentexport() {
    return request({
        url: '/atlas/taskAttachment/export',
        method: 'get',
    })
}

export function taskAttachmentjoinReport(params) {
    return request({
        url: '/atlas/taskAttachment/joinReport',
        method: 'get',
        params:params,
    })
}






