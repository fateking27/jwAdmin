<template>
  <h1 />
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { storageLocal } from "@pureadmin/utils";
import { router } from "@/router";

defineOptions({
  name: "Welcome"
});

/** 初始化重定向到第一个子页面 by xdp */
const getLastChild = item => {
  if (item?.children?.length > 0) {
    getLastChild(item?.children[0]);
  } else {
    router.push(item.path);
  }
};

onMounted(() => {
  const key = "async-routes";
  const asyncRouteList = storageLocal().getItem(key);
  if (asyncRouteList?.children?.length > 0) {
    getLastChild(asyncRouteList?.children[5]);
  }
});
</script>
