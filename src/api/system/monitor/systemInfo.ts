import { http } from "@/utils/http";
import { Result } from "@/api/api";

/** 获取系统信息 */
export const getSystemInfo = () => {
  return http.request<Result>("get", "/system/info/getSysInfo");
};
