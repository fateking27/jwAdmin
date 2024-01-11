<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="标题：" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入标题"
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
      name="视频素材列表"
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
          新增视频
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
        >
          <template #cover="{ row }">
            <el-image
              :src="row.imagePath"
              v-if="row.showCoverPic === '1'"
              style="width: 100px; height: 100px"
            />
            <div v-if="row.showCoverPic === '0'" />
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { handleTree } from "@/utils/tree";
import { useDict } from "@/utils/useDict";
import Form from "./form.vue";
import { hasAuth } from "@/router/utils";
import { message } from "@/utils/message";
// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
import { listVedio, delVedio } from "@/api/material/vedio";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { listPost } from "@/api/system/post";

defineOptions({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: "Vedio"
});

//const { sys_normal_disable } = useDict("sys_normal_disable");

const searchFormRef = ref();
const tableRef = ref();
const formRef = ref();

const form = reactive({
  title: ""
});
const dataList = ref([]);
const loading = ref(true);

const columns: TableColumnList = [
  {
    label: "标题",
    prop: "title",
    align: "left",
    minWidth: 120
  },
  {
    label: "视频封面",
    prop: "showCoverPic",
    width: 300,
    slot: "cover"
  },
  {
    label: "视频链接",
    prop: "url",
    width: 300
    /*    slot: "type"*/
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
  formRef.value.setData();
  formRef.value.showDrawer = true;
};

const handleUpdate = row => {
  formRef.value.isUpdate = true;
  formRef.value.setData(row);
  formRef.value.showDrawer = true;
};

function handleDelete(row) {
  delVedio(row.id).then(() => {
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
  const { rows } = await listVedio(form);
  dataList.value = rows;
  loading.value = false;
}

onMounted(() => {
  onSearch();
});
</script>
