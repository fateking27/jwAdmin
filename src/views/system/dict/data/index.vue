<template>
  <el-drawer
    v-model="showDrawer"
    title="字典数据"
    :before-close="handleDrawerClose"
    size="90%"
  >
    <div class="main">
      <el-form
        ref="searchFormRef"
        :inline="true"
        :model="form"
        class="bg-bg_color w-[99/100] pl-8 pt-4"
      >
        <el-form-item label="字典名称" prop="dictType">
          <el-select v-model="form.dictType" @change="chaneDictType">
            <el-option
              v-for="item of typeOptions"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictType"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input
            v-model="form.dictLabel"
            placeholder="字典标签"
            clearable
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="form.status"
            placeholder="数据状态"
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

      <el-divider />

      <PureTableBar title="字典列表" :columns="columns" @refresh="onSearch">
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="handleAdd"
            v-if="hasAuth(['system:dict:add'])"
          >
            新增数据
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
            row-key="dictCode"
            adaptive
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
          >
            <template #dictLabel="{ row }">
              <span v-if="row.listClass == '' || row.listClass == 'default'">{{
                row.dictLabel
              }}</span>
              <el-tag
                v-else
                :type="row.listClass == 'primary' ? '' : row.listClass"
                >{{ row.dictLabel }}</el-tag
              >
            </template>
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
                v-if="hasAuth(['system:dict:edit'])"
              >
                修改
              </el-button>
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(Delete)"
                v-if="hasAuth(['system:dict:remove'])"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>

      <Form ref="formRef" :dictType="form.dictType" @reload="getList" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
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
import { isNumber } from "@pureadmin/utils";
import {
  getType,
  optionselect as getDictOptionselect
} from "@/api/system/dict/type";
import { delData, exportData, listData } from "@/api/system/dict/data";
import { ElMessageBox } from "element-plus";
import { useDictStoreHook } from "@/store/modules/dict";

const { sys_normal_disable } = useDict("sys_normal_disable");

const searchFormRef = ref();
const formRef = ref();
const dataList = ref([]);
const loading = ref(true);
const defaultDictType = ref("");
const typeOptions = ref([]);

const showDrawer = ref(false);
const handleDrawerClose = () => {
  showDrawer.value = false;
};

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
  dictLabel: undefined,
  pageNum: pagination.currentPage,
  pageSize: pagination.pageSize
});
const columns: TableColumnList = [
  // {
  //   label: "字典编码",
  //   prop: "dictCode",
  //   minWidth: 100
  // },
  {
    label: "字典标签",
    prop: "dictLabel",
    minWidth: 100,
    slot: "dictLabel"
  },
  {
    label: "字典键值",
    prop: "dictValue",
    minWidth: 80
  },
  {
    label: "字典排序",
    prop: "dictSort",
    minWidth: 80
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
    width: 160,
    slot: "operation"
  }
];

const chaneDictType = val => {
  for (const item of typeOptions.value) {
    if (item.dictType === val) {
      form.dictName = item.dictName;
      break;
    }
  }
  onSearch();
};

const handleAdd = () => {
  formRef.value.setData();
  formRef.value.showDrawer = true;
};

const handleUpdate = row => {
  formRef.value.setData(row);
  formRef.value.showDrawer = true;
};

const handleExport = () => {
  exportData(form);
};

const handleDelete = row => {
  ElMessageBox.confirm(
    `是否确认删除字典标签为 <b>${row.dictLabel}</b> 的数据项？`,
    "系统提示",
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(() => {
      return delData(row.dictCode);
    })
    .then(() => {
      message("删除成功", {
        type: "success"
      });
      onSearch();
      useDictStoreHook().removeDict(form.dictType);
    })
    .catch(() => {});
};

const handleSizeChange = (val: number) => {
  // console.log(`${val} items per page`);
  if (isNumber(val)) {
    pagination.pageSize = val;
    form.pageSize = pagination.pageSize;
    getList();
  }
};

const handleCurrentChange = (val: number) => {
  // console.log(`current page: ${val}`);
  if (isNumber(val)) {
    pagination.currentPage = val;
    form.pageNum = pagination.currentPage;
    getList();
  }
};

const onSearch = () => {
  pagination.currentPage = 1;
  form.pageNum = pagination.currentPage;
  getList();
};

const getTypes = dictId => {
  getType(dictId).then(response => {
    form.dictType = response.data.dictType;
    form.dictName = response.data.dictName;
    defaultDictType.value = response.data.dictType;
    getList();
  });
};

const getTypeList = () =>
  getDictOptionselect().then(response => {
    typeOptions.value = response.data;
  });

const getList = async () => {
  loading.value = true;
  const { rows, total } = await listData(form);
  dataList.value = rows;
  pagination.total = total;
  loading.value = false;
};

const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
  form.dictType = defaultDictType.value;
  onSearch();
};

const setData = row => {
  getTypes(row.dictId);
  getTypeList();
};

defineExpose({ showDrawer, setData });
</script>
