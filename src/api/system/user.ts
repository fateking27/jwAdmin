import { http } from "@/utils/http";
import { Result } from "@/api/api";
import { parseStrEmpty } from "@/utils/ruoyi";
import { downloadFile } from "@/utils/downloadFile";
import dayjs from "dayjs";
import qs from "qs";

/** 查询角色列表 */
export const deptTreeSelect = () => {
  return http.request<Result>("get", "/system/user/deptTree");
};

/** 查询用户列表 */
export const listUser = (data?: object) => {
  return http.request<Result>("get", "/system/user/list", { params: data });
};

/** 用户状态修改 */
export const changeUserStatus = (userId, status) => {
  const data = {
    userId,
    status
  };
  return http.request<Result>("put", "/system/user/changeStatus", {
    data: data
  });
};

/** 查询用户详细 */
export const getUser = (userId?: string) => {
  return http.request<Result>("get", `/system/user/${parseStrEmpty(userId)}`);
};

/** 新增用户 */
export const addUser = (data?: object) => {
  return http.request<Result>("post", "/system/user", { data });
};

/** 修改用户 */
export const updateUser = (data?: object) => {
  return http.request<Result>("put", "/system/user", { data });
};

/** 查询用户详细 */
export const delUser = (userId?: string) => {
  return http.request<Result>(
    "delete",
    `/system/user/${parseStrEmpty(userId)}`
  );
};

/** 用户密码重置 */
export const resetUserPwd = (userId, password) => {
  const data = {
    userId,
    password
  };
  return http.request<Result>("put", "/system/user/resetPwd", {
    data: data
  });
};

/** 查询用户详细 */
export const getAuthRole = (userId?: string) => {
  return http.request<Result>(
    "get",
    `/system/user/authRole/${parseStrEmpty(userId)}`
  );
};

/** 保存授权角色 */
export const updateAuthRole = (data?: object) => {
  return http.request<Result>("put", "/system/user/authRole", { params: data });
};

/** 导入用户模板下载 */
export const exportUserTemplate = () => {
  http
    .request<Result>("post", "/system/user/importTemplate", {
      responseType: "blob"
    })
    .then(res => {
      downloadFile(
        res,
        `导入用户模板_${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`
      );
    });
};

/** 导入用户 */
export const importUserData = (data?: any) => {
  const form = new FormData();
  form.append("file", data.file);
  return http.request<Result>(
    "post",
    `/system/user/importData?updateSupport=${data.updateSupport}`,
    { data: form }
  );
};

/** 用户列表下载 */
export const exportUser = (data?: any) => {
  http
    .request<Result>("post", "/system/user/export", {
      responseType: "blob",
      data: qs.stringify(data)
    })
    .then(res => {
      downloadFile(
        res,
        `用户列表_${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`
      );
    });
};

/** 查询用户个人信息 */
export const getUserProfile = () => {
  return http.request<Result>("get", "/system/user/profile");
};

/** 修改用户个人信息 */
export const updateUserProfile = (data?: object) => {
  return http.request<Result>("put", "/system/user/profile", { data });
};

/** 用户密码重置 */
export const updateUserPwd = (oldPassword, newPassword) => {
  const data = {
    oldPassword,
    newPassword
  };
  return http.request<Result>("put", "/system/user/profile/updatePwd", {
    params: data
  });
};
