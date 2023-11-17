import { defineStore } from "pinia";
import { store } from "@/store";
import { resData, userType } from "./types";
import { routerArrays } from "@/layout/types";
import { router, resetRouter } from "@/router";
import { storageLocal } from "@pureadmin/utils";
import { getLogin, refreshTokenApi } from "@/api/user";
import { UserResult, RefreshTokenResult } from "@/api/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import {
  type DataInfo,
  setToken,
  removeToken,
  sessionKey,
  TokenKey,
  setTokenNew
} from "@/utils/auth";
import { getInfo } from "@/api/user";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    token: storageLocal().getItem(TokenKey) ?? "",
    // 用户名
    username:
      storageLocal().getItem<DataInfo<number>>(sessionKey)?.username ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(sessionKey)?.roles ?? [],
    permissions:
      storageLocal().getItem<DataInfo<number>>(sessionKey)?.permissions ?? []
  }),
  actions: {
    /** 存储token */
    SET_TOKEN(token) {
      this.token = token;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(data => {
            if (data) {
              // setToken(data.data);
              setTokenNew(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    // 获取用户信息
    getUserInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res: resData) => {
            const user = res.data.user;
            // const avatar = (user.avatar == "" || user.avatar == null) ? '' : user.avatar;

            if (res.data.roles && res.data.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              this.roles = res.data.roles;
              this.permissions = res.data.permissions;
            } else {
              this.roles = ["ROLE_DEFAULT"];
            }
            this.username = user.userName;
            storageLocal().setItem(sessionKey, {
              info: user,
              username: this.username,
              permissions: this.permissions,
              roles: this.roles
            });
            // this.avatar = avatar;
            resolve(res);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.token = "";
      this.username = "";
      this.roles = [];
      this.permissions = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
