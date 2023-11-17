<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="系统模块" prop="title">
        <el-input
          v-model="form.title"
          placeholder="系统模块"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="操作人员" prop="operName">
        <el-input
          v-model="form.operName"
          placeholder="操作人员"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="类型" prop="businessType">
        <el-select
          v-model="form.businessType"
          placeholder="操作类型"
          clearable
          @change="onSearch"
        >
          <el-option
            v-for="dict of sys_oper_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="操作状态"
          clearable
          @change="onSearch"
        >
          <el-option
            v-for="dict of sys_common_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="操作时间">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="onSearch"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button
          :icon="useRenderIcon(Refresh)"
          @click="resetForm(searchFormRef)"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="操作日志列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="danger"
          plain
          :icon="useRenderIcon(Delete)"
          :disabled="multiple"
          @click="handleDelete"
          v-if="hasAuth(['monitor:operlog:remove'])"
        >
          删除
        </el-button>
        <el-button
          type="danger"
          plain
          :icon="useRenderIcon(Delete)"
          @click="handleClean"
          v-if="hasAuth(['monitor:operlog:remove'])"
        >
          清空
        </el-button>
        <el-button
          type="primary"
          plain
          :icon="useRenderIcon(Download)"
          @click="handleExport"
          v-if="hasAuth(['monitor:operlog:export'])"
        >
          导出
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="operlogRef"
          border
          align-whole="center"
          showOverflowTooltip
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small'"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          row-key="operId"
          adaptive
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <template #businessType="{ row }">
            <DictTag :options="sys_oper_type" :value="row.businessType" />
          </template>

          <template #status="{ row }">
            <DictTag :options="sys_common_status" :value="row.status" />
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(View)"
              @click="handleView(row)"
              v-if="hasAuth(['monitor:operlog:query'])"
            >
              详情
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <Detail ref="detailRef" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDict } from "@/utils/useDict";
import { PaginationProps } from "@pureadmin/table";
import dayjs from "dayjs";
import { hasAuth } from "@/router/utils";
import Detail from "./detail.vue";

import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import Download from "@iconify-icons/ep/download";
import View from "@iconify-icons/ep/view";
import Delete from "@iconify-icons/ep/delete";
import { addDateRange } from "@/utils/ruoyi";
import {
  cleanOperlog,
  delOperlog,
  exportOperlog,
  listOperlog
} from "@/api/system/monitor/operlog";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";

defineOptions({
  name: "Operlog"
});

const { sys_oper_type, sys_common_status } = useDict(
  "sys_oper_type",
  "sys_common_status"
);

const operlogRef = ref();
const searchFormRef = ref();

const detailRef = ref();
const dataList = ref([]);
const loading = ref(true);
const dateRange = ref();
const multiple = ref(true);
const Ids = ref([]);

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const form = reactive({
  title: undefined,
  operName: undefined,
  businessType: undefined,
  status: undefined,
  orderByColumn: undefined,
  isAsc: undefined,
  pageNum: pagination.currentPage,
  pageSize: pagination.pageSize
});
const columns: TableColumnList = [
  {
    type: "selection",
    width: 55,
    align: "left",
    reserveSelection: true
  },
  // {
  //   label: "日志编号",
  //   prop: "operId"
  // },
  {
    label: "系统模块",
    prop: "title"
  },
  {
    label: "操作类型",
    prop: "businessType",
    slot: "businessType"
  },
  {
    label: "操作人员",
    prop: "operName",
    sortable: "custom",
    sortOrders: ["descending", "ascending"]
  },
  {
    label: "主机",
    prop: "operIp"
  },
  {
    label: "操作状态",
    prop: "status",
    slot: "status"
  },
  {
    label: "操作日期",
    width: 180,
    prop: "operTime",
    sortable: "custom",
    sortOrders: ["descending", "ascending"],
    formatter: ({ operTime }) => dayjs(operTime).format("YYYY-MM-DD HH:mm:ss")
  },
  // {
  //   label: "消耗时间",
  //   width: 110,
  //   prop: "costTime",
  //   sortable: "custom",
  //   sortOrders: ["descending", "ascending"],
  //   formatter: ({ costTime }) => `${costTime ? costTime : ""}毫秒`
  // },
  {
    label: "操作",
    fixed: "right",
    width: 100,
    slot: "operation"
  }
];

const defaultSort = ref({ prop: "operTime", order: "descending" });

const handleSortChange = column => {
  form.orderByColumn = column.prop;
  form.isAsc = column.order;
  getList();
};

const handleView = row => {
  detailRef.value.setData(row);
  detailRef.value.showDrawer = true;
};

const handleExport = () => {
  exportOperlog(form);
};

const handleClean = () => {
  ElMessageBox.confirm("是否确认清空所有操作日志数据项?", "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      return cleanOperlog();
    })
    .then(() => {
      message("清空成功", {
        type: "success"
      });
      operlogRef.value.getTableRef().clearSelection();
      getList();
    })
    .catch(() => {});
};

const handleSizeChange = (val: number) => {
  // console.log(`${val} items per page`);
  pagination.pageSize = val;
  form.pageSize = pagination.pageSize;
  getList();
};

const handleCurrentChange = (val: number) => {
  // console.log(`current page: ${val}`);
  pagination.currentPage = val;
  form.pageNum = pagination.currentPage;
  getList();
};

const handleDelete = row => {
  const operIds = row.operId || Ids.value;
  ElMessageBox.confirm("是否确认删除所选操作日志数据项?", "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      return delOperlog(operIds);
    })
    .then(() => {
      message("删除成功", {
        type: "success"
      });
      operlogRef.value.getTableRef().clearSelection();
      getList();
    })
    .catch(() => {});
};

const handleSelectionChange = val => {
  Ids.value = val.map(item => item.operId);
  multiple.value = !val.length;
};

const onSearch = () => {
  pagination.currentPage = 1;
  form.pageNum = pagination.currentPage;
  getList();
};

const getList = async () => {
  loading.value = true;
  const { rows, total } = await listOperlog(
    addDateRange(form, dateRange.value)
  );
  dataList.value = rows;
  pagination.total = total;
  loading.value = false;
};

const resetForm = formEl => {
  if (!formEl) return;
  dateRange.value = [];
  formEl.resetFields();
  operlogRef.value
    .getTableRef()
    .sort(defaultSort.value.prop, defaultSort.value.order);
  onSearch();
};

onMounted(() => {
  getList();
});
</script>
