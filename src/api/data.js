import request from '@/utils/request'

// 获取基础数据的类型
export function getDataTypeData() {
  return request({
    url: '/baseData/getDataType',
    method: 'get'
  })
}
 
// 获取基础数据的类型
export function platformAggregation() {
  return request({
    url: '/baseData/platformAggregation',
    method: 'get'
  })
}

//数据查询
export function searchByPage(pageNum,pageSize,params) {
  return request({
    url: '/baseData/searchByPage?pageNum=' + pageNum + '&pageSize=' + pageSize,
    method: 'post',
    data: params,
  })
}

 //类型查询
export function getsearchAggregation(params) {
  return request({
    url: '/baseData/searchAggregation',
    method: 'post',
    data: params,
  })
}
 
//protein
export function getproteinData(params) {
  return request({
    url: '/protein/'+params,
    method: 'get',
  })
}
  
//gene
export function getgeneData(params) {
  return request({
    url: '/gene/'+params,
    method: 'get',
  })
}

//rna
export function getrnaData(params) {
  return request({
    url: '/rna/'+params,
    method: 'get',
  })
}

//taxonomy
export function gettaxonomyData() {
  return request({
    url: '/taxonomy/getBaseTree',
    method: 'get',
  })
}

//idtaxonomy
export function getidtaxonomyData(id) {
  return request({
    url: `/taxonomy/getBaseTreeLeafNode?id=${id}`,
  })
}


//basic_information
export function getBasicInformationData(params) {
  return request({
    url: '/BasicInformation/'+params,
    method: 'get',
  })
}

//Disease
export function getdiseaseData(params) {
  return request({
    url: '/disease/'+params,
    method: 'get',
  })
}

//small molecule
export function getsmallMoleculeData(params) {
  return request({
    url: '/smallMolecule/'+params,
    method: 'get',
  })
}


//small molecule
export function getGoData(params) {
  return request({
    url: '/go/'+params,
    method: 'get',
  })
}



