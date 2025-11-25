import request from "@/utils/request";
// 数据元管理
export const getElementData = () => {
  return request({
    url: "/dataStandards/element",
    method: "get",
  });
};

// 数据标准集管理
export const getSetData = () => {
  return request({
    url: "/dataStandards/set",
    method: "get",
  });
};

// 数据标准文件管理
export const getFilesData = () => {
  return request({
    url: "/dataStandards/files",
    method: "get",
  });
};

// 数据标准目录管理
export const getCatalogData = () => {
  return request({
    url: "/dataStandards/catalog",
    method: "get",
  });
};
// 目录所含标准
export const getIncludedData = () => {
  return request({
    url: "/dataStandards/catalog/included",
    method: "get",
  });
};
// 数据字典管理
export const getDictData = () => {
  return request({
    url: "/dataStandards/dict",
    method: "get",
  });
};

// 标准应用配置内部应用
export const getAppInsideConfig = () => {
  return request({
    url: "/dataStandards/appConfig/inside",
    method: "get",
  });
};
// 标准应用配置外部应用
export const getAppOutsideConfig = () => {
  return request({
    url: "/dataStandards/appConfig/outside",
    method: "get",
  });
};
// 标准服务配置
export const getServerConfig = () => {
  return request({
    url: "/dataStandards/serverConfig",
    method: "get",
  });
};
// 标准应用分析
export const getAppAnalysis = () => {
  return request({
    url: "/dataStandards/appAnalysis",
    method: "get",
  });
};

//指标字典
export const getQuotaDict = () => {
  return request({
    url: "/dataStandards/quota/dict",
    method: "get",
  });
};
// 时间周期
export const getQuotaCycleTime = () => {
  return request({
    url: "/dataStandards/quota/cycleTime",
    method: "get",
  });
};
// 修饰词
export const getQuotaModifier = () => {
  return request({
    url: "/dataStandards/quota/modifier",
    method: "get",
  });
};