import request from "@/utils/request";
// 元数据注册
export const getMetaRegistry = () => {
  return request({
    url: "/metadata/registry",
    method: "post",
  });
};
// 元数据检索
export const getMetaQuery = () => {
  return request({
    url: "/metadata/query",
    method: "post",
  });
};
// 血缘关系
export const getMetaQueryBlood = () => {
  return request({
    url: "/metadata/query/blood",
    method: "post",
  });
};
// 列表视图
export const getMetaQueryList = () => {
  return request({
    url: "/metadata/query/list",
    method: "post",
  });
};
// 元数据分析
export const getMetaAnalysis = () => {
  return request({
    url: "/metadata/analysis",
    method: "post",
  });
};
