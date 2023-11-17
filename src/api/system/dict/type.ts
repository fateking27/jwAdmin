import { http } from "@/utils/http";
import { Result } from "@/api/api";
import { downloadFile } from "@/utils/downloadFile";
import dayjs from "dayjs";
import qs from "qs";

/** 查询字典类型列表 */
export const listType = (data?: object) => {
  return http.request<Result>("get", "/system/dict/type/list", {
    params: data
  });
};

/** 查询字典类型详细 */
export const getType = dictId => {
  return http.request<Result>("get", `/system/dict/type/${dictId}`);
};

/** 新增字典类型 */
export const addType = (data?: object) => {
  return http.request<Result>("post", "/system/dict/type", { data });
};

/** 修改字典类型 */
export const updateType = (data?: object) => {
  return http.request<Result>("put", "/system/dict/type", { data });
};

/** 删除字典类型 */
export const delType = dictId => {
  return http.request<Result>("delete", `/system/dict/type/${dictId}`);
};

/** 刷新字典缓存 */
export const refreshCache = () => {
  return http.request<Result>("delete", `/system/dict/type/refreshCache`);
};

/** 查询字典类型详细 */
export const optionselect = () => {
  return http.request<Result>("get", `/system/dict/type/optionselect`);
};

/** 下载字典类型表格 */
export const exportType = (data?: any) => {
  http
    .request<Result>("post", `/system/dict/type/export`, {
      responseType: "blob",
      data: qs.stringify(data)
    })
    .then(res => {
      downloadFile(
        res,
        `字典类型列表_${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`
      );
    });
};
