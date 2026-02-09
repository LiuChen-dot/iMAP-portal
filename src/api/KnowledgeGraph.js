import request from '@/utils/request'

// 查询字典数据列表
export function getGraph(params) {
    return request({
        url: `graph/getGraph?id=${params.id}&type=${params.type}`,
        method: 'get',
    })
}

// 查询字典数据列表（name 需编码以支持括号等特殊字符）
export function findGraph(params) {
    const name = params.name != null ? encodeURIComponent(params.name) : ''
    return request({
        url: `graph/findGraph?name=${name}&type=${params.type}`,
        method: 'get',
    })
}

// 查询字典数据列表
export function getSummary(params) {
    return request({
        url: `graph/getSummary?id=${params.id}&type=${params.type}`,
        method: 'get',
    })
}

export function searchGraph(params) {
    return request({
        url: `graph/searchGraph`,
        method: 'get',
        params: params
    })
}

