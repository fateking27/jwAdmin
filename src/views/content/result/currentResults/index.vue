<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入文章标题"
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
      name="成果内容列表"
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
          新增成果
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
          <!--          <template #status="{ row }"></template>-->
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="handlePublish(row)"
              :icon="useRenderIcon(Publish)"
              v-if="hasAuth(['system:dept:add'])"
              :disabled="row.releaseStatus === '1'"
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
              :disabled="row.releaseStatus === '0'"
            >
              撤销
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="
                () => {
                  const arr = row.achievementMaterialUrl?.split('?');
                  handleUpdate({ ...row, achievementMaterialUrlArr: arr });
                }
              "
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
import Form from "./form.vue";
import { hasAuth } from "@/router/utils";
import { message } from "@/utils/message";
import {
  delResult,
  listCurrent,
  releaseResult,
  updateResult
} from "@/api/content/result";
import { PaginationProps } from "@pureadmin/table";
import { ElMessageBox } from "element-plus";

defineOptions({
  name: "currentResults"
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
    label: "分级",
    prop: "rank",
    minWidth: 120
  },
  {
    label: "功能",
    prop: "disasterReduction",
    minWidth: 120
  },
  {
    label: "现状",
    prop: "ecologicalStatus",
    minWidth: 120
  },

  {
    label: "操作",
    fixed: "right",
    slot: "operation"
  }
];

const handleAdd = row => {
  formRef.value.isUpdate = false;
  formRef.value.setData();
  formRef.value.showDrawer = true;
};

function handlePublish(row) {
  row.releaseStatus = 1;
  releaseResult(row.id).then(() => {
    message("发布成功", {
      type: "success"
    });
    onSearch();
  });
}

function handleCancel(row) {
  row.releaseStatus = 0;
  releaseResult(row.id).then(() => {
    message("撤回成功", {
      type: "success"
    });
    onSearch();
  });
}

const handleUpdate = row => {
  // console.log(row);
  formRef.value.isUpdate = true;
  formRef.value.setData(row);
  formRef.value.showDrawer = true;
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
  pagination.pageSize = val;
  form.pageSize = pagination.pageSize;
  onSearch();
};

function handleDelete(row) {
  delResult(row.id).then(() => {
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
      return delResult(ids);
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
  const { rows, total } = await listCurrent(form);
  // console.log(rows)
  dataList.value = rows;
  pagination.total = total;
  loading.value = false;
};

onMounted(() => {
  onSearch();
});
</script>
