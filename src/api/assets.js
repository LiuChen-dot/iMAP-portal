import request from "@/utils/request";
// 数据概览
export const getDataAssets = () => {
  return request({
    url: "/getDataAssets",
    method: "get",
  });
};
// 资产分布
export const getAllocation = () => {
  return request({
    url: "/assets/allocation",
    method: "get",
  });
};

// 资产评分
export const getScore = () => {
  return request({
    url: "/assets/score",
    method: "get",
  });
};
// 目录数据
export const getCatalog = () => {
  return request({
    url: "/assets/catalog",
    method: "post",
  });
};
// 字段信息
export const getFieldInfo = () => {
  return request({
    url: "/assets/catalog/field",
    method: "post",
  });
};

// 数据预览
export const getDataPreview = () => {
  return request({
    url: "/assets/catalog/dataPreview",
    method: "post",
  });
};

// 资产类目
export const getMapCatalogData = () => {
  return request({
    url: "/assets/map/catalogData",
    method: "get",
  });
};
// 近期浏览的资产
export const getScanData = () => {
  return request({
    url: "/assets/map/scanData",
    method: "get",
  });
};
// 热门搜索的资产
export const getSearchData = () => {
  return request({
    url: "/assets/map/searchData",
    method: "get",
  });
};
// 资产类型定义
export const getTypeDefinition = () => {
  return request({
    url: "/assets/typeDefinition",
    method: "post",
  });
};

// 资产类目配置
export const getCatalogConfig = () => {
  return request({
    url: "/assets/catalogConfig",
    method: "post",
  });
};

// 资产标签配置
export const getLabelConfig = () => {
  return request({
    url: "/assets/labelConfig",
    method: "post",
  });
};
// 资产目录挂接
export const getCatalogMount = () => {
  return request({
    url: "/assets/catalogMount",
    method: "post",
  });
};

// 热词 
export const getHotWords = () => {
  return request({
    url: "/assets/analysis/hotWords",
    method: "post",
  });
};
// 共享资产
export const getShareAsset = () => {
  return request({
    url: "/assets/analysis/shareAsset",
    method: "post",
  });
};

// 资产审核
export const getReviewData = () => {
  return request({
    url: "/assets/reviewData",
    method: "post",
  });
};

// 资产api
export const getApiData = () => {
  return request({
    url: "/assets/apiData",
    method: "post",
  });
};