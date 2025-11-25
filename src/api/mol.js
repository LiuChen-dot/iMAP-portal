import request from "@/utils/request";
// 元数据注册
export const getMol = (url) => {
  return request({
    url: url,
    method: "get",
  });
};
