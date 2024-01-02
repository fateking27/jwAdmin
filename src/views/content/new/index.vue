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
          <!--          <template #status="{ row }" />-->
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="handlePublish(row)"
              :icon="useRenderIcon(Publish)"
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
              v-if="hasAuth(['system:dept:add'])"
            >
              撤销
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
import Form from "./form.vue";
import { hasAuth } from "@/router/utils";
import { message } from "@/utils/message";
import {
  delNew,
  getNew,
  listNew,
  releaseNew,
  updateNew
} from "@/api/content/new";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { listPost } from "@/api/system/post";
import { ElMessageBox } from "element-plus";
import { cleanOperlog, delOperlog } from "@/api/system/monitor/operlog";
import { PaginationProps } from "@pureadmin/table";

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
    minWidth: 120
  },
  {
    label: "新闻摘要",
    prop: "brief",
    width: 120
  },
  {
    label: "新闻类别",
    prop: "type",
    width: 120,
    slot: "type"
  },
  {
    label: "新闻标签",
    prop: "mark",
    width: 120
  },
  {
    label: "作者",
    prop: "author",
    width: 120
  },
  {
    label: "新闻内容",
    prop: "content",
    width: 120
  },
  {
    label: "操作",
    fixed: "right",
    width: 330,
    slot: "operation"
  }
];

const handleAdd = row => {
  formRef.value.isUpdate = false;
  formRef.value.showDrawer = true;
  formRef.value.setData();
};

function handlePublish(row) {
  row.release_status = 1;
  releaseNew(row.id).then(() => {
    message("发布成功", {
      type: "success"
    });
    onSearch();
  });
}

function handleCancel(row) {
  row.release_status = 0;
  releaseNew(row.id).then(() => {
    message("撤回成功", {
      type: "success"
    });
    onSearch();
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
  onSearch();
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
  loading.value = true;
  const { rows } = await listNew(form);
  dataList.value = rows;
  loading.value = false;
}

onMounted(() => {
  onSearch();
});
</script>
