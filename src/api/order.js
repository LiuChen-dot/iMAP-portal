import request from "@/utils/request";
// 数据概览
export const OrderMerchant = () => {
  return request({
    url: "/order/merchant",
    method: "get",
  });
};
// 资产分布
export const DataDetect = () => {
  return request({
    url: "/data/detect",
    method: "get",
  });
};

// 资产评分
export const DataEquipment = () => {
  return request({
    url: "/data/equipment",
    method: "get",
  });
};
