import request from "@/utils/request";
// 数据概览
export const DataAgent = () => {
  return request({
    url: "/data/agent",
    method: "get",
  });
};
// 资产分布
export const DataMerchant = () => {
  return request({
    url: "/data/merchant",
    method: "get",
  });
};

// 资产评分
export const DataUsingUsers = () => {
  return request({
    url: "/data/usingUsers",
    method: "get",
  });
};
