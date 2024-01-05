import { http } from "@/utils/http";
import { Result } from "@/api/api";
import { downloadFile } from "@/utils/downloadFile";
import dayjs from "dayjs";
import qs from "qs";

/**初始化时获取全部文章近一个月浏览量**/
export const listBrowse = (data?: object) => {
  return http.request<Result>("get", "/business/bro/day_view_count", {
    params: data
  });
};

/**初始化时获取新闻信息所有文章近一个月**/
export const newCount = (data?: object) => {
  return http.request<Result>("get", "/business/bro/day_view_count_news", {
    params: data
  });
};

/**查询筛选条件后的日浏览量数据**/
export const listArticle = (data?: object) => {
  return http.request<Result>("get", "/business/browse/treeList", {
    params: data
  });
};

/**导出浏览量记录**/
export const listExport = (data?: any) => {
  return http
    .request<Result>("get", "/business/browse/export", {
      responseType: "blob",
      data: qs.stringify(data)
    })
    .then(res => {
      downloadFile(
        res,
        `浏览记录列表_${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`
      );
    });
};
