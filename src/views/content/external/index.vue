<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="图层名称" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入图层名称"
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
      name="对外服务列表"
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
          新增地图服务
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
          :pagination="pagination"
          row-key="id"
          adaptive
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <!--          <template #status="{ row}"></template>-->
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
    <Form ref="formRef" @reload="onSearch" />
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
import Cancel from "@iconify-icons/ep/circle-close";
import View from "@iconify-icons/ep/view";
import Form from "./form.vue";
import { hasAuth } from "@/router/utils";
import { message } from "@/utils/message";
import {
  delExternal,
  listExternal,
  releaseExternal,
  getExternal
} from "@/api/content/external";
import { PaginationProps } from "@pureadmin/table";
import { ElMessageBox } from "element-plus";
import Show from "./show.vue";

defineOptions({
  name: "external"
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
    label: "图层名称",
    prop: "title",
    minWidth: 100
  },
  {
    label: "投影类型",
    prop: "type",
    width: 120
  },
  {
    label: "来源",
    prop: "source",
    width: 120
  },
  {
    label: "服务地址",
    prop: "content",
    width: 200
  },
  {
    label: "作者",
    prop: "author",
    width: 120
  },
  {
    label: "发布时间",
    prop: "releaseTime",
    width: 200
  },
  {
    label: "操作",
    fixed: "right",
    slot: "operation"
  }
];

const showRef = ref();
const handleSee = async row => {
  //先根据文件id查询文件详细信息
  const res = await getExternal(row.id);
  row.value = res.data;
  await showRef.value.showService(row);
};

const handleAdd = row => {
  formRef.value.isUpdate = false;
  formRef.value.setData();
  formRef.value.showDrawer = true;
};

function handlePublish(row) {
  row.releaseStatus = 1;
  releaseExternal(row.id).then(() => {
    message("发布成功", {
      type: "success"
    });
    onSearch();
  });
}

function handleCancel(row) {
  row.releaseStatus = 0;
  releaseExternal(row.id).then(() => {
    message("撤回成功", {
      type: "success"
    });
    onSearch();
  });
}

const handleUpdate = row => {
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
  delExternal(row.id).then(() => {
    message("删除成功", {
      type: "success"
    });
    onSearch();
  });
}

const newDelete = row => {
  const ids = row.id || Ids.value;
  ElMessageBox.confirm("是否确认删除所选数据项?", "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      return delExternal(ids);
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
  const { rows, total } = await listExternal(form);
  dataList.value = rows;
  pagination.total = total;
  loading.value = false;
  console.log(rows, total);
}

onMounted(() => {
  onSearch();
});
</script>
