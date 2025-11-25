import request from "@/utils/request";
// 设备信息
export const DeviceInfo = () => {
  return request({
    url: "/device/info",
    method: "get",
  });
};
// 设备状态
export const DeviceStatus = () => {
  return request({
    url: "/device/status",
    method: "get",
  });
};

// 投放管理
export const DeviceLaunch = () => {
  return request({
    url: "/device/launch",
    method: "get",
  });
};
