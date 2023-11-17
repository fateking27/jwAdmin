import { http } from "@/utils/http";
import { Result } from "@/api/api";
import { downloadFile } from "@/utils/downloadFile";
import dayjs from "dayjs";
import qs from "qs";

/** 查询操作日志列表 */
export const listOperlog = (data?: object) => {
  return http.request<Result>("get", "/monitor/operlog/list", { params: data });
};

/** 删除操作日志 */
export const delOperlog = operId => {
  return http.request<Result>("delete", `/monitor/operlog/${operId}`);
};

/** 清空操作日志 */
export const cleanOperlog = () => {
  return http.request<Result>("delete", `/monitor/operlog/clean`);
};

/** 下载操作日志 */
export const exportOperlog = (data?: any) => {
  http
    .request<Result>("post", `/monitor/operlog/export`, {
      responseType: "blob",
      data: qs.stringify(data)
    })
    .then(res => {
      downloadFile(
        res,
        `操作日志_${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`
      );
    });
};
