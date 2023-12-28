import { http } from "@/utils/http";
import { Result } from "@/api/api";

/**根据文件id查询文件详情**/
export const getFileInfo = (id?: string) => {
  return http.request<Result>("get", `/system/file/${id}`);
};

/** 上传文件 */
export const uploadFile = (data?: object, config?: object) => {
  return http.request<Result>(
    "post",
    "/system/file/uploadStatic",
    { data },
    config
  );
};
