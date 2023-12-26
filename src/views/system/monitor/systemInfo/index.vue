<template>
  <div class="main">
    <div
      v-loading="loading"
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="mt-[250px]"
      v-show="loading"
    />
    <div class="monitor-bg" v-if="monitorData">
      <el-descriptions title="系统信息" :column="3" border>
        <template #extra> 当前更新时间：{{ monitorData.time }} </template>
        <el-descriptions-item>
          <template #label> 系统 </template>
          {{ monitorData.sys.os }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label> IP </template>
          {{ monitorData.sys.ip }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label> 项目已不间断运行 </template>
          {{ monitorData.sys.day }}
        </el-descriptions-item>
      </el-descriptions>
      <br />
      <el-descriptions title="CPU" :column="3" border>
        <el-descriptions-item span="3">
          <template #label> 名称 </template>
          {{ monitorData.cpu.name }}：{{ monitorData.cpu.package }}，{{
            monitorData.cpu.core
          }}，{{ monitorData.cpu.logic }}
        </el-descriptions-item>
        <el-descriptions-item span="3">
          <template #label>使用率 </template>
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            :percentage="parseFloat(monitorData.cpu.used)"
          />
        </el-descriptions-item>
      </el-descriptions>
      <br />
      <el-descriptions title="内存信息" :column="3" border>
        <el-descriptions-item>
          <template #label> 总量 </template>
          {{ monitorData.memory.total }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label> 已使用 </template>
          {{ monitorData.memory.used }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label> 空闲 </template>
          {{ monitorData.memory.available }}
        </el-descriptions-item>
        <el-descriptions-item span="3">
          <template #label>使用率 </template>
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            :percentage="parseFloat(monitorData.memory.usageRate)"
          />
        </el-descriptions-item>
      </el-descriptions>
      <br />
      <el-descriptions title="交换区信息" :column="3" border>
        <el-descriptions-item>
          <template #label> 总量 </template>
          {{ monitorData.swap.total }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label> 已使用 </template>
          {{ monitorData.swap.used }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label> 空闲 </template>
          {{ monitorData.swap.available }}
        </el-descriptions-item>
        <el-descriptions-item span="3">
          <template #label>使用率 </template>
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            :percentage="parseFloat(monitorData.swap.usageRate)"
          />
        </el-descriptions-item>
      </el-descriptions>
      <br />
      <el-descriptions title="磁盘信息" :column="3" border>
        <el-descriptions-item>
          <template #label> 总量 </template>
          {{ monitorData.disk.total }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label> 已使用 </template>
          {{ monitorData.disk.used }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label> 空闲 </template>
          {{ monitorData.disk.available }}
        </el-descriptions-item>
        <el-descriptions-item span="3">
          <template #label>使用率 </template>
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            :percentage="parseFloat(monitorData.disk.usageRate)"
          />
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getSystemInfo } from "@/api/system/monitor/systemInfo";

defineOptions({
  name: "SystemInfo"
});

const loading = ref(false);
const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;

const monitorData = ref();
const getList = async () => {
  loading.value = true;
  getSystemInfo()
    .then(res => {
      monitorData.value = res?.data;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.monitor-bg {
  padding: 20px;
  background: #fff;

  :deep(.el-descriptions__label.el-descriptions__cell.is-bordered-label) {
    width: 200px;
  }

  :deep(
      .el-descriptions__body
        .el-descriptions__table.is-bordered
        .el-descriptions__cell
    ) {
    min-width: 200px;
  }
}
</style>
