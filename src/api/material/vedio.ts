import { http } from "@/utils/http";
import { Result } from "@/api/api";

/**分页查询列表信息**/
export const listVedio = (data?: object) => {
  return http.request<Result>("get", "/business/material/list_vedio", {
    params: data
  });
};

/**根据id查询素材信息**/
export const getVedio = id => {
  return http.request<Result>("get", `/business/material/${id}`);
};

/** 新增视频素材 */
export const addVedio = (data?: object) => {
  return http.request<Result>("post", "/business/material/vedio", { data });
};

/** 修改视频信息 */
export const editVedio = (data?: object) => {
  return http.request<Result>("put", "/business/material", { data });
};

/** 删除视频素材 */
export const delVedio = ids => {
  return http.request<Result>("delete", `/business/material/${ids}`);
};
