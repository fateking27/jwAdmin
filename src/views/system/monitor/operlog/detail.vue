<template>
  <el-drawer
    v-model="showDrawer"
    title="操作日志详情"
    :before-close="handleDrawerClose"
    size="800px"
  >
    <PureDescriptions
      title=""
      align="left"
      :column="2"
      border
      :data="[detailData]"
      :columns="infoColumns"
    >
      <template #status="{ value }">
        <DictTag :options="sys_common_status" :value="value" />
      </template>
      <template #method="{ value }">
        <pre>{{ value }}</pre>
      </template>
      <template #operParam="{ value }">
        <pre>{{ value ? JSON.parse(value) : "" }}</pre>
      </template>
      <template #jsonResult="{ value }">
        <pre>{{ value ? JSON.parse(value) : "" }}</pre>
      </template>
      <template #errorMsg="{ value }">
        <div v-html="value" />
      </template>
    </PureDescriptions>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { selectDictLabel } from "@/utils/ruoyi";
import { useDict } from "@/utils/useDict";
import dayjs from "dayjs";
const showDrawer = ref(false);
const { sys_oper_type, sys_common_status } = useDict(
  "sys_oper_type",
  "sys_common_status"
);

const handleDrawerClose = () => {
  showDrawer.value = false;
};

const infoColumns = [
  {
    label: "操作模块",
    prop: "title",
    labelClassName: "descriptions-label",
    cellRenderer: () => {
      return `${detailData.value.title} / ${typeFormat(detailData.value)}`;
    }
  },
  {
    label: "登录信息",
    prop: "operName",
    labelClassName: "descriptions-label",
    cellRenderer: () => {
      return `${detailData.value.operName} / ${detailData.value.operIp} / ${detailData.value.operLocation}`;
    }
  },
  {
    label: "请求地址",
    prop: "operUrl",
    labelClassName: "descriptions-label"
  },
  {
    label: "请求方式",
    prop: "requestMethod",
    labelClassName: "descriptions-label"
  },
  {
    label: "操作状态",
    prop: "status",
    labelClassName: "descriptions-label",
    slot: "status"
  },
  // {
  //   label: "消耗时间",
  //   prop: "costTime",
  //   labelClassName: "descriptions-label",
  //   cellRenderer: ({ value }) => {
  //     return `${value.costTime}毫秒`;
  //   }
  // },
  {
    label: "操作时间",
    prop: "operTime",
    labelClassName: "descriptions-label",
    cellRenderer: ({ value }) => {
      return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
    }
  },
  {
    label: "异常信息",
    prop: "errorMsg",
    labelClassName: "descriptions-label",
    span: 2,
    slot: "errorMsg",
    hide: () => detailData.value.status === 0
  },
  {
    label: "操作方法",
    prop: "method",
    labelClassName: "descriptions-label",
    span: 2,
    slot: "method"
  },
  {
    label: "请求参数",
    prop: "operParam",
    labelClassName: "descriptions-label",
    span: 2,
    slot: "operParam"
  },
  {
    label: "返回参数",
    prop: "jsonResult",
    labelClassName: "descriptions-label",
    span: 2,
    slot: "jsonResult"
  }
];

/** 操作日志类型字典翻译 */
const typeFormat = row => {
  return selectDictLabel(sys_oper_type.value, row.businessType);
};

const detailData = ref();
const setData = row => {
  detailData.value = row;
};

defineExpose({ showDrawer, setData });
</script>

<style scoped lang="scss">
:deep(.descriptions-label) {
  width: 100px;
}
</style>
