import { http } from "@/utils/http";
import { Result } from "@/api/api";

/**分页查询列表信息**/
export const listPicture = (data?: object) => {
  return http.request<Result>("get", "/business/material/list_picture", {
    params: data
  });
};

/**根据id查询素材信息**/
export const getPicture = id => {
  return http.request<Result>("get", `/business/material/${id}`);
};

/** 新增图片素材 */
export const addPicture = (data?: object) => {
  return http.request<Result>("post", "/business/material/picture", { data });
};

/** 修改图片信息 */
export const editPicture = (data?: object) => {
  return http.request<Result>("put", "/business/material", { data });
};

/** 删除图片素材 */
export const delPicture = ids => {
  return http.request<Result>("delete", `/business/material/${ids}`);
};
/** 上传图片素材 */
export const uploadstaticImage = (data?: object, config?: object) => {
  return http.request<Result>(
    "post",
    "/system/file/uploadStatic",
    { data },
    config
  );
};
/** 下载图片素材 */
export const getStaticImage = fileName => {
  return http.request<Result>("get", `/business/download/${fileName}`);
};
