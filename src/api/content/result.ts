import { http } from "@/utils/http";
import { Result } from "@/api/api";

/**查询修复进度**/
export const listProgress = (data?: object) => {
  return http.request<Result>(
    "get",
    "/business/project_res/list_repair_progress",
    {
      params: data
    }
  );
};

/**新增修复进度**/
export const addProgress = (data?: object) => {
  return http.request<Result>("post", "/business/project_res/repair_progress", {
    data
  });
};

/**新增当前成果**/
export const addCurrent = (data?: object) => {
  return http.request<Result>("post", "/business/project_res/achievement", {
    data
  });
};

/**查询当前成果**/
export const listCurrent = (data?: object) => {
  return http.request<Result>("get", "/business/project_res/list_achievement", {
    params: data
  });
};

/**新增阶段成果**/
export const addPage = (data?: object) => {
  return http.request<Result>("post", "/business/project_res/stage_display", {
    data
  });
};

/**查询阶段成果信息**/
export const listPage = (data?: object) => {
  return http.request<Result>(
    "get",
    "/business/project_res/list_stage_display",
    {
      params: data
    }
  );
};

/**id查询项目成果**/
export const getResult = id => {
  return http.request<Result>("get", `/business/project_res/${id}`);
};

/** 修改项目成果 */
export const updateResult = (data?: object) => {
  return http.request<Result>("put", "/business/project_res", { data });
};

/** 删除项目成果 */
export const delResult = ids => {
  return http.request<Result>("delete", `/business/project_res/${ids}`);
};

/**发布项目成果**/
export const releaseResult = id => {
  return http.request<Result>("put", `/business/project_res/release/{id}`);
};
