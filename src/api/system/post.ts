import { http } from "@/utils/http";
import { Result } from "@/api/api";
import dayjs from "dayjs";
import { downloadFile } from "@/utils/downloadFile";
import qs from "qs";

/** 查询岗位列表 */
export const listPost = (data?: object) => {
  return http.request<Result>("get", "/system/post/list", { params: data });
};

/** 查询岗位详细 */
export const getPost = postId => {
  return http.request<Result>("get", `/system/post/${postId}`);
};

/** 新增岗位 */
export const addPost = (data?: object) => {
  return http.request<Result>("post", "/system/post", { data });
};

/** 修改岗位 */
export const updatePost = (data?: object) => {
  return http.request<Result>("put", "/system/post", { data });
};

/** 删除岗位 */
export const delPost = postId => {
  return http.request<Result>("delete", `/system/post/${postId}`);
};

/** 下载岗位表格 */
export const exportPost = (data?: any) => {
  http
    .request<Result>("post", `/system/post/export`, {
      responseType: "blob",
      data: qs.stringify(data)
    })
    .then(res => {
      downloadFile(
        res,
        `岗位列表_${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`
      );
    });
};
