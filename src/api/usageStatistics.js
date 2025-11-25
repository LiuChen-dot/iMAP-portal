import request from "@/utils/request";
// 采样统计
export const DataSampling = () => {
  return request({
    url: "/data/sampling",
    method: "get",
  });
};
// 检测统计
export const DataDetection = () => {
  return request({
    url: "/data/detection",
    method: "get",
  });
};

// 扫码统计
export const DataScan = () => {
  return request({
    url: "/data/scan",
    method: "get",
  });
};
