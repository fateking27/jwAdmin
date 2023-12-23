<!--suppress ALL -->
<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-[99/100] pl-8 pt-4"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="form.roleName"
          placeholder="角色名称"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="form.roleKey"
          placeholder="权限字符"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="角色状态"
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

    <PureTableBar title="角色列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="handleAdd"
          v-if="hasAuth(['system:role:add'])"
        >
          新增角色
        </el-button>
        <el-button
          type="primary"
          plain
          :icon="useRenderIcon(Download)"
          @click="handleExport"
          v-if="hasAuth(['system:role:export'])"
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
          row-key="roleId"
          adaptive
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #status="{ row }">
            <el-switch
              v-model="row.status"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(row)"
              v-if="row.roleId !== 1"
            />
            <DictTag
              :options="sys_normal_disable"
              :value="row.status"
              v-if="row.roleId === 1"
            />
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(Database)"
              v-if="hasAuth(['system:role:edit']) && row.roleId !== 1"
              @click="handleDataScope(row)"
            >
              数据权限
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(User)"
              v-if="hasAuth(['system:role:edit']) && row.roleId !== 1"
              @click="handleAuthUser(row)"
            >
              分配用户
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="handleUpdate(row)"
              v-if="hasAuth(['system:role:edit']) && row.roleId !== 1"
            >
              修改
            </el-button>
            <el-popconfirm
              title="是否确认删除?"
              v-if="hasAuth(['system:role:remove']) && row.roleId !== 1"
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
    <DataScope ref="dataScopeRef" />
    <AuthUser ref="authUserRef" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDict } from "@/utils/useDict";
import { PaginationProps } from "@pureadmin/table";
import dayjs from "dayjs";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  changeRoleStatus,
  delRole,
  exportRole,
  listRole
} from "@/api/system/role";
import { addDateRange } from "@/utils/ruoyi";
import { hasAuth } from "@/router/utils";
import Form from "./form.vue";
import DataScope from "./dataScope.vue";
import AuthUser from "./authUser.vue";

import Database from "@iconify-icons/ri/database-2-line";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import User from "@iconify-icons/ep/user";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Download from "@iconify-icons/ep/download";

defineOptions({
  name: "Role"
});

const { sys_normal_disable } = useDict("sys_normal_disable");

const searchFormRef = ref();
const formRef = ref();
const dataScopeRef = ref();
const authUserRef = ref();
const dateRange = ref();
const dataList = ref([]);
const loading = ref(true);

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const form = reactive({
  roleName: "",
  roleKey: "",
  status: "",
  pageNum: pagination.currentPage,
  pageSize: pagination.pageSize
});
const columns: TableColumnList = [
  // {
  //   label: "角色编号",
  //   prop: "roleId",
  //   minWidth: 120
  // },
  {
    label: "角色名称",
    prop: "roleName",
    minWidth: 150
  },
  {
    label: "权限字符",
    prop: "roleKey",
    minWidth: 150
  },
  {
    label: "显示顺序",
    prop: "roleSort",
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
    width: 330,
    slot: "operation"
  }
];

/** 角色状态修改 */
const handleStatusChange = row => {
  const text = row.status === "0" ? "启用" : "停用";
  ElMessageBox.confirm(
    `确认要${text} <b>${row.roleName}</b> 角色吗?`,
    "系统提示",
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(() => {
      return changeRoleStatus(row.roleId, row.status);
    })
    .then(() => {
      message(`${text}成功`, {
        type: "success"
      });
    })
    .catch(() => {
      row.status = row.status === "0" ? "1" : "0";
    });
};

const handleAdd = () => {
  formRef.value.setData();
  formRef.value.showDrawer = true;
};

const handleUpdate = row => {
  formRef.value.setData(row);
  formRef.value.showDrawer = true;
};

const handleDataScope = row => {
  dataScopeRef.value.setData(row);
  dataScopeRef.value.showDrawer = true;
};

const handleAuthUser = row => {
  authUserRef.value.setData(row);
  authUserRef.value.showDrawer = true;
};

const handleExport = () => {
  exportRole(form);
};

const handleDelete = row => {
  delRole(row.roleId).then(() => {
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
  const { rows, total } = await listRole(addDateRange(form, dateRange.value));
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
