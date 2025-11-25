import request from "@/utils/request";
// 数据概览
export const DataRelation = () => {
  return request({
    url: "/data/relation",
    method: "get",
  });
};
// 图标决策
export const DataDecision = () => {
  return request({
    url: "/data/decision",
    method: "get",
  });
};

// 弧线图
export const DataCircular = () => {
  return request({
    url: "/data/circular",
    method: "get",
  });
};

export const DataTweet = ()=>{
  return request({
    url: "/data/tweet",
    method: "get",
  });
}