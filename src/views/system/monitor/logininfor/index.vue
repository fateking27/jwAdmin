<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input
          v-model="form.ipaddr"
          placeholder="登录地址"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="form.userName"
          placeholder="操作人员"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="登录状态"
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

      <el-form-item label="登录时间">
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

    <PureTableBar title="登录日志列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="danger"
          plain
          :icon="useRenderIcon(Delete)"
          :disabled="multiple"
          @click="handleDelete"
          v-if="hasAuth(['monitor:logininfor:remove'])"
        >
          删除
        </el-button>
        <el-button
          type="danger"
          plain
          :icon="useRenderIcon(Delete)"
          @click="handleClean"
          v-if="hasAuth(['monitor:logininfor:remove'])"
        >
          清空
        </el-button>
        <el-button
          type="warning"
          plain
          :icon="useRenderIcon(Unlock)"
          :disabled="single"
          @click="handleUnlock"
          v-if="hasAuth(['monitor:logininfor:unlock'])"
        >
          解锁
        </el-button>
        <el-button
          type="primary"
          plain
          :icon="useRenderIcon(Download)"
          @click="handleExport"
          v-if="hasAuth(['monitor:logininfor:export'])"
        >
          导出
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="logininforRef"
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
          row-key="infoId"
          adaptive
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <template #status="{ row }">
            <DictTag :options="sys_common_status" :value="row.status" />
          </template>
        </pure-table>
      </template>
    </PureTableBar>
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

import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import Download from "@iconify-icons/ep/download";
import Delete from "@iconify-icons/ep/delete";
import Unlock from "@iconify-icons/ep/unlock";

import { addDateRange } from "@/utils/ruoyi";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  cleanLogininfor,
  delLogininfor,
  exportLogininfor,
  listLogininfor,
  unlockLogininfor
} from "@/api/system/monitor/logininfor";

defineOptions({
  name: "Logininfor"
});

const { sys_common_status } = useDict("sys_common_status");

const logininforRef = ref();
const searchFormRef = ref();

const dataList = ref([]);
const loading = ref(true);
const dateRange = ref();
const multiple = ref(true);
const ids = ref([]);
const single = ref(true);
const selectName = ref("");

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const form = reactive({
  ipaddr: undefined,
  userName: undefined,
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
  //   label: "访问编号",
  //   prop: "infoId"
  // },
  {
    label: "用户名称",
    prop: "userName",
    sortable: "custom",
    sortOrders: ["descending", "ascending"]
  },
  {
    label: "地址",
    prop: "ipaddr"
  },
  {
    label: "登录地点",
    prop: "loginLocation"
  },
  {
    label: "操作系统",
    prop: "os"
  },
  {
    label: "浏览器",
    prop: "browser"
  },
  {
    label: "登录状态",
    prop: "status",
    slot: "status"
  },
  {
    label: "描述",
    prop: "msg"
  },
  {
    label: "访问时间",
    width: 180,
    prop: "loginTime",
    sortable: "custom",
    sortOrders: ["descending", "ascending"],
    formatter: ({ loginTime }) => dayjs(loginTime).format("YYYY-MM-DD HH:mm:ss")
  }
];

const defaultSort = ref({ prop: "loginTime", order: "descending" });

const handleSortChange = column => {
  form.orderByColumn = column.prop;
  form.isAsc = column.order;
  getList();
};

const handleExport = () => {
  exportLogininfor(form);
};

const handleClean = () => {
  ElMessageBox.confirm("是否确认清空所有登录日志数据项?", "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      return cleanLogininfor();
    })
    .then(() => {
      message("清空成功", {
        type: "success"
      });
      logininforRef.value.getTableRef().clearSelection();
      getList();
    })
    .catch(() => {});
};

const handleUnlock = () => {
  const username = selectName.value;
  ElMessageBox.confirm(
    `是否确认解锁用户 <b>${username}</b> 数据项`,
    "系统提示",
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(() => {
      return unlockLogininfor(username);
    })
    .then(() => {
      message(`用户 <b>${username}</b> 解锁成功`, {
        dangerouslyUseHTMLString: true,
        type: "success"
      });
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
  const infoIds = row.infoId || ids.value;
  ElMessageBox.confirm("是否确认删除所选访问日志数据项?", "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      return delLogininfor(infoIds);
    })
    .then(() => {
      message("删除成功", {
        type: "success"
      });
      logininforRef.value.getTableRef().clearSelection();
      getList();
    })
    .catch(() => {});
};

const handleSelectionChange = val => {
  ids.value = val.map(item => item.infoId);
  multiple.value = !val.length;
  single.value = val.length != 1;
  selectName.value = val.map(item => item.userName);
};

const onSearch = () => {
  pagination.currentPage = 1;
  form.pageNum = pagination.currentPage;
  getList();
};

const getList = async () => {
  loading.value = true;
  const { rows, total } = await listLogininfor(
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
  logininforRef.value
    .getTableRef()
    .sort(defaultSort.value.prop, defaultSort.value.order);
  onSearch();
};

onMounted(() => {
  getList();
});
</script>
