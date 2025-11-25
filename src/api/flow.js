import request from "@/utils/request";
// 数据概览
export const DataFlowER = () => {
  return request({
    url: "/data/flowER",
    method: "get",
  });
};
