import { http } from "@/utils/http";
import { Result } from "@/api/api";
import { downloadFile } from "@/utils/downloadFile";
import dayjs from "dayjs";
import qs from "qs";

/** 查询字典数据列表 */
export const listData = (data?: object) => {
  return http.request<Result>("get", "/system/dict/data/list", {
    params: data
  });
};

/** 查询字典数据详细 */
export const getData = dictCode => {
  return http.request<Result>("get", `/system/dict/data/${dictCode}`);
};

/** 根据字典类型查询字典数据信息 */
export const getDicts = dictType => {
  return http.request<Result>("get", `/system/dict/data/type/${dictType}`);
};

/** 新增字典数据 */
export const addData = (data?: object) => {
  return http.request<Result>("post", "/system/dict/data", { data });
};

/** 修改字典数据 */
export const updateData = (data?: object) => {
  return http.request<Result>("put", "/system/dict/data", { data });
};

/** 删除字典数据 */
export const delData = dictCode => {
  return http.request<Result>("delete", `/system/dict/data/${dictCode}`);
};

/** 下载字典数据表格 */
export const exportData = (data?: any) => {
  http
    .request<Result>("post", `/system/dict/data/export`, {
      responseType: "blob",
      data: qs.stringify(data)
    })
    .then(res => {
      downloadFile(
        res,
        `${data.dictName}字典数据列表_${dayjs().format(
          "YYYY-MM-DD HH:mm:ss"
        )}.xlsx`
      );
    });
};
