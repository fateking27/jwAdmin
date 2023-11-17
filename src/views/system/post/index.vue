<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="岗位编码" prop="postCode">
        <el-input
          v-model="form.postCode"
          placeholder="岗位编码"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="岗位名称" prop="postName">
        <el-input
          v-model="form.postName"
          placeholder="岗位名称"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="岗位状态"
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

    <PureTableBar title="岗位列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="handleAdd"
          v-if="hasAuth(['system:post:add'])"
        >
          新增岗位
        </el-button>
        <el-button
          type="primary"
          plain
          :icon="useRenderIcon(Download)"
          @click="handleExport"
          v-if="hasAuth(['system:post:export'])"
        >
          导出
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
          row-key="postId"
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
              :icon="useRenderIcon(EditPen)"
              @click="handleUpdate(row)"
              v-if="hasAuth(['system:post:edit'])"
            >
              修改
            </el-button>
            <el-popconfirm
              title="是否确认删除?"
              v-if="hasAuth(['system:post:remove'])"
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

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Download from "@iconify-icons/ep/download";
import { delPost, exportPost, listPost } from "@/api/system/post";

defineOptions({
  name: "Post"
});

const { sys_normal_disable } = useDict("sys_normal_disable");

const searchFormRef = ref();
const formRef = ref();
const dataList = ref([]);
const loading = ref(true);

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const form = reactive({
  postCode: undefined,
  postName: undefined,
  status: undefined,
  pageNum: pagination.currentPage,
  pageSize: pagination.pageSize
});
const columns: TableColumnList = [
  // {
  //   label: "岗位编号",
  //   prop: "postId",
  //   minWidth: 120
  // },
  {
    label: "岗位名称",
    prop: "postName",
    minWidth: 150
  },
  {
    label: "岗位编码",
    prop: "postCode",
    minWidth: 150
  },
  {
    label: "岗位顺序",
    prop: "postSort",
    minWidth: 100
  },
  {
    label: "状态",
    prop: "status",
    width: 100,
    slot: "status"
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
    width: 160,
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
  exportPost(form);
};

const handleDelete = row => {
  delPost(row.postId).then(() => {
    message("删除成功", {
      type: "success"
    });
    onSearch();
  });
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
  const { rows, total } = await listPost(form);
  dataList.value = rows;
  pagination.total = total;
  loading.value = false;
};

const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

onMounted(() => {
  getList();
});
</script>
