import { http } from "@/utils/http";
import { Result } from "@/api/api";

/**查询项目介绍**/
export const listPortal = (data?: object) => {
  return http.request<Result>("get", "/business/project_intro/list", {
    params: data
  });
};

/**id查询项目介绍**/
export const getPortal = id => {
  return http.request<Result>("get", `/business/project_intro/${id}`);
};

/**发布文章**/
export const releasePortal = id => {
  return http.request<Result>("put", `/business/project_intro/release/${id}`);
};

/**新增项目介绍**/
export const addPortal = (data?: object) => {
  return http.request<Result>("post", "/business/project_intro", { data });
};

/** 修改门户及项目介绍 */
export const updatePortal = (data?: object) => {
  return http.request<Result>("put", "/business/project_intro", { data });
};

/** 删除文章 */
export const delPortal = ids => {
  return http.request<Result>("delete", `/business/project_intro/${ids}`);
};
