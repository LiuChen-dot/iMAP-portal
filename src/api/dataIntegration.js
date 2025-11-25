import request from "@/utils/request";
// 数据概览
export const getDataSource = () => {
  return request({
    url: "/data/source",
    method: "post",
  });
};
// 数据采集
export const getDataAcquisition = () => {
  return request({
    url: "/data/acquisition",
    method: "post",
  });
};
// 数据清洗
export const getDataCleaning = () => {
  return request({
    url: "/data/cleaning",
    method: "post",
  });
};

