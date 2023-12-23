import { http } from "@/utils/http";
import { Result } from "@/api/api";

/**查询新闻标题**/
export const listUsers = (data?: object) => {
  return http.request<Result>("get", "/pageList", {
    params: data
  });
};
