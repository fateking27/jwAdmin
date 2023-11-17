import { http } from "@/utils/http";
import { Result } from "@/api/api";
import { downloadFile } from "@/utils/downloadFile";
import dayjs from "dayjs";
import qs from "qs";

/** 查询登录日志列表 */
export const listLogininfor = (data?: object) => {
  return http.request<Result>("get", "/monitor/logininfor/list", {
    params: data
  });
};

/** 删除登录日志 */
export const delLogininfor = infoId => {
  return http.request<Result>("delete", `/monitor/logininfor/${infoId}`);
};

/** 解锁用户登录状态 */
export const unlockLogininfor = userName => {
  return http.request<Result>("get", `/monitor/logininfor/unlock/${userName}`);
};

/** 清空登录日志 */
export const cleanLogininfor = () => {
  return http.request<Result>("delete", `/monitor/logininfor/clean`);
};

/** 下载登录日志 */
export const exportLogininfor = (data?: any) => {
  http
    .request<Result>("post", `/monitor/logininfor/export`, {
      responseType: "blob",
      data: qs.stringify(data)
    })
    .then(res => {
      downloadFile(
        res,
        `登录日志_${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`
      );
    });
};
