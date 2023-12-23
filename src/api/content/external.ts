import { http } from "@/utils/http";
import { Result } from "@/api/api";

/**查询**/
export const listExternal = (data?: object) => {
  return http.request<Result>("get", "/business/external/list", {
    params: data
  });
};

/**id查询**/
export const getExternal = id => {
  return http.request<Result>("get", `/business/external/${id}`);
};

/**发布文章**/
export const releaseExternal = id => {
  return http.request<Result>("put", `/business/external/release/${id}`);
};

/**新增项目介绍**/
export const addExternal = (data?: object) => {
  return http.request<Result>("post", "/business/external", { data });
};

/** 修改文章 */
export const updateExternal = (data?: object) => {
  return http.request<Result>("put", "/business/external", { data });
};

/** 删除文章 */
export const delExternal = id => {
  return http.request<Result>("delete", `/business/external/${id}`);
};
