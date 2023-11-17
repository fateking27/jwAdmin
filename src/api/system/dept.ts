import { http } from "@/utils/http";
import { Result } from "@/api/api";

/** 查询部门列表 */
export const listDept = (data?: object) => {
  return http.request<Result>("get", "/system/dept/list", { params: data });
};

/** 查询部门详细 */
export const getDept = deptId => {
  return http.request<Result>("get", `/system/dept/${deptId}`);
};

/** 查询部门列表（排除节点） */
export const listDeptExcludeChild = deptId => {
  return http.request<Result>("get", `/system/dept/list/exclude/${deptId}`);
};

/** 新增部门 */
export const addDept = (data?: object) => {
  return http.request<Result>("post", "/system/dept", { data });
};

/** 修改部门 */
export const updateDept = (data?: object) => {
  return http.request<Result>("put", "/system/dept", { data });
};

/** 删除部门 */
export const delDept = deptId => {
  return http.request<Result>("delete", `/system/dept/${deptId}`);
};
