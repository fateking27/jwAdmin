<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="新闻名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入新闻名称"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="新闻类别" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择新闻类别"
          size="default"
        >
          <el-option label="工作动态" value="工作动态" />
          <el-option label="进展成效" value="进展成效" />
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

    <PureTableBar
      title="新闻信息列表"
      :tableRef="tableRef?.getTableRef()"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="handleAdd"
          v-if="hasAuth(['system:dept:add'])"
        >
          新增新闻
        </el-button>
        <el-button
          type="danger"
          plain
          :icon="useRenderIcon(Delete)"
          :disabled="multiple"
          @click="newDelete"
          v-if="hasAuth(['system:dept:remove'])"
        >
          批量删除
        </el-button>
      </template>

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
          :pagination="pagination"
          :paginationSmall="size === 'small'"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          row-key="id"
          adaptive
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <template #content="{ row }">
            <div v-html="row.content" />
          </template>

          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="handlePublish(row)"
              :icon="useRenderIcon(Publish)"
              :disabled="row.releaseStatus === '1'"
              v-if="hasAuth(['system:dept:add'])"
            >
              发布
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="handleCancel(row)"
              :icon="useRenderIcon(Cancel)"
              :disabled="row.releaseStatus === '0'"
              v-if="hasAuth(['system:dept:add'])"
            >
              撤销
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="handleSee(row)"
              :icon="useRenderIcon(View)"
              v-if="hasAuth(['system:dept:add'])"
            >
              查看
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="handleUpdate(row)"
              v-if="hasAuth(['system:dept:edit'])"
            >
              修改
            </el-button>
            <el-popconfirm
              title="是否确认删除?"
              @confirm="handleDelete(row)"
              v-if="hasAuth(['system:dept:remove'])"
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
    <Show ref="showRef" />
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
import View from "@iconify-icons/ep/view";
import Cancel from "@iconify-icons/ep/circle-close";
import Form from "./form.vue";
import { hasAuth } from "@/router/utils";
import { message } from "@/utils/message";
import { delNew, listNew, releaseNew, getNew } from "@/api/content/new";
import { ElMessageBox } from "element-plus";
import { PaginationProps } from "@pureadmin/table";
import Show from "./show.vue";

defineOptions({
  name: "New"
});

const tableRef = ref();
const searchFormRef = ref();
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
  name: "",
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
    type: "selection",
    width: 55,
    align: "left",
    reserveSelection: true
  },
  {
    label: "新闻名称",
    prop: "name",
    align: "left",
    minWidth: 100
  },
  {
    label: "新闻摘要",
    prop: "brief",
    width: 120
  },
  {
    label: "新闻类别",
    prop: "type",
    width: 100,
    slot: "type"
  },
  {
    label: "新闻标签",
    prop: "mark",
    width: 100
  },
  {
    label: "作者",
    prop: "author",
    width: 100
  },
  {
    label: "来源",
    prop: "source",
    width: 120
  },
  {
    label: "新闻内容",
    prop: "content",
    width: 280,
    slot: "content"
  },
  {
    label: "操作",
    fixed: "right",
    slot: "operation"
  }
];

const { VITE_API_PATH } = import.meta.env;
const showRef = ref();
const handleSee = async row => {
  //先根据文件id查询文件详细信息
  const res = await getNew(row.id);
  row.value = res.data;
  row.value.coverMaterialUrl = `${VITE_API_PATH}/static/${res.data.coverMaterialUrl}`;
  await showRef.value.showNew(row);
};

const handleAdd = row => {
  formRef.value.isUpdate = false;
  formRef.value.showDrawer = true;
  formRef.value.setData();
};

function handlePublish(row) {
  row.releaseStatus = 1;
  releaseNew(row.id).then(() => {
    message("发布成功", {
      type: "success"
    });
    getList();
  });
}

function handleCancel(row) {
  row.releaseStatus = 0;
  releaseNew(row.id).then(() => {
    message("撤回成功", {
      type: "success"
    });
    getList();
  });
}
const handleUpdate = row => {
  formRef.value.isUpdate = true;
  formRef.value.showDrawer = true;
  formRef.value.setData(row);
};

const handleSelectionChange = val => {
  Ids.value = val.map(item => item.id);
  multiple.value = !val.length;
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  form.pageNum = pagination.currentPage;
  getList();
};

const handleSortChange = column => {
  form.orderByColumn = column.prop;
  form.isAsc = column.order;
  onSearch();
};

const handleSizeChange = (val: number) => {
  // console.log(`${val} items per page`);
  pagination.pageSize = val;
  form.pageSize = pagination.pageSize;
  onSearch();
};

function handleDelete(row) {
  delNew(row.id).then(() => {
    message("删除成功", {
      type: "success"
    });
    onSearch();
  });
}
const newDelete = row => {
  const ids = row.id || Ids.value;
  ElMessageBox.confirm("是否确认删除所选新闻数据项?", "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      return delNew(ids);
    })
    .then(() => {
      message("删除成功", {
        type: "success"
      });
      tableRef.value.getTableRef().clearSelection();
      onSearch();
    })
    .catch(() => {});
};

function resetForm(formEl) {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
}

async function onSearch() {
  pagination.currentPage = 1;
  form.pageNum = pagination.currentPage;
  getList();
}

const getList = async () => {
  loading.value = true;
  const { rows, total } = await listNew(form);
  dataList.value = rows;
  pagination.total = total;
  loading.value = false;
};

onMounted(() => {
  onSearch();
});
</script>
