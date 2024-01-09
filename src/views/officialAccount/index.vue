<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="用户id" prop="openid">
        <el-input
          v-model="form.openid"
          placeholder="请输入用户id"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="关注状态：" prop="subscribe">
        <el-input
          v-model="form.subscribe"
          placeholder="请输入关注状态"
          clearable
          @keyup.enter="onSearch"
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

    <PureTableBar
      title="用户列表"
      :tableRef="tableRef?.getTableRef()"
      :columns="columns"
      @refresh="onSearch"
    >
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          border
          align-whole="center"
          showOverflowTooltip
          default-expand-all
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          row-key="id"
          adaptive
        />
      </template>
    </PureTableBar>
    <Form ref="formRef" @reload="onSearch" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";

import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Publish from "@iconify-icons/ep/document";
import Cancel from "@iconify-icons/ep/circle-close";
import dayjs from "dayjs";
import { handleTree } from "@/utils/tree";
import { useDict } from "@/utils/useDict";
// import Form from "./form.vue";
import { hasAuth } from "@/router/utils";
import { message } from "@/utils/message";
import { listUsers } from "@/api/officalAccount/offcialAccount";
import { PaginationProps } from "@pureadmin/table";
import { ElMessageBox } from "element-plus";
import { delNew } from "@/api/content/new";

defineOptions({
  name: "offcialAccount"
});

//const { sys_normal_disable } = useDict("sys_normal_disable");

const searchFormRef = ref();
const tableRef = ref();
const formRef = ref();
const Ids = ref([]);
const multiple = ref(true);

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const form = reactive({
  title: "",
  type: "",
  orderByColumn: undefined,
  isAsc: undefined,
  pageNum: pagination.currentPage,
  pageSize: pagination.pageSize
});

const dataList = ref([]);
const loading = ref(true);

const columns: TableColumnList = [
  {
    label: "用户id",
    prop: "openId",
    align: "left",
    minWidth: 120
  },
  {
    label: "标签",
    prop: "tag",
    width: 120
  },
  {
    label: "关注时间",
    prop: "subscribeTime",
    width: 200,
    slot: "type"
  },
  {
    label: "场景描述",
    prop: "qrSceneStr",
    minWidth: 200
  },
  {
    label: "是否关注",
    prop: "author",
    width: 120
  },
  {
    label: "备注",
    prop: "remark",
    width: 150
  },
  {
    label: "用户语言",
    prop: "language",
    width: 120
  }
];

const handleUpdate = row => {
  formRef.value.isUpdate = true;
  formRef.value.setData(row);
  formRef.value.showDrawer = true;
};

function resetForm(formEl) {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
}

async function onSearch() {
  loading.value = true;
  const { rows } = await listUsers(form);
  dataList.value = rows;
  loading.value = false;
}

onMounted(() => {
  onSearch();
});
</script>
