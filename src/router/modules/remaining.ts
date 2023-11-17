const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
      showLink: false,
      rank: 101
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: "加载中...",
      showLink: false,
      rank: 102
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  },
  {
    path: "/user",
    component: Layout,
    redirect: "/user/profile",
    meta: {
      title: "用户信息",
      showLink: false,
      rank: 105
    },
    children: [
      {
        path: "/user/profile",
        name: "UserProfile",
        component: () => import("@/views/system/user/profile/index.vue"),
        meta: {
          title: "个人中心"
        }
      }
    ]
  }
] as Array<RouteConfigsTable>;
