import { http } from "@/utils/http";
import { Result } from "@/api/api";

/** 获取菜单管理列表 */
export const listMenu = (data?: object) => {
  return http.request<Result>("get", "/system/menu/list", { params: data });
};

/** 查询菜单详细 */
export const getMenu = menuId => {
  return http.request<Result>("get", `/system/menu/${menuId}`);
};

/** 查询菜单下拉树结构 */
export const treeselect = () => {
  return http.request<Result>("get", "/system/menu/treeselect");
};

/** 根据角色ID查询菜单下拉树结构 */
export const roleMenuTreeselect = roleId => {
  return http.request<Result>(
    "get",
    `/system/menu/roleMenuTreeselect/${roleId}`
  );
};

/** 新增菜单 */
export const addMenu = (data?: object) => {
  return http.request<Result>("post", "/system/menu", { data });
};

/** 修改菜单 */
export const updateMenu = (data?: object) => {
  return http.request<Result>("put", "/system/menu", { data });
};

/** 删除菜单 */
export const delMenu = menuId => {
  return http.request<Result>("delete", `/system/menu/${menuId}`);
};
