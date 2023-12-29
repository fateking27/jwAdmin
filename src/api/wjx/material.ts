import { http } from "@/utils/http";
import { Result } from "@/api/api";

/**新增素材**/
export const addMaterial = (data?: object) => {
  return http.request<Result>("post", "/wjx/material", { data });
};

/**删除素材**/
export const removeMaterial = (id?: number) => {
  return http.request<Result>("delete", "/wjx/material", { params: { id } });
};

/**更新素材**/
export const updateMaterial = (data?: object) => {
  return http.request<Result>("put", "/wjx/material", { data });
};

/**分页查询素材**/
export const getMaterialPage = (data?: object) => {
  return http.request<Result>("get", "/wjx/material/page", { params: data });
};

/**分组获取素材列表(图片和视频)**/
export const getMaterialTree = () => {
  return http.request<Result>("get", "/wjx/material/tree2");
};
