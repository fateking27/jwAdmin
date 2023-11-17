<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="form.deptName"
          placeholder="请输入部门名称"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择状态"
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

    <PureTableBar
      title="部门列表"
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
          新增部门
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
          row-key="deptId"
          adaptive
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
              v-if="hasAuth(['system:dept:edit'])"
            >
              修改
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="handleAdd(row)"
              :icon="useRenderIcon(AddFill)"
              v-if="hasAuth(['system:dept:add'])"
            >
              新增
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
import dayjs from "dayjs";
import { handleTree } from "@/utils/tree";
import { delDept, listDept } from "@/api/system/dept";
import { useDict } from "@/utils/useDict";
import Form from "./form.vue";
import { hasAuth } from "@/router/utils";
import { message } from "@/utils/message";

defineOptions({
  name: "Dept"
});

const { sys_normal_disable } = useDict("sys_normal_disable");

const searchFormRef = ref();
const tableRef = ref();
const formRef = ref();

const form = reactive({
  deptName: "",
  status: ""
});
const dataList = ref([]);
const loading = ref(true);

const columns: TableColumnList = [
  {
    label: "部门名称",
    prop: "deptName",
    align: "left"
  },
  {
    label: "排序",
    prop: "orderNum",
    width: 100
  },
  {
    label: "状态",
    prop: "status",
    width: 120,
    slot: "status"
  },
  {
    label: "创建时间",
    width: 200,
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

const handleAdd = row => {
  formRef.value.isUpdate = false;
  formRef.value.setData(row);
  formRef.value.showDrawer = true;
};

const handleUpdate = row => {
  formRef.value.isUpdate = true;
  formRef.value.setData(row);
  formRef.value.showDrawer = true;
};

function handleDelete(row) {
  delDept(row.deptId).then(() => {
    message("删除成功", {
      type: "success"
    });
    onSearch();
  });
}

function resetForm(formEl) {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
}

async function onSearch() {
  loading.value = true;
  const { data } = await listDept(form);
  dataList.value = handleTree(data, "deptId");
  loading.value = false;
}

onMounted(() => {
  onSearch();
});
</script>
