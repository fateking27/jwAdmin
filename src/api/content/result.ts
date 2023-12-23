import { http } from "@/utils/http";
import { Result } from "@/api/api";

/**查询项目成果**/
export const listResult = (data?: object) => {
  return http.request<Result>("get", "/business/project_res/list", {
    params: data
  });
};

/**id查询项目成果**/
export const getResult = id => {
  return http.request<Result>("get", `/business/project_res/${id}`);
};

/**发布项目成果**/
export const releaseResult = id => {
  return http.request<Result>("put", `/business/project_res/release/${id}`);
};

/**新增项目成果**/
export const addResult = (data?: object) => {
  return http.request<Result>("post", "/business/project_res", { data });
};

/** 修改项目成果 */
export const updateResult = (data?: object) => {
  return http.request<Result>("put", "/business/project_res", { data });
};

/** 删除项目成果 */
export const delResult = ids => {
  return http.request<Result>("delete", `/business/project_res/${ids}`);
};
