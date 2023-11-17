import { http } from "@/utils/http";
import { Result } from "@/api/api";
import dayjs from "dayjs";
import { downloadFile } from "@/utils/downloadFile";
import qs from "qs";

/** 查询角色列表 */
export const listRole = (data?: object) => {
  return http.request<Result>("get", "/system/role/list", { params: data });
};

/** 查询角色详细 */
export const getRole = roleId => {
  return http.request<Result>("get", `/system/role/${roleId}`);
};

/** 新增角色 */
export const addRole = (data?: object) => {
  return http.request<Result>("post", "/system/role", { data });
};

/** 修改角色 */
export const updateRole = (data?: object) => {
  return http.request<Result>("put", "/system/role", { data });
};

/** 角色数据权限 */
export const dataScope = (data?: object) => {
  return http.request<Result>("put", "/system/role/dataScope", { data });
};

/** 角色状态修改 */
export const changeRoleStatus = (roleId, status) => {
  const data = {
    roleId,
    status
  };
  return http.request<Result>("put", "/system/role/changeStatus", { data });
};

/** 删除角色 */
export const delRole = roleId => {
  return http.request<Result>("delete", `/system/role/${roleId}`);
};

/** 查询角色已授权用户列表 */
export const allocatedUserList = (data?: object) => {
  return http.request<Result>("get", `/system/role/authUser/allocatedList`, {
    params: data
  });
};

/** 查询角色未授权用户列表 */
export const unallocatedUserList = (data?: object) => {
  return http.request<Result>("get", `/system/role/authUser/unallocatedList`, {
    params: data
  });
};

/** 取消用户授权角色 */
export const authUserCancel = (data?: object) => {
  return http.request<Result>("put", "/system/role/authUser/cancel", { data });
};

/** 批量取消用户授权角色 */
export const authUserCancelAll = (data?: object) => {
  return http.request<Result>("put", "/system/role/authUser/cancelAll", {
    params: data
  });
};

/** 授权用户选择 */
export const authUserSelectAll = (data?: object) => {
  return http.request<Result>("put", "/system/role/authUser/selectAll", {
    params: data
  });
};

/** 根据角色ID查询部门树结构 */
export const deptTreeSelect = roleId => {
  return http.request<Result>("get", `/system/role/deptTree/${roleId}`);
};

/** 下载角色表格 */
export const exportRole = (data?: any) => {
  http
    .request<Result>("post", `/system/role/export`, {
      responseType: "blob",
      data: qs.stringify(data)
    })
    .then(res => {
      downloadFile(
        res,
        `角色列表_${dayjs().format("YYYY-MM-DD HH:mm:ss")}.xlsx`
      );
    });
};
