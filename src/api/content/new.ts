import { http } from "@/utils/http";
import { Result } from "@/api/api";

/**查询新闻标题**/
export const listNew = (data?: object) => {
  return http.request<Result>("get", "/business/news_info/page", {
    params: data
  });
};

/**查询新闻封面**/
export const NewImg = (data?: object) => {
  return http.request<Result>("get", "/wjx/material/tree", {
    params: data
  });
};

/**id查询新闻标题**/
export const getNew = id => {
  return http.request<Result>("get", `/business/news_info/${id}`);
};

/**发布新闻信息**/
export const releaseNew = id => {
  return http.request<Result>("put", `/business/news_info/release/${id}`);
};

/** 新增新闻 */
export const addNew = (data?: object) => {
  return http.request<Result>("post", "/business/news_info", { data });
};

/** 修改信息 */
export const updateNew = (data?: object) => {
  return http.request<Result>("put", "/business/news_info", { data });
};

/** 删除新闻 */
export const delNew = ids => {
  return http.request<Result>("delete", `/business/news_info/${ids}`);
};
