import request from "@/utils/request";
// 收款账号
export const DataAccount = () => {
  return request({
    url: "/data/account",
    method: "get",
  });
};
// 商户余额
export const DataBalance = () => {
  return request({
    url: "/data/balance",
    method: "get",
  });
};

// 商户收益
export const DataIncome = () => {
  return request({
    url: "/data/income",
    method: "get",
  });
};

// 收益明细
export const DataRevenueDetails = () => {
  return request({
    url: "/data/revenueDetails",
    method: "get",
  });
};

// 账户余额
export const DataAccountBalance = () => {
  return request({
    url: "/data/accountBalance",
    method: "get",
  });
};