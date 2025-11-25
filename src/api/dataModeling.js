import request from "@/utils/request";
// 数据概览
export const getDomain = () => {
  return request({
    url: "/dataModeling/domain",
    method: "post",
  });
};
export const getModelConfig = () => {
  return request({
    url: "/dataModeling/model/config",
    method: "get",
  });
};
export const getDataPreview = () => {
  return request({
    url: "/dataModeling/data/preview",
    method: "get",
  });
};
// 数据采集
export const getDimension = () => {
  return request({
    url: "/dataModeling/dimension",
    method: "post",
  });
};
// 数据清洗
export const getFact = () => {
  return request({
    url: "/dataModeling/fact",
    method: "post",
  });
};
// 数据清洗
export const getMultiModel = () => {
  return request({
    url: "/dataModeling/multiModel",
    method: "post",
  });
};
