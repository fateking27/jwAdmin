<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="字典名称" prop="dictName">
        <el-input
          v-model="form.dictName"
          placeholder="字典名称"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input
          v-model="form.dictType"
          placeholder="字典类型"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="字典状态"
          clearable
          @change="onSearch"
        >
          <el-option
            v-for="dict of sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
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

    <PureTableBar title="字典列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="handleAdd"
          v-if="hasAuth(['system:dict:add'])"
        >
          新增字典
        </el-button>
        <el-button
          type="primary"
          plain
          :icon="useRenderIcon(Download)"
          @click="handleExport"
          v-if="hasAuth(['system:dict:export'])"
        >
          导出
        </el-button>
        <el-button
          type="danger"
          plain
          :icon="useRenderIcon(Refresh)"
          @click="handleRefreshCache"
          v-if="hasAuth(['system:dict:remove'])"
        >
          刷新缓存
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
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
          row-key="dictId"
          adaptive
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <DictTag :options="sys_normal_disable" :value="row.status" />
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(List)"
              @click="handleDictData(row)"
            >
              数据
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="handleUpdate(row)"
              v-if="hasAuth(['system:dict:edit'])"
            >
              修改
            </el-button>
            <el-popconfirm
              title="是否确认删除?"
              v-if="hasAuth(['system:dict:remove'])"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <Form ref="formRef" @reload="getList" />
    <DataIndex ref="dataIndexRef" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDict } from "@/utils/useDict";
import { PaginationProps } from "@pureadmin/table";
import dayjs from "dayjs";
import { message } from "@/utils/message";
import { hasAuth } from "@/router/utils";
import Form from "./form.vue";
import DataIndex from "./data/index.vue";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Download from "@iconify-icons/ep/download";
import List from "@iconify-icons/ep/list";
import { addDateRange } from "@/utils/ruoyi";
import {
  delType,
  exportType,
  listType,
  refreshCache
} from "@/api/system/dict/type";
import { useDictStoreHook } from "@/store/modules/dict";

defineOptions({
  name: "Dict"
});

const { sys_normal_disable } = useDict("sys_normal_disable");

const searchFormRef = ref();
const formRef = ref();
const dataIndexRef = ref();
const dataList = ref([]);
const loading = ref(true);
const dateRange = ref();

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const form = reactive({
  dictName: undefined,
  dictType: undefined,
  status: undefined,
  pageNum: pagination.currentPage,
  pageSize: pagination.pageSize
});
const columns: TableColumnList = [
  {
    label: "字典名称",
    prop: "dictName",
    minWidth: 100
  },
  {
    label: "字典编号",
    prop: "dictId",
    minWidth: 80
  },
  {
    label: "字典类型",
    prop: "dictType",
    minWidth: 150
  },
  {
    label: "状态",
    prop: "status",
    width: 100,
    slot: "status"
  },
  {
    label: "备注",
    prop: "remark",
    minWidth: 100
  },
  {
    label: "创建时间",
    width: 180,
    prop: "createTime",
    formatter: ({ createTime }) =>
      dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
  },
  {
    label: "操作",
    fixed: "right",
    width: 210,
    slot: "operation"
  }
];

const handleAdd = () => {
  formRef.value.setData();
  formRef.value.showDrawer = true;
};

const handleUpdate = row => {
  formRef.value.setData(row);
  formRef.value.showDrawer = true;
};

const handleExport = () => {
  exportType(form);
};

const handleRefreshCache = () => {
  refreshCache().then(() => {
    message("刷新成功", {
      type: "success"
    });
    useDictStoreHook().cleanDict();
  });
};

const handleDelete = row => {
  delType(row.dictId).then(() => {
    message("删除成功", {
      type: "success"
    });
    onSearch();
  });
};

const handleDictData = row => {
  dataIndexRef.value.setData(row);
  dataIndexRef.value.showDrawer = true;
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

const onSearch = () => {
  pagination.currentPage = 1;
  form.pageNum = pagination.currentPage;
  getList();
};

const getList = async () => {
  loading.value = true;
  const { rows, total } = await listType(addDateRange(form, dateRange.value));
  dataList.value = rows;
  pagination.total = total;
  loading.value = false;
};

const resetForm = formEl => {
  if (!formEl) return;
  dateRange.value = [];
  formEl.resetFields();
  onSearch();
};

onMounted(() => {
  getList();
});
</script>
